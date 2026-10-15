import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { USER_CREATED_EVENT } from '@/modules/user/application/constants/user-events.constant';
import {
  type IClerkWebhookStrategy,
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '@/modules/user/application/interfaces';
import { UserService } from '@/modules/user/application/services/user.service';
import { ClerkUserWebhook, ClerkWebhook } from '@/modules/user/domain';

@Injectable()
export class UserCreatedStrategy implements IClerkWebhookStrategy {
  private readonly logger = new Logger(UserCreatedStrategy.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  getType(): ClerkUserWebhook {
    return ClerkUserWebhook.USER_CREATED;
  }

  async handle(event: ClerkWebhook): Promise<void> {
    const { data } = event;

    const primaryEmail = data.email_addresses.find(
      (email) => email.id === data.primary_email_address_id,
    );

    if (!primaryEmail) {
      this.logger.warn(`No primary email found for user ${data.id}`);
      return;
    }

    // Svix redelivers until it gets a 2xx, so a redelivery of an event
    // already handled must succeed rather than fail forever with 409
    const existingUser = await this.userRepository.findByEmail(
      primaryEmail.email_address,
    );
    if (existingUser?.providerId === data.id) {
      // The earlier delivery may have failed after creating the user (e.g.
      // on the default resume), so the follow-up runs again; it's idempotent
      this.logger.log(`User ${data.id} already exists, re-running follow-up`);
      await this.eventEmitter.emitAsync(USER_CREATED_EVENT, existingUser);
      return;
    }
    if (existingUser) {
      throw new ConflictException(
        `User with email ${primaryEmail.email_address} already exists`,
      );
    }

    const newUser = await this.userRepository.create({
      email: primaryEmail.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.image_url,
      provider: 'clerk',
      providerId: data.id,
    });

    // A lookup before the webhook arrived may have cached "no such user"
    await this.userService.invalidateUserCache(data.id);
    // Awaited: if the default resume fails, so does the webhook, and Clerk
    // redelivers instead of leaving the user without a resume
    await this.eventEmitter.emitAsync(USER_CREATED_EVENT, newUser);

    this.logger.log(`User created: ${newUser.id} (Clerk: ${data.id})`);
  }
}
