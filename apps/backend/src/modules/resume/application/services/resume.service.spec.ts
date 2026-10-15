import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CacheKeys, type CacheService } from '@/libs/cache';
import { type IResumeRepository } from '@/modules/resume/application/interfaces';
import { ResumeService } from '@/modules/resume/application/services/resume.service';
import { Resume } from '@/modules/resume/domain';

function setup() {
  const repo = {
    findOwner: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  } as jest.Mocked<IResumeRepository>;
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  } as unknown as jest.Mocked<CacheService>;
  return { repo, cache, service: new ResumeService(repo, cache) };
}

const resume = new Resume({ id: 'r1', userId: 'u1', title: 'Jane' });

describe('ResumeService', () => {
  describe('update', () => {
    it('saves the owner’s resume and drops its cached copy', async () => {
      const { repo, cache, service } = setup();
      repo.findOwner.mockResolvedValue({ id: 'r1', userId: 'u1' });
      repo.update.mockResolvedValue(resume);

      await expect(service.update('r1', {}, 'u1')).resolves.toBe(resume);
      expect(cache.del).toHaveBeenCalledWith(CacheKeys.resume.byUserId('u1'));
    });

    it('404s a resume that does not exist', async () => {
      const { repo, service } = setup();
      repo.findOwner.mockResolvedValue(null);

      await expect(service.update('r1', {}, 'u1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('403s someone else’s resume, without touching it', async () => {
      const { repo, service } = setup();
      repo.findOwner.mockResolvedValue({ id: 'r1', userId: 'other' });

      await expect(service.update('r1', {}, 'u1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('403s someone else’s resume', async () => {
      const { repo, service } = setup();
      repo.findById.mockResolvedValue(new Resume({ id: 'r1', userId: 'x' }));

      await expect(service.findById('r1', 'u1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('findByUserId', () => {
    it('serves a cached resume without the database', async () => {
      const { repo, cache, service } = setup();
      cache.get.mockResolvedValue({ ...resume });

      await expect(service.findByUserId('u1')).resolves.toBeInstanceOf(Resume);
      expect(repo.findByUserId).not.toHaveBeenCalled();
    });

    it('treats a cached null as a hit', async () => {
      const { repo, cache, service } = setup();
      cache.get.mockResolvedValue(null);

      await expect(service.findByUserId('u1')).resolves.toBeNull();
      expect(repo.findByUserId).not.toHaveBeenCalled();
    });

    it('caches a miss briefly, and a found resume normally', async () => {
      const { repo, cache, service } = setup();
      cache.get.mockResolvedValue(undefined);
      repo.findByUserId.mockResolvedValueOnce(null);
      repo.findByUserId.mockResolvedValueOnce(resume);

      await service.findByUserId('u1');
      await service.findByUserId('u1');

      const key = CacheKeys.resume.byUserId('u1');
      expect(cache.set).toHaveBeenNthCalledWith(1, key, null, 60_000);
      expect(cache.set).toHaveBeenNthCalledWith(2, key, resume);
    });
  });
});
