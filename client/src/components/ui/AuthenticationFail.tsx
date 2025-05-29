import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticationFail({
  redirectTo,
  loginType,
}: {
  loginType: "admin" | "poc";
  redirectTo: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(`/login/${loginType}?redirectUrl=${redirectTo}`);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [loginType, router, redirectTo]);

  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <div className="text-2xl font-bold mb-4">Access Denied</div>
      <div className="text-gray-600">
        You don&apos;t have permission to access this page.
      </div>
    </div>
  );
}
