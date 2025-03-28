'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useAuthStore } from '@/store/authStore';
// import { AuthService } from '@/services/auth.service';

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function AuthGuard({ children, allowedRoles = [] }: Props) {
  console.log(allowedRoles);
  // const router = useRouter();
  // const pathname = usePathname();
  // const { user, accessToken, refreshToken, clearAuth } = useAuthStore();
  // const [isVerifying, setIsVerifying] = useState(true);

  // useEffect(() => {
  //   const verifyToken = async () => {
  //     setIsVerifying(true);

  //     // If no token, redirect to login
  //     if (!accessToken || !refreshToken) {
  //       clearAuth();
  //       router.push('/login');
  //       return;
  //     }

  //     try {
  //       // Verify the token with backend
  //       const isValid = await AuthService.verifyToken(accessToken);
        
  //       if (!isValid) {
  //         clearAuth();
  //         router.push('/login');
  //         return;
  //       }

  //       // Check if user role is allowed for this route
  //       if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
  //         // Redirect based on role
  //         if (user.role === 'admin') {
  //           router.push('/admin');
  //         } else if (user.role === 'poc') {
  //           router.push('/poc');
  //         } else {
  //           router.push('/login');
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Token verification failed:', error);
  //       clearAuth();
  //       router.push('/login');
  //     } finally {
  //       setIsVerifying(false);
  //     }
  //   };

  //   verifyToken();
  // }, [accessToken, refreshToken, router, clearAuth, user, allowedRoles, pathname]);

  // // Show loading while verifying
  // if (isVerifying) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
} 