/** Clerk is only wired up once a publishable key is provided. */
export const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

/**
 * The Clerk *application* is still named "Docent" in the Clerk dashboard, so the
 * default titles render "Sign in to Docent". Until it's renamed there, override
 * the app-name-bearing strings so every Clerk surface says Praxos.
 * (Rename in Clerk Dashboard → Settings → Application name for a global fix.)
 */
export const clerkLocalization = {
  signIn: { start: { title: "Sign in to Praxos" } },
  signUp: { start: { title: "Create your Praxos account" } },
} as const;

/**
 * Phantom (light lavender/aubergine) appearance applied to ALL Clerk surfaces
 * (SignIn/SignUp, UserButton, and the "Manage account" UserProfile modal) via
 * the provider. Uses Clerk's default light theme + Praxos brand variables.
 */
export const clerkAppearance = {
  variables: {
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#2b2440",
    colorTextSecondary: "#6e6a7d",
    colorPrimary: "#3c315b",
    colorInputText: "#2b2440",
    colorNeutral: "#2b2440",
    borderRadius: "12px",
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    formButtonPrimary: "bg-[#3c315b] text-white hover:opacity-90 normal-case rounded-full",
  },
} as const;

/** SignIn/SignUp use the same light theme but with the card chrome stripped
 * (they sit inside our own split-screen shell). */
export const clerkAuthAppearance = {
  variables: clerkAppearance.variables,
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none border-0 p-0",
    headerTitle: "text-ink",
    headerSubtitle: "text-soft",
    formButtonPrimary: "bg-[#3c315b] text-white hover:opacity-90 normal-case rounded-full",
  },
} as const;
