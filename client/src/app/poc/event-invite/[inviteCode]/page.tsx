"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PocService } from "@/services/poc/poc.service";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { ApiError } from "@/lib/error";
import { useRouter } from "next/navigation";

export default function PocInvitePage() {
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const acceptInvite = async () => {
    if (!params || !params.inviteCode) {
      setError("Invalid invite code");
      return;
    }
    try {
      setIsLoading(true);
      await PocService.acceptPocInvite(params.inviteCode as string);
      router.push("/poc");
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    acceptInvite();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/poc/login" />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">POC Invite</h1>
      <p className="text-sm text-gray-500">
        You are invited to be a POC for the event.
      </p>
    </div>
  );
}
