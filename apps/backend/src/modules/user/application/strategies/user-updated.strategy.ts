import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  type IClerkWebhookStrategy,
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '@/modules/user/application/interfaces';
import { UserService } from '@/modules/user/application/services/user.service';
import { ClerkUserWebhook, ClerkWebhook } from '@/modules/user/domain';

/** Keeps the profile in sync when the user changes it in Clerk. */
@Injectable()
export class UserUpdatedStrategy implements IClerkWebhookStrategy {
  private readonly logger = new Logger(UserUpdatedStrategy.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly userService: UserService,
  ) {}

  getType(): ClerkUserWebhook {
    return ClerkUserWebhook.USER_UPDATED;
  }

  async handle(event: ClerkWebhook): Promise<void> {
    const { data } = event;
    if (!data.id) {
      this.logger.warn('No user ID found in event data');
      return;
    }

    const user = await this.userRepository.findByProviderId(data.id);
    if (!user) {
      this.logger.warn(`User with providerId ${data.id} not found`);
      return;
    }

    const primaryEmail = data.email_addresses.find(
      (email) => email.id === data.primary_email_address_id,
    );

    await this.userRepository.update(user.id, {
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.image_url,
      ...(primaryEmail && { email: primaryEmail.email_address }),
    });
    await this.userService.invalidateUserCache(data.id);

    this.logger.log(`User updated: ${user.id} (Clerk: ${data.id})`);
  }
}
