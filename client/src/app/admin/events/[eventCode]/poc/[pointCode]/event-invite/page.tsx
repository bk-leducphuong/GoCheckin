"use client";

import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { ApiError } from "@/lib/error";
import { useParams } from "next/navigation";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { PocService } from "@/services/admin/poc.service";
import { useRouter } from "next/navigation";

export default function EventInvitePage() {
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Call api to sent invite email
  const sendInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!params) {
        setError("Event code and point code are required");
        return;
      }
      const eventCode = params.eventCode as string;
      const pointCode = params.pointCode as string;

      if (!eventCode || !pointCode) {
        setError("Event code and point code are required");
        return;
      }

      const email = (e.target as HTMLFormElement).email.value;
      if (!email) {
        setError("Email is required");
        return;
      }

      setIsLoading(true);
      await PocService.sendPocInvite({
        eventCode,
        pointCode,
        email,
      });

      router.push(`/admin/events/${eventCode}/poc/${pointCode}`);
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Failed to send invite email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/admin/events" />;
  }

  return (
    <div>
      <h1>Event Invite</h1>
      <p>This page is used to send an invite email to the POC for the event.</p>
      <form onSubmit={sendInvite}>
        <Input type="email" name="email" placeholder="Email" />
        <Button type="submit">Send Invite</Button>
      </form>
    </div>
  );
}
