import { ConflictException } from '@nestjs/common';
import { type EventEmitter2 } from '@nestjs/event-emitter';

import { CacheKeys,type CacheService } from '@/libs/cache';
import { USER_CREATED_EVENT } from '@/modules/user/application/constants/user-events.constant';
import { type IUserRepository } from '@/modules/user/application/interfaces';
import { type UserService } from '@/modules/user/application/services/user.service';
import { UserCreatedStrategy } from '@/modules/user/application/strategies/user-created.strategy';
import { UserDeletedStrategy } from '@/modules/user/application/strategies/user-deleted.strategy';
import { UserUpdatedStrategy } from '@/modules/user/application/strategies/user-updated.strategy';
import {
  ClerkUserWebhook,
  type ClerkWebhook,
  User,
} from '@/modules/user/domain';

function event(
  type: ClerkUserWebhook,
  data: Partial<ClerkWebhook['data']> = {},
): ClerkWebhook {
  return {
    type,
    object: 'event',
    instance_id: 'ins_1',
    timestamp: 1,
    data: {
      id: 'clerk_1',
      first_name: 'Jane',
      last_name: 'Doe',
      image_url: 'https://img/jane.png',
      primary_email_address_id: 'em_1',
      email_addresses: [
        {
          id: 'em_1',
          email_address: 'jane@example.com',
          verification: null,
          linked_to: [],
        },
      ],
      ...data,
    } as ClerkWebhook['data'],
  };
}

function setup() {
  const repo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByProviderId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<IUserRepository>;
  const userService = {
    invalidateUserCache: jest.fn(),
  } as unknown as jest.Mocked<UserService>;
  const events = {
    emitAsync: jest.fn(),
  } as unknown as jest.Mocked<EventEmitter2>;
  const cache = { del: jest.fn() } as unknown as jest.Mocked<CacheService>;
  return { repo, userService, events, cache };
}

describe('UserCreatedStrategy', () => {
  it('creates the user, clears a cached miss, then awaits the follow-up', async () => {
    const { repo, userService, events } = setup();
    const created = new User({ id: 'u1', providerId: 'clerk_1' });
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(created);

    await new UserCreatedStrategy(repo, userService, events).handle(
      event(ClerkUserWebhook.USER_CREATED),
    );

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@example.com',
        providerId: 'clerk_1',
      }),
    );
    expect(userService.invalidateUserCache).toHaveBeenCalledWith('clerk_1');
    expect(events.emitAsync).toHaveBeenCalledWith(USER_CREATED_EVENT, created);
  });

  it('on redelivery, re-runs the follow-up instead of failing with 409', async () => {
    const { repo, userService, events } = setup();
    const existing = new User({ id: 'u1', providerId: 'clerk_1' });
    repo.findByEmail.mockResolvedValue(existing);

    await new UserCreatedStrategy(repo, userService, events).handle(
      event(ClerkUserWebhook.USER_CREATED),
    );

    expect(repo.create).not.toHaveBeenCalled();
    expect(events.emitAsync).toHaveBeenCalledWith(USER_CREATED_EVENT, existing);
  });

  it('409s an email taken by another Clerk account', async () => {
    const { repo, userService, events } = setup();
    repo.findByEmail.mockResolvedValue(
      new User({ id: 'u2', providerId: 'clerk_other' }),
    );

    await expect(
      new UserCreatedStrategy(repo, userService, events).handle(
        event(ClerkUserWebhook.USER_CREATED),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('fails the webhook when the follow-up fails', async () => {
    const { repo, userService, events } = setup();
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(new User({ id: 'u1' }));
    events.emitAsync.mockRejectedValue(new Error('resume failed'));

    await expect(
      new UserCreatedStrategy(repo, userService, events).handle(
        event(ClerkUserWebhook.USER_CREATED),
      ),
    ).rejects.toThrow('resume failed');
  });
});

describe('UserUpdatedStrategy', () => {
  it('saves the new profile and clears the cached user', async () => {
    const { repo, userService } = setup();
    repo.findByProviderId.mockResolvedValue(new User({ id: 'u1' }));

    await new UserUpdatedStrategy(repo, userService).handle(
      event(ClerkUserWebhook.USER_UPDATED, { first_name: 'Janet' }),
    );

    expect(repo.update).toHaveBeenCalledWith('u1', {
      firstName: 'Janet',
      lastName: 'Doe',
      avatar: 'https://img/jane.png',
      email: 'jane@example.com',
    });
    expect(userService.invalidateUserCache).toHaveBeenCalledWith('clerk_1');
  });

  it('ignores a user it never stored', async () => {
    const { repo, userService } = setup();
    repo.findByProviderId.mockResolvedValue(null);

    await new UserUpdatedStrategy(repo, userService).handle(
      event(ClerkUserWebhook.USER_UPDATED),
    );

    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe('UserDeletedStrategy', () => {
  it('deletes the user and clears both cached user and resume', async () => {
    const { repo, userService, cache } = setup();
    repo.findByProviderId.mockResolvedValue(new User({ id: 'u1' }));

    await new UserDeletedStrategy(repo, userService, cache).handle(
      event(ClerkUserWebhook.USER_DELETED),
    );

    expect(repo.delete).toHaveBeenCalledWith('u1');
    expect(userService.invalidateUserCache).toHaveBeenCalledWith('clerk_1');
    expect(cache.del).toHaveBeenCalledWith(CacheKeys.resume.byUserId('u1'));
  });
});
