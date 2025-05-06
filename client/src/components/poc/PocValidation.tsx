import React, { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { usePocStore } from "@/store/pocStore";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";

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
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError("System is having issues. Please try again later.");
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
