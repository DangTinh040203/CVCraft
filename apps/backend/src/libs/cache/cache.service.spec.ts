import { Logger } from '@nestjs/common';

import { CacheService } from '@/libs/cache/cache.service';

function setup() {
  const store = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  return { store, warn, cache: new CacheService(store) };
}

describe('CacheService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('falls through when Redis is down: misses, skips writes, warns', async () => {
    const { store, warn, cache } = setup();
    const down = new Error('connect ECONNREFUSED 127.0.0.1:6379');
    store.get.mockRejectedValue(down);
    store.set.mockRejectedValue(down);
    store.del.mockRejectedValue(down);

    await expect(cache.get('k')).resolves.toBeUndefined();
    await expect(cache.set('k', 1)).resolves.toBeUndefined();
    await expect(cache.del('k')).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(3);
  });

  it('ping fails loudly, unlike the rest', async () => {
    const { store, cache } = setup();
    store.set.mockRejectedValue(new Error('down'));

    await expect(cache.ping()).rejects.toThrow('down');
  });

  it('ping passes when the value round-trips', async () => {
    const { store, cache } = setup();
    let saved: unknown;
    store.set.mockImplementation((_key: string, value: unknown) => {
      saved = value;
      return Promise.resolve();
    });
    store.get.mockImplementation(() => Promise.resolve(saved));

    await expect(cache.ping()).resolves.toBeUndefined();
  });
});
