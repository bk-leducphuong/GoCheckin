import { API_URL } from '@/config';

export class RefreshTokenService {
  private static instance: RefreshTokenService;
  private refreshPromise: Promise<any> | null = null;

  private constructor() {}

  static getInstance(): RefreshTokenService {
    if (!RefreshTokenService.instance) {
      RefreshTokenService.instance = new RefreshTokenService();
    }
    return RefreshTokenService.instance;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      const data = await response.json();
      return data;
    }).finally(() => {
      // Clear the promise after it's done or failed
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  async logout(refreshToken: string): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logoutAll(refreshToken: string): Promise<void> {
    await fetch(`${API_URL}/auth/logout-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  }
} 