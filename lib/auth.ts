import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export interface AuthorizeCredentials {
  email?: string;
  password?: string;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Authorizes a user with email and password credentials
 * @param credentials - User credentials containing email and password
 * @returns Authorized user object without password
 * @throws Error if credentials are invalid or user doesn't exist
 */
export async function authorizeUser(
  credentials: AuthorizeCredentials | undefined
): Promise<AuthorizedUser> {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
