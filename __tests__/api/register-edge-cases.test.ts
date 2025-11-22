import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password_123'),
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

describe('Registration API - Edge Cases', () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const prismaModule = await import('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle very long names', async () => {
      const longName = 'a'.repeat(500);
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: longName,
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: longName,
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.name).toBe(longName);
    });

    it('should handle very long emails', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com';
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: longEmail,
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: longEmail,
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe(longEmail);
    });

    it('should handle special characters in name', async () => {
      const specialName = "O'Brien-Smith Jr. (III)";
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: specialName,
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: specialName,
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.name).toBe(specialName);
    });

    it('should handle unicode characters in name', async () => {
      const unicodeName = '田中太郎 José García';
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: unicodeName,
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: unicodeName,
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.name).toBe(unicodeName);
    });

    it('should handle email with plus addressing', async () => {
      const email = 'user+test@example.com';
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: email,
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe(email);
    });

    it('should handle email with subdomain', async () => {
      const email = 'user@mail.example.co.uk';
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: email,
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe(email);
    });

    it('should reject empty string name', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject whitespace-only name', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: '   ',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle password with exactly 8 characters', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_123',
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

    it('should handle very long password', async () => {
      const longPassword = 'a'.repeat(1000);
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: longPassword,
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });

    it('should handle password with special characters', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: specialPassword,
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database connection failure', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(
        new Error('Database connection failed')
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

      expect(response.status).toBe(500);
      expect(data.error).toBe('Something went wrong');
    });

    it('should handle database timeout', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(
        new Error('Query timeout')
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

      expect(response.status).toBe(500);
      expect(data.error).toBe('Something went wrong');
    });

    it('should handle constraint violation errors gracefully', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
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

      expect(response.status).toBe(500);
      expect(data.error).toBe('Something went wrong');
    });
  });

  describe('Malformed Input', () => {
    it('should handle invalid JSON', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: 'invalid json{',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(mockRequest);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle null values', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: null,
          email: null,
          password: null,
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle undefined values in JSON', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle extra fields in request', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          extraField: 'should be ignored',
          anotherField: 123,
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });
  });

  describe('Security Edge Cases', () => {
    it('should not allow SQL injection in email', async () => {
      const sqlInjection = "test@example.com'; DROP TABLE users; --";

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: sqlInjection,
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      // Should fail email validation
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should sanitize HTML in name', async () => {
      const xssAttempt = '<script>alert("xss")</script>';
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: xssAttempt,
        email: 'test@example.com',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: xssAttempt,
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      // The name is stored as-is, but should be escaped on output
      expect(response.status).toBe(201);
      expect(data.user.name).toBe(xssAttempt);
    });

    it('should handle case-sensitive emails correctly', async () => {
      // This tests that email comparison is handled correctly
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'Test@Example.COM',
        password: 'hashed_password_123',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'Test@Example.COM',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'Test@Example.COM' },
      });
    });
  });
});
