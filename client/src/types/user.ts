
// User roles
export enum UserRole {
  ADMIN = 'admin',
  POC = 'poc',
  USER = 'user'
}

// User interface
export interface User {
  userId: string;
  username?: string;
  email: string;
  role: UserRole;
  fullName?: string;
}