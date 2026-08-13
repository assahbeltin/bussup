export type UserRole = 'passenger' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
