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

describe('Registration API', () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const prismaModule = await import('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
  });

  describe('POST /api/auth/register', () => {
    it('should validate required fields', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name, email, password
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject password shorter than 8 characters', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
        name: 'Existing User',
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
    });

    it('should successfully create a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
        password: 'hashed_password_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe('new-user-id');
      expect(data.user.name).toBe('New User');
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.password).toBeUndefined(); // Password should not be returned

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'hashed_password_123',
        },
      });
    });

    it('should hash the password before storing', async () => {
      const { hash } = await import('bcryptjs');

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'plaintext_password',
        }),
      });

      await POST(mockRequest);

      expect(hash).toHaveBeenCalledWith('plaintext_password', 12);
    });

    it('should require name field', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should have proper API structure', async () => {
      // Test that the API endpoint is defined and responds
      expect(POST).toBeDefined();
      expect(typeof POST).toBe('function');
    });
  });
});
