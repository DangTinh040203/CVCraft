'use client';

import { io, type Socket } from 'socket.io-client';

import { Env } from '@/configs/env.config';
import { type GetTokenFn } from '@/services/http.service';
import {
  type InterviewClientEvents,
  type InterviewServerEvents,
} from '@/types/interview.type';

export type InterviewSocket = Socket<
  InterviewServerEvents,
  InterviewClientEvents
>;

/**
 * Opens the mock interview socket. It authenticates in the handshake with
 * the Clerk session token, and doesn't reconnect by itself: the server ends
 * an interview whose socket drops, so a new socket couldn't resume it.
 */
export function connectInterviewSocket(getToken: GetTokenFn): InterviewSocket {
  // "http://localhost:8000/api/v1" -> "http://localhost:8000"
  const origin = new URL(Env.NEXT_PUBLIC_WS_URL ?? Env.NEXT_PUBLIC_API_URL)
    .origin;
  return io(`${origin}/interview`, {
    auth: (callback) => {
      void getToken().then((token) => callback({ token }));
    },
    transports: ['websocket'],
    reconnection: false,
  });
}
