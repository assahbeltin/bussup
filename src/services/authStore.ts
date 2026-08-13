export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'passenger' | 'admin';
}

const DEFAULT_USER: UserProfile = {
  id: 'guest-1',
  fullName: 'Traveler',
  email: 'passenger@example.com',
  phone: '+237 600-000-000',
  role: 'passenger',
};

let currentUser: UserProfile = DEFAULT_USER;
let authToken: string = '';
const listeners: Set<() => void> = new Set();

export function getCurrentUser(): UserProfile {
  return currentUser;
}

export function setCurrentUser(user: UserProfile): void {
  currentUser = user;
  listeners.forEach((listener) => listener());
}

export function getAuthToken(): string {
  return authToken;
}

export function setAuthToken(token: string): void {
  authToken = token;
}

export function clearCurrentUser(): void {
  currentUser = DEFAULT_USER;
  authToken = '';
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
