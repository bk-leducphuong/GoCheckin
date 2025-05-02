export default function AuthenticationFail() {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <div className="text-2xl font-bold mb-4">Access Denied</div>
      <div className="text-gray-600">
        You don&apos;t have permission to access this page.
      </div>
    </div>
  );
}
