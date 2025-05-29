import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Poc, PocManager } from "@/types/poc";
import { PocService } from "@/services/admin/poc.service";
import { ApiError } from "@/lib/error";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { Event, EventStatus } from "@/types/event";
import { useShallow } from "zustand/react/shallow";
import { usePocStore } from "@/store/admin/pocStore";

export default function PocManagerInfo({
  poc,
  event,
}: {
  poc: Poc;
  event: Event;
}) {
  const [pocManager, setPocManager] = useState<PocManager | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { pocInvite, getPocInvite, setPocInvite } = usePocStore(
    useShallow((state) => ({
      pocInvite: state.pocInvite,
      getPocInvite: state.getPocInvite,
      setPocInvite: state.setPocInvite,
    }))
  );
  // Get POC manager information
  useEffect(() => {
    const fetchPocManager = async () => {
      try {
        if (!poc || !poc.userId) {
          setError("POC not found");
          return;
        }

        setIsLoading(true);
        const pocManager = await PocService.getPocManager(poc.userId);
        if (pocManager) {
          setPocManager(pocManager);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch POC manager. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPocManager();
  }, [poc]);

  useEffect(() => {
    const fetchPocInvite = async () => {
      try {
        if (!pocManager) {
          setIsLoading(true);
          await getPocInvite(event.eventCode, poc.pointCode);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Failed to fetch POC invite. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPocInvite();

    return () => {
      setPocInvite(null);
    };
  }, [poc, pocManager, event, getPocInvite, setPocInvite]);

  if (isLoading || !poc) {
    return <Loading />;
  }

  if (error && !isLoading) {
    return <Error message={error} redirectTo="/admin/events" />;
  }

  return (
    <>
      {/* POC Manager Information */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          POC Manager Information
        </h2>
        {pocManager ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                {poc.userId?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {pocManager?.username}
                </h3>
                <p className="text-sm text-gray-500">{pocManager?.email}</p>
                <p className="text-sm text-gray-500">
                  Registered on{" "}
                  {new Date(pocManager?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {pocInvite ? (
              <>
                <div className="text-center text-orange-500">
                  This POC is already assigned to {pocInvite.email}.
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/events/${params?.eventCode}/poc/${params?.pointCode}/event-invite`
                      )
                    }
                  >
                    View Invite
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-orange-500">
                  This POC is not assigned to any manager.
                </div>
                {event?.eventStatus === EventStatus.PUBLISHED && (
                  <div className="flex justify-center mt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/events/${params?.eventCode}/poc/${params?.pointCode}/event-invite`
                        )
                      }
                    >
                      Invite POC Manager
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
