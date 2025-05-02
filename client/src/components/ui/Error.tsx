interface ErrorProps {
  message: string;
  redirectTo?: string;
}
export default function Error({ message, redirectTo }: ErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <div className="text-2xl font-bold mb-4">Error</div>
      <div className="text-gray-600">{message}</div>
      <div>
        Click <a href={redirectTo}>here</a> to go back.
      </div>
    </div>
  );
}
