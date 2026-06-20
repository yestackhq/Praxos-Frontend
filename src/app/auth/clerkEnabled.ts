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
 * (they sit inside our own split-screen shell). Clerk's internal classes win on
 * equal specificity, so the layout overrides use `!important`. */
export const clerkAuthAppearance = {
  variables: clerkAppearance.variables,
  elements: {
    rootBox: "w-full",
    // Strip Clerk's card chrome (shadow + 1px ring) — the form lives inside our shell.
    cardBox: "w-full !border-0 !shadow-none !bg-transparent",
    card: "!bg-transparent !shadow-none !border-0 !p-0 !gap-5",
    // Header: tighten the title/subtitle pair.
    header: "!gap-1.5",
    headerTitle: "!text-ink !text-[1.375rem] !font-semibold !tracking-[-0.01em]",
    headerSubtitle: "!text-soft !text-[0.9rem]",
    // Consistent vertical rhythm between social / divider / form.
    main: "!gap-4",
    socialButtonsBlockButton: "!h-11 !rounded-xl !border-border",
    socialButtonsBlockButtonText: "!text-ink !font-medium",
    dividerLine: "!bg-hairline",
    dividerText: "!text-faint !text-[0.8rem]",
    // Roomier, evenly-padded fields and buttons (was a cramped ~30px tall).
    formField: "!gap-1.5",
    formFieldLabel: "!text-ink !text-[0.85rem] !font-medium",
    formFieldInput: "!h-11 !rounded-xl !px-3.5 !text-[0.95rem] !border-border",
    formButtonPrimary:
      "!h-11 !rounded-full !bg-[#3c315b] !text-white hover:!opacity-90 !normal-case !text-[0.95rem] !font-medium",
    // De-emphasise the footer band — kill the gradient IMAGE (not just color);
    // the dev-mode stripe itself only shows on dev keys and is gone in production.
    footer: "!bg-none !bg-transparent !border-0 !pt-2",
    // Our AuthShell already renders the "New to Praxos? / Already have an
    // account?" link, so hide Clerk's duplicate.
    footerAction: "!hidden",
  },
} as const;
