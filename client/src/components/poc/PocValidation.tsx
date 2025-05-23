import React, { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { usePocStore } from "@/store/poc/pocStore";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/error";

interface PocValidationProps {
  eventCode: string;
  pointCode: string;
  children: React.ReactNode;
  fallback: React.ReactNode;
}
export default function PocValidation({
  eventCode,
  pointCode,
  children,
  fallback,
}: PocValidationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { poc, validatePoc } = usePocStore(
    useShallow((state) => ({
      poc: state.poc,
      validatePoc: state.validatePoc,
    }))
  );

  useEffect(() => {
    const validatePocData = async () => {
      try {
        setIsLoading(true);
        await validatePoc(pointCode, eventCode);
      } catch (error) {
        setError(
          error instanceof ApiError ? error.message : "Poc validation error"
        );
      } finally {
        setIsLoading(false);
      }
    };
    validatePocData();
  }, [pointCode, eventCode, router, validatePoc]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} redirectTo="/login" />;
  }

  if (!poc) {
    return <>{fallback}</>;
  } else {
    return <>{children}</>;
  }
}
