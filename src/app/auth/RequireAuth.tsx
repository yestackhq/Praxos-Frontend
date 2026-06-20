import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { clerkEnabled } from "./clerkEnabled";

/**
 * Gates the app shells. When Clerk is configured, signed-out users are sent to
 * /sign-in; otherwise (review mode, no key) the app renders so the UI stays
 * reviewable.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) return <>{children}</>;
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
