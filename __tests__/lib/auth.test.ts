import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authorizeUser } from '@/lib/auth';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('authorizeUser', () => {
  let mockPrisma: any;
  let mockCompare: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const prismaModule = await import('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
    const bcryptModule = await import('bcryptjs');
    mockCompare = bcryptModule.compare;
  });

  describe('Input Validation', () => {
    it('should reject when credentials are undefined', async () => {
      await expect(authorizeUser(undefined)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should reject when email is missing', async () => {
      await expect(
        authorizeUser({ password: 'password123' })
      ).rejects.toThrow('Email and password are required');
    });

    it('should reject when password is missing', async () => {
      await expect(
        authorizeUser({ email: 'test@example.com' })
      ).rejects.toThrow('Email and password are required');
    });

    it('should reject when both email and password are missing', async () => {
      await expect(authorizeUser({})).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should reject when email is empty string', async () => {
      await expect(
        authorizeUser({ email: '', password: 'password123' })
      ).rejects.toThrow('Email and password are required');
    });

    it('should reject when password is empty string', async () => {
      await expect(
        authorizeUser({ email: 'test@example.com', password: '' })
      ).rejects.toThrow('Email and password are required');
    });
  });

  describe('User Lookup', () => {
    it('should reject when user does not exist', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authorizeUser({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should reject OAuth-only users (no password set)', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null,
        emailVerified: null,
        image: 'https://google.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        authorizeUser({
          email: 'oauth@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should not reveal whether email exists on failed login', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      try {
        await authorizeUser({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        // Error message should be generic
        expect(error.message).toBe('Invalid email or password');
        expect(error.message).not.toContain('not found');
        expect(error.message).not.toContain('does not exist');
      }
    });

    it('should not reveal whether user has password set', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await authorizeUser({
          email: 'oauth@example.com',
          password: 'password123',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        // Same generic error message
        expect(error.message).toBe('Invalid email or password');
        expect(error.message).not.toContain('OAuth');
        expect(error.message).not.toContain('Google');
      }
    });
  });

  describe('Password Verification', () => {
    it('should reject when password is incorrect', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(false);

      await expect(
        authorizeUser({
          email: 'test@example.com',
          password: 'wrong_password',
        })
      ).rejects.toThrow('Invalid email or password');

      expect(mockCompare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
    });

    it('should use bcrypt compare for password verification', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$12$hashed_password_string',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(true);

      await authorizeUser({
        email: 'test@example.com',
        password: 'plain_password',
      });

      expect(mockCompare).toHaveBeenCalledTimes(1);
      expect(mockCompare).toHaveBeenCalledWith('plain_password', '$2a$12$hashed_password_string');
    });

    it('should use constant-time comparison for password verification', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(false);

      await expect(
        authorizeUser({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');

      // Verify bcrypt.compare was used (it's timing-safe)
      expect(mockCompare).toHaveBeenCalledWith('wrongpassword', '$2a$12$hashed_password');
    });
  });

  describe('Successful Authentication', () => {
    it('should successfully authenticate with correct credentials', async () => {
      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        password: 'hashed_password',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(mockCompare).mockResolvedValue(true);

      const result = await authorizeUser({
        email: 'test@example.com',
        password: 'correct_password',
      });

      expect(result).toEqual({
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockCompare).toHaveBeenCalledWith('correct_password', 'hashed_password');
    });

    it('should not return password in user object', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(mockCompare).mockResolvedValue(true);

      const result = await authorizeUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.password).toBeUndefined();
      expect(Object.keys(result)).not.toContain('password');
      expect(Object.keys(result)).toEqual(['id', 'email', 'name', 'image']);
    });

    it('should handle user with null image', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        password: 'hashed_password',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(true);

      const result = await authorizeUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.image).toBeNull();
    });

    it('should handle user with null name', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: null,
        image: null,
        password: 'hashed_password',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(true);

      const result = await authorizeUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.name).toBeNull();
    });
  });

  describe('Return Value Structure', () => {
    it('should return only safe user fields', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        emailVerified: new Date(),
        image: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(true);

      const result = await authorizeUser({
        email: 'test@example.com',
        password: 'password123',
      });

      // Should only include these fields
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('image');

      // Should NOT include these fields
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('emailVerified');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });
});
