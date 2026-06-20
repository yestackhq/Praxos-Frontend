import { Link, Navigate } from "react-router-dom";
import { SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { AuthShell, AuthField, authInput } from "./AuthShell";
import { buttonVariants } from "@/ui/Button";
import { clerkEnabled, clerkAuthAppearance } from "./clerkEnabled";

export default function SignUpPage() {
  return (
    <AuthShell
      headline="Onboarding that proves understanding."
      blurb="Upload a policy, invite your team, and watch real understanding climb."
    >
      {clerkEnabled ? (
        <>
          {/* Already signed in → straight to the app (Clerk can't render SignUp then). */}
          <SignedIn>
            <Navigate to="/launch" replace />
          </SignedIn>
          <SignedOut>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/launch"
              appearance={clerkAuthAppearance}
            />
          </SignedOut>
        </>
      ) : (
        <div>
          <h1 className="text-h2 text-ink">Create your workspace</h1>
          <p className="mt-1.5 text-body text-soft">
            Start onboarding your team in an afternoon. Free for 14 days.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.assign("/launch");
            }}
          >
            <AuthField label="Full name">
              <input placeholder="Alex Carter" className={authInput} />
            </AuthField>
            <AuthField label="Work email">
              <input type="email" placeholder="alex@company.com" className={authInput} />
            </AuthField>
            <AuthField label="Company">
              <input placeholder="Acme Manufacturing" className={authInput} />
            </AuthField>
            <AuthField label="Password">
              <input type="password" placeholder="At least 10 characters" className={authInput} />
            </AuthField>
            <button type="submit" className={buttonVariants({ size: "lg", className: "w-full" })}>
              Create account
            </button>
          </form>
          <p className="mt-3 text-caption text-faint">
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
        </div>
      )}

      <p className="mt-8 text-caption text-faint">
        Already have an account?{" "}
        <Link to="/sign-in" className="text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
