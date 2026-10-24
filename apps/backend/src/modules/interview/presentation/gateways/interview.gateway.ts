import { verifyToken } from '@clerk/backend';
import { HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { type Namespace, type Socket } from 'socket.io';

import { Env } from '@/libs/configs/env.config';
import { formatError } from '@/libs/utils/format-error.util';
import {
  InterviewEvaluationService,
  InterviewService,
} from '@/modules/interview/application/services';
import { StartInterviewDto } from '@/modules/interview/presentation/dtos';
import { UserService } from '@/modules/user/application/services/user.service';
import { type User } from '@/modules/user/domain';

/** About 1 s of 16 kHz 16-bit audio; the client sends ~250 ms chunks. */
const MAX_AUDIO_CHUNK_BYTES = 32_000;

interface SocketData {
  user: User;
}

/**
 * The voice mock interview over Socket.IO (`/interview`): the browser
 * streams its microphone up and plays the interviewer's audio coming down.
 * Sockets authenticate once, in the handshake, with the Clerk session token.
 *
 * Client -> server: `interview:start` (StartInterviewDto), `interview:audio`
 * (binary 16 kHz PCM), `interview:playback-complete`, `interview:stop`.
 * Server -> client: `interview:started`, `interview:audio` (binary 24 kHz
 * PCM), `interview:turn-complete`, `interview:caption`, `interview:interrupted`, `interview:evaluating`,
 * `interview:feedback`, `interview:session-lost`, `interview:error`.
 */
// Audio arrives several times a second; the HTTP rate limit doesn't fit
@SkipThrottle()
@WebSocketGateway({ namespace: '/interview' })
export class InterviewGateway implements OnGatewayInit, OnGatewayDisconnect {
  private readonly logger = new Logger(InterviewGateway.name);
  /** Socket id -> interview session id (one interview per socket). */
  private readonly sessions = new Map<string, string>();

  constructor(
    private readonly interviewService: InterviewService,
    private readonly evaluationService: InterviewEvaluationService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticates in the handshake, so the user is known before any
   * message handler runs. The HTTP ClerkAuthGuard skips WebSockets.
   */
  afterInit(server: Namespace): void {
    server.use((socket, next) => {
      this.authenticate(socket)
        .then((user) => {
          Object.assign(socket.data as SocketData, { user });
          next();
        })
        .catch((error: unknown) =>
          next(error instanceof Error ? error : new Error('Unauthorized')),
        );
    });
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const sessionId = this.sessions.get(client.id);
    if (!sessionId) return;
    this.sessions.delete(client.id);
    // Not scored: the candidate left
    await this.interviewService.cancel(sessionId);
  }

  @SubscribeMessage('interview:start')
  async start(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<void> {
    if (this.sessions.has(client.id)) {
      this.emitError(client, 'An interview is already in progress.');
      return;
    }
    const dto = plainToInstance(StartInterviewDto, body ?? {});
    const errors = await validate(dto, { whitelist: true });
    if (errors.length) {
      this.emitError(client, formatError(errors)[0] ?? 'Invalid settings.');
      return;
    }

    const { user } = client.data as SocketData;
    try {
      const session = await this.interviewService.start(
        {
          userId: user.id,
          socketId: client.id,
          resume: dto.resume,
          jobDescription: dto.jobDescription,
          interviewType: dto.interviewType,
          questionCount: dto.questionCount,
          voiceName: dto.voiceName,
          language: dto.language,
          pace: dto.pace,
        },
        {
          onAudio: (chunk) => client.emit('interview:audio', chunk),
          onTurnComplete: (turn) =>
            client.emit('interview:turn-complete', turn),
          onInterrupted: () => client.emit('interview:interrupted'),
          onCaption: (text) => client.emit('interview:caption', { text }),
          onComplete: () => void this.finish(client),
          onSessionLost: (message) => {
            this.sessions.delete(client.id);
            client.emit('interview:session-lost', { message });
          },
        },
      );
      // Left while the session was opening
      if (client.disconnected) {
        await this.interviewService.cancel(session.id);
        return;
      }
      this.sessions.set(client.id, session.id);
      client.emit('interview:started', {
        sessionId: session.id,
        totalQuestions: session.totalQuestions,
      });
    } catch (error) {
      this.emitError(
        client,
        error,
        "We couldn't start the interview. Please try again.",
      );
    }
  }

  @SubscribeMessage('interview:audio')
  audio(@ConnectedSocket() client: Socket, @MessageBody() data: unknown): void {
    const sessionId = this.sessions.get(client.id);
    if (
      !sessionId ||
      !Buffer.isBuffer(data) ||
      data.length === 0 ||
      data.length > MAX_AUDIO_CHUNK_BYTES
    ) {
      return;
    }
    this.interviewService.handleAudio(sessionId, data);
  }

  @SubscribeMessage('interview:playback-complete')
  playbackComplete(@ConnectedSocket() client: Socket): void {
    const sessionId = this.sessions.get(client.id);
    if (sessionId) this.interviewService.handlePlaybackComplete(sessionId);
  }

  @SubscribeMessage('interview:stop')
  async stop(@ConnectedSocket() client: Socket): Promise<void> {
    await this.finish(client);
  }

  /** Ends the live part, then scores the transcript. */
  private async finish(client: Socket) {
    const sessionId = this.sessions.get(client.id);
    if (!sessionId) return;
    const session = await this.interviewService.end(sessionId);
    if (!session) return;

    client.emit('interview:evaluating');
    try {
      const feedback = await this.evaluationService.evaluate(session);
      await this.interviewService.saveRecord(session, feedback);
      client.emit('interview:feedback', feedback);
    } catch (error) {
      await this.interviewService.saveRecord(session);
      this.emitError(
        client,
        error,
        "We couldn't score this interview. Please try again.",
      );
    } finally {
      this.sessions.delete(client.id);
    }
  }

  private async authenticate(socket: Socket): Promise<User> {
    const auth = socket.handshake.auth as { token?: unknown };
    if (typeof auth.token !== 'string' || !auth.token) {
      throw new Error('Unauthorized');
    }
    let providerId: string | undefined;
    try {
      const payload = await verifyToken(auth.token, {
        secretKey: this.configService.getOrThrow(Env.CLERK_SECRET_KEY),
      });
      providerId = payload.sub;
    } catch (error) {
      this.logger.debug(
        `Socket token rejected: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (!providerId) throw new Error('Unauthorized');

    // The Clerk id maps to our user; resumes and limits are by our id
    const user = await this.userService.findByProviderId(providerId);
    if (!user) {
      throw new Error(
        'Your account is still being set up. Please try again in a moment.',
      );
    }
    return user;
  }

  /**
   * Sends the candidate a readable error. HTTP exceptions carry one;
   * anything else is unexpected, logged here (the HTTP exception filter
   * doesn't see WebSocket handlers) and replaced by the fallback.
   */
  private emitError(client: Socket, error: unknown, fallback?: string) {
    let message: string;
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof HttpException && error.getStatus() < 500) {
      message = error.message;
    } else {
      this.logger.error(
        fallback ?? 'Interview error',
        error instanceof Error ? error.stack : String(error),
      );
      message = fallback ?? 'Something went wrong. Please try again.';
    }
    client.emit('interview:error', { message });
  }
}
