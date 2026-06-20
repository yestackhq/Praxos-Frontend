import { Link, Navigate } from "react-router-dom";
import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { AuthShell, AuthField, authInput } from "./AuthShell";
import { buttonVariants } from "@/ui/Button";
import { clerkEnabled, clerkAuthAppearance } from "./clerkEnabled";

export default function SignInPage() {
  return (
    <AuthShell
      headline="Understand it. Out loud."
      blurb="Praxos teaches your documents by voice and measures real understanding, not whether you nodded along."
    >
      {clerkEnabled ? (
        <>
          {/* Already signed in → straight to the app (Clerk can't render SignIn then). */}
          <SignedIn>
            <Navigate to="/launch" replace />
          </SignedIn>
          <SignedOut>
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/launch"
              appearance={clerkAuthAppearance}
            />
          </SignedOut>
        </>
      ) : (
        <div>
          <h1 className="text-h2 text-ink">Welcome back</h1>
          <p className="mt-1.5 text-body text-soft">Sign in to continue your learning sessions.</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.assign("/launch");
            }}
          >
            <AuthField label="Work email">
              <input type="email" placeholder="you@company.com" className={authInput} />
            </AuthField>
            <div>
              <AuthField label="Password">
                <input type="password" placeholder="••••••••••" className={authInput} />
              </AuthField>
              <button type="button" className="mt-1.5 block text-right text-caption text-soft hover:text-ink">
                Forgot password?
              </button>
            </div>
            <button type="submit" className={buttonVariants({ size: "lg", className: "w-full" })}>
              Sign in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-caption text-faint">
            <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
          </div>
          <button className={buttonVariants({ variant: "secondary", size: "lg", className: "w-full" })}>
            Continue with SSO
          </button>
        </div>
      )}

      <p className="mt-8 text-caption text-faint">
        New to Praxos?{" "}
        <Link to="/sign-up" className="text-ink hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
