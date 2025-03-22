declare namespace NodeJS {
  interface ProcessEnv {
    // API Configuration
    NEXT_PUBLIC_API_URL: string;
    
    // Auth Configuration
    NEXT_PUBLIC_AUTH_COOKIE_NAME: string;
    NEXT_PUBLIC_AUTH_COOKIE_EXPIRES: string;
    
    // App Configuration
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
  }
} 