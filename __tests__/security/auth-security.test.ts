import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Authentication Security Tests', () => {
  let mockPrisma: any;
  let mockHash: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const prismaModule = await import('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
    const bcryptModule = await import('bcryptjs');
    mockHash = bcryptModule.hash;
  });

  describe('Password Hashing Security', () => {
    it('should hash password with bcrypt', async () => {
      vi.mocked(mockHash).mockResolvedValue('$2a$12$hashed_password');
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$12$hashed_password',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'mySecurePassword123',
        }),
      });

      await POST(mockRequest);

      expect(mockHash).toHaveBeenCalledWith('mySecurePassword123', 12);
    });

    it('should use strong salt rounds (12)', async () => {
      vi.mocked(mockHash).mockResolvedValue('$2a$12$hashed_password');
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$12$hashed_password',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      await POST(mockRequest);

      const hashCall = vi.mocked(mockHash).mock.calls[0];
      expect(hashCall[1]).toBe(12); // Salt rounds should be 12
    });

    it('should never store plain text passwords', async () => {
      vi.mocked(mockHash).mockResolvedValue('$2a$12$hashed_password');
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const capturedData: any = {};
      vi.mocked(mockPrisma.user.create).mockImplementation((args: any) => {
        capturedData.password = args.data.password;
        return Promise.resolve({
          id: 'user-id',
          name: args.data.name,
          email: args.data.email,
          password: args.data.password,
        });
      });

      const plainPassword = 'myPlainTextPassword';
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: plainPassword,
        }),
      });

      await POST(mockRequest);

      // Verify stored password is NOT the plain text
      expect(capturedData.password).not.toBe(plainPassword);
      expect(capturedData.password).toBe('$2a$12$hashed_password');
    });

    it('should hash different passwords to different hashes', async () => {
      const hashes = new Set();

      vi.mocked(mockHash)
        .mockResolvedValueOnce('$2a$12$hash1')
        .mockResolvedValueOnce('$2a$12$hash2');

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockImplementation((args: any) => {
        hashes.add(args.data.password);
        return Promise.resolve({
          id: 'user-id',
          name: 'Test User',
          email: args.data.email,
          password: args.data.password,
        });
      });

      const request1 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password1',
        }),
      });

      const request2 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password2',
        }),
      });

      await POST(request1);
      await POST(request2);

      expect(hashes.size).toBe(2);
    });
  });

  describe('Password Strength Requirements', () => {
    it('should enforce minimum password length of 8 characters', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should accept password with exactly 8 characters', async () => {
      vi.mocked(mockHash).mockResolvedValue('$2a$12$hashed_password');
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$12$hashed_password',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345678',
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });
  });

  describe('Response Data Security', () => {
    it('should never return password in response', async () => {
      vi.mocked(mockHash).mockResolvedValue('$2a$12$hashed_password');
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$12$hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.user).toBeDefined();
      expect(data.user.password).toBeUndefined();
      expect(Object.keys(data.user)).not.toContain('password');
    });

    it('should never leak password hash in error messages', async () => {
      vi.mocked(mockHash).mockResolvedValue('$2a$12$hashed_password');
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockRejectedValue(
        new Error('Database error: password=$2a$12$sensitive_hash')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.error).toBe('Something went wrong');
      expect(data.error).not.toContain('$2a');
      expect(data.error).not.toContain('password=');
    });
  });

  describe('Input Sanitization', () => {
    it('should validate email format to prevent injection', async () => {
      const maliciousEmail = 'test@example.com<script>alert(1)</script>';

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: maliciousEmail,
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should reject emails with SQL injection patterns', async () => {
      const sqlInjection = "admin'--";

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: sqlInjection,
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle NoSQL injection attempts', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: { $ne: null },
          email: { $gt: '' },
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });
  });

  describe('Credential Provider Security', () => {
    it('should not reveal whether email exists on failed login', async () => {
      const { authorizeUser } = await import('@/lib/auth');

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
      const { authorizeUser } = await import('@/lib/auth');

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

    it('should use constant-time comparison for password verification', async () => {
      const { authorizeUser } = await import('@/lib/auth');

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

      const { compare } = await import('bcryptjs');
      vi.mocked(compare).mockResolvedValue(false);

      try {
        await authorizeUser({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        // Verify bcrypt.compare was used (it's timing-safe)
        expect(compare).toHaveBeenCalledWith('wrongpassword', '$2a$12$hashed_password');
      }
    });
  });

  describe('Session Security', () => {
    it('should use JWT strategy for sessions', async () => {
      const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');

      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have secret configured from environment', async () => {
      // Note: In test environment, NEXTAUTH_SECRET might not be loaded
      // This test verifies the configuration structure
      const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');

      // The secret field should exist in the config (even if undefined in test env)
      expect(authOptions).toHaveProperty('secret');

      // In production, this would be a string from process.env.NEXTAUTH_SECRET
      // We test that the field is properly referenced
      expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET);
    });
  });

  describe('Error Information Leakage', () => {
    it('should not leak database structure in errors', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(
        new Error('Column "secretColumn" does not exist')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.error).toBe('Something went wrong');
      expect(data.error).not.toContain('Column');
      expect(data.error).not.toContain('secretColumn');
    });

    it('should not expose stack traces', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(
        new Error('Internal error with stack trace')
      );

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.error).toBe('Something went wrong');
      expect(data.stack).toBeUndefined();
    });
  });
});
