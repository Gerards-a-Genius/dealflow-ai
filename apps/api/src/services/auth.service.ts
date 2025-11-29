import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@dealflow/database';
import { ApiError } from '@dealflow/shared';
import { UserPayload } from '@dealflow/shared';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export async function register(data: RegisterDto) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists', 'USER_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user (agents register themselves, role defaults to AGENT for new registrations)
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'AGENT', // New registrations are agents
    },
  });

  // Generate JWT
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
  };
}

export async function login(data: LoginDto) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  // Check if user is soft-deleted
  if (user.deletedAt) {
    throw new ApiError(401, 'This account has been deactivated', 'AUTH_ACCOUNT_DEACTIVATED');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  // Generate JWT
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return user;
}

function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Utility function for agents to invite clients
export async function createClientAccount(agentId: string, data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  // Generate random password
  const tempPassword = Math.random().toString(36).slice(-12);
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const client = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'CLIENT',
      agentId,
    },
  });

  // In production, you'd send this password via email
  return {
    client: {
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
    },
    temporaryPassword: tempPassword, // Send via email in production
  };
}
