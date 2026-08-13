import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/userRepository';
import { User, AuthResponse, UserResponse } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

import { config } from '../config/env';

export class AuthService {
  async register(fullName: string, email: string, phone: string, password: string): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('User with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr-${uuidv4()}`,
      fullName,
      email,
      phone,
      passwordHash,
      role: 'passenger',
      createdAt: new Date().toISOString(),
    };

    await userRepository.create(newUser);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const userResponse: UserResponse = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return { user: userResponse, token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (config.adminEmail && config.adminPassword && email.trim() === config.adminEmail.trim() && password === config.adminPassword) {
      const token = generateToken({
        userId: 'admin-env',
        email: config.adminEmail,
        role: 'admin',
      });

      const userResponse: UserResponse = {
        id: 'admin-env',
        fullName: 'Administrator',
        email: config.adminEmail,
        phone: '+237 600-000-000',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      return { user: userResponse, token };
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userResponse: UserResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, token };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
