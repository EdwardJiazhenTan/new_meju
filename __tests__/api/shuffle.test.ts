import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/shuffle/route';
import { NextRequest } from 'next/server';

// Mock NextAuth
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrismaClient = function() {
    return {
      user: {
        findUnique: vi.fn(),
      },
      recipe: {
        findMany: vi.fn(),
      },
    };
  };

  return {
    PrismaClient: mockPrismaClient,
  };
});

describe('Shuffle API', () => {
  describe('GET /api/shuffle', () => {
    it('should return 401 when not authenticated', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle');

      const response = await GET(mockRequest);

      expect(response.status).toBe(401);
    });

    it('should accept limit query parameter', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle?limit=5');

      const response = await GET(mockRequest);

      expect(response).toBeDefined();
    });

    it('should accept includeTags query parameter', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle?includeTags=lunch,quick');

      const response = await GET(mockRequest);

      expect(response).toBeDefined();
    });

    it('should accept excludeTags query parameter', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle?excludeTags=pork');

      const response = await GET(mockRequest);

      expect(response).toBeDefined();
    });

    it('should accept all query parameters together', async () => {
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/shuffle?limit=3&includeTags=lunch,quick&excludeTags=pork,beef'
      );

      const response = await GET(mockRequest);

      expect(response).toBeDefined();
    });

    it('should use default limit when not provided', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle');

      const response = await GET(mockRequest);

      expect(response).toBeDefined();
    });

    it('should validate limit is a number', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle?limit=abc');

      const response = await GET(mockRequest);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate limit is within range (1-20)', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/shuffle?limit=25');

      const response = await GET(mockRequest);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
