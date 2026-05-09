import { BcryptPasswordHasherService } from './bcrypt-password-hasher.service';

describe('BcryptPasswordHasherService', () => {
  const service = new BcryptPasswordHasherService();

  it('hashes and verifies passwords', async () => {
    const hash = await service.hash('StrongPass123!');

    expect(hash).not.toBe('StrongPass123!');
    await expect(service.verify('StrongPass123!', hash)).resolves.toBe(true);
  });

  it('rejects verification for incorrect password', async () => {
    const hash = await service.hash('StrongPass123!');

    await expect(service.verify('WrongPass123!', hash)).resolves.toBe(false);
  });
});
