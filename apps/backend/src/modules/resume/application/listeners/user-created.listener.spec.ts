import { type IResumeRepository } from '@/modules/resume/application/interfaces';
import { UserCreatedListener } from '@/modules/resume/application/listeners/user-created.listener';
import { type ResumeService } from '@/modules/resume/application/services';
import { Resume } from '@/modules/resume/domain';
import { User } from '@/modules/user/domain';

function setup() {
  const repo = {
    findByUserId: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<IResumeRepository>;
  const resumeService = {
    invalidateResumeCache: jest.fn(),
  } as unknown as jest.Mocked<ResumeService>;
  return {
    repo,
    resumeService,
    listener: new UserCreatedListener(repo, resumeService),
  };
}

const user = new User({ id: 'u1', firstName: 'Jane', lastName: 'Doe' });

describe('UserCreatedListener', () => {
  it('creates the default resume and clears a cached "no resume"', async () => {
    const { repo, resumeService, listener } = setup();
    repo.findByUserId.mockResolvedValue(null);

    await listener.handleUserCreatedEvent(user);

    expect(repo.create).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ title: 'Jane Doe' }),
    );
    expect(resumeService.invalidateResumeCache).toHaveBeenCalledWith('u1');
  });

  it('skips a user who already has a resume (webhook redelivery)', async () => {
    const { repo, listener } = setup();
    repo.findByUserId.mockResolvedValue(new Resume({ id: 'r1' }));

    await listener.handleUserCreatedEvent(user);

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('lets a failure through, so the webhook fails and is redelivered', async () => {
    const { repo, listener } = setup();
    repo.findByUserId.mockResolvedValue(null);
    repo.create.mockRejectedValue(new Error('db down'));

    await expect(listener.handleUserCreatedEvent(user)).rejects.toThrow(
      'db down',
    );
  });
});
