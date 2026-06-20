import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { clerkAppearance } from "@/app/auth/clerkEnabled";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/launch"
        signUpFallbackRedirectUrl="/launch"
      >
        {tree}
      </ClerkProvider>
    ) : (
      // Clerk not configured yet — render the app so the UI is reviewable.
      tree
    )}
  </StrictMode>,
);
