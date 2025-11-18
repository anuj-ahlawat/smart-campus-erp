"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthRole } from "@/hooks/useAuthRole";

const SIGN_IN_URL = process.env.NEXT_PUBLIC_SIGN_IN_URL ?? "/auth/login";

export const LaunchPortalButton = () => {
  const { isSignedIn, redirectPath } = useAuthRole();

  if (!isSignedIn) {
    return (
      <Button asChild size="lg">
        <Link href={SIGN_IN_URL}>
          Launch Portal
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  const target = redirectPath ?? "/not-authorized";
  const isExternal = target.startsWith("http");

  if (isExternal) {
    return (
      <Button asChild size="lg">
        <a href={target}>
          Continue to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size="lg">
      <Link href={target}>
        Continue to Dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
};

