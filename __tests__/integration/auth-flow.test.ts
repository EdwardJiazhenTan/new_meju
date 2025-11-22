import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as RegisterPOST } from '@/app/api/auth/register/route';
import { authorizeUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('$2a$12$hashed_password'),
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

describe('Authentication Flow Integration Tests', () => {
  let mockPrisma: any;
  let mockCompare: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const prismaModule = await import('@/lib/prisma');
    mockPrisma = prismaModule.prisma;
    const bcryptModule = await import('bcryptjs');
    mockCompare = bcryptModule.compare;
  });

  describe('Complete Signup Flow', () => {
    it('should successfully register a new user and prepare for login', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'SecurePassword123',
      };

      // Step 1: User doesn't exist
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      // Step 2: Create user
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'new-user-id',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const registerResponse = await RegisterPOST(registerRequest);
      const registerData = await registerResponse.json();

      // Verify registration success
      expect(registerResponse.status).toBe(201);
      expect(registerData.user).toBeDefined();
      expect(registerData.user.email).toBe(userData.email);
      expect(registerData.user.password).toBeUndefined();

      // Verify user was created with hashed password
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: '$2a$12$hashed_password',
        },
      });
    });

    it('should handle the full signup -> login -> session flow', async () => {
      const userData = {
        name: 'Full Flow User',
        email: 'fullflow@example.com',
        password: 'MyPassword123',
      };

      // Step 1: Registration
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id-123',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const registerResponse = await RegisterPOST(registerRequest);
      expect(registerResponse.status).toBe(201);

      // Step 2: Login (via authorizeUser function)
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-id-123',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockCompare).mockResolvedValue(true);

      const loginResult = await authorizeUser({
        email: userData.email,
        password: userData.password,
      });

      // Step 3: Verify login success
      expect(loginResult).toBeDefined();
      expect(loginResult.id).toBe('user-id-123');
      expect(loginResult.email).toBe(userData.email);
      expect(loginResult.password).toBeUndefined();

      // Step 4: Verify session configuration
      const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
      expect(authOptions.session?.strategy).toBe('jwt');
    });
  });

  describe('Duplicate Registration Prevention', () => {
    it('should prevent duplicate registration with same email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // First registration
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValueOnce({
        id: 'user-id',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const firstRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const firstResponse = await RegisterPOST(firstRequest);
      expect(firstResponse.status).toBe(201);

      // Second registration attempt with same email
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValueOnce({
        id: 'user-id',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
      });

      const secondRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Different Name',
          email: userData.email,
          password: 'differentPassword',
        }),
      });

      const secondResponse = await RegisterPOST(secondRequest);
      const secondData = await secondResponse.json();

      expect(secondResponse.status).toBe(400);
      expect(secondData.error).toContain('already exists');
    });
  });

  describe('Multi-Provider User Scenarios', () => {
    it('should handle user who signed up with credentials trying to use OAuth', async () => {
      // User created with email/password
      const existingUser = {
        id: 'user-id',
        name: 'Credentials User',
        email: 'user@example.com',
        password: '$2a$12$hashed_password',
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(existingUser);

      // User attempts to register again with same email
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Credentials User',
          email: 'user@example.com',
          password: 'newPassword123',
        }),
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });

    it('should reject credentials login for OAuth-only users', async () => {
      // OAuth user (no password set)
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'oauth-user-id',
        name: 'OAuth User',
        email: 'oauth@example.com',
        password: null,
        image: 'https://google.com/avatar.jpg',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        authorizeUser({
          email: 'oauth@example.com',
          password: 'anyPassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('Failed Login Scenarios', () => {
    it('should reject login with non-existent email', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authorizeUser({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with wrong password', async () => {
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
          password: 'wrongPassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should handle multiple failed login attempts', async () => {
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

      const attempts = 3;
      const errors: string[] = [];

      for (let i = 0; i < attempts; i++) {
        try {
          await authorizeUser({
            email: 'test@example.com',
            password: 'wrongPassword',
          });
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          errors.push(error.message);
        }
      }

      // All error messages should be the same (no user enumeration)
      expect(errors).toHaveLength(attempts);
      errors.forEach(error => {
        expect(error).toBe('Invalid email or password');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain user data consistency across registration and login', async () => {
      const userData = {
        name: 'Consistent User',
        email: 'consistent@example.com',
        password: 'Password123',
      };

      // Registration
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      const createdUser = {
        id: 'consistent-user-id',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockPrisma.user.create).mockResolvedValue(createdUser);

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const registerResponse = await RegisterPOST(registerRequest);
      const registerData = await registerResponse.json();

      // Login
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(createdUser);
      vi.mocked(mockCompare).mockResolvedValue(true);

      const loginResult = await authorizeUser({
        email: userData.email,
        password: userData.password,
      });

      // Verify consistency
      expect(registerData.user.id).toBe(loginResult.id);
      expect(registerData.user.email).toBe(loginResult.email);
      expect(registerData.user.name).toBe(loginResult.name);
    });

    it('should preserve user attributes through auth flow', async () => {
      const userData = {
        name: 'José García-Smith',
        email: 'jose.garcia+test@example.com',
        password: 'SecureP@ss123',
      };

      // Registration
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-id',
        name: userData.name,
        email: userData.email,
        password: '$2a$12$hashed_password',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      await RegisterPOST(registerRequest);

      // Verify special characters preserved
      const createCall = vi.mocked(mockPrisma.user.create).mock.calls[0][0];
      expect(createCall.data.name).toBe('José García-Smith');
      expect(createCall.data.email).toBe('jose.garcia+test@example.com');
    });
  });
});
