import { hashPassword, verifyPassword } from './password';

describe('Password utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should reject short passwords', async () => {
      await expect(hashPassword('12345')).rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should reject empty passwords', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password must be at least 6 characters long');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash', async () => {
      const password = 'testpassword123';
      const invalidHash = 'not-a-valid-hash';
      
      // bcrypt actually returns false for invalid hashes instead of throwing
      const result = await verifyPassword(password, invalidHash);
      expect(result).toBe(false);
    });
  });
});