import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-danger" />
        <h1 className="text-2xl font-semibold">You’re almost there!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role is not permitted to view this area. Please switch accounts or request access from the administrator.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button asChild>
            <Link href="/auth/login">Switch Account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to landing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

