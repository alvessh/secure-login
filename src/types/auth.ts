export interface User {
  id: string;
  email: string;
  lastActivity: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}