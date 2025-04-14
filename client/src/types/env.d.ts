// By having this type definition file, TypeScript will provide type checking and autocompletion 
// when accessing these environment variables throughout the application
declare namespace NodeJS {
  interface ProcessEnv {
    // API Configuration
    NEXT_PUBLIC_API_URL: string;

    NEXT_PUBLIC_SERVER_URL: string;
    
    // Auth Configuration
    NEXT_PUBLIC_AUTH_COOKIE_NAME: string;
    NEXT_PUBLIC_AUTH_COOKIE_EXPIRES: string;
    
    // App Configuration
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
  }
} 