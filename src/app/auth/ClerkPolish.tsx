import { useEffect } from "react";

/**
 * Clerk puts a native `title="Example format: name@example.com"` on its email
 * input, which the browser renders as a stray dark tooltip (it can land in the
 * top-left corner). Strip the `title` off Clerk inputs whenever they mount or
 * re-render. Renders nothing; mount once inside <ClerkProvider>.
 */
export function ClerkPolish() {
  useEffect(() => {
    const strip = () => {
      document
        .querySelectorAll<HTMLElement>(".cl-rootBox [title], .cl-modalContent [title]")
        .forEach((el) => {
          if (el.tagName === "INPUT" || el.tagName === "BUTTON") el.removeAttribute("title");
        });
    };
    strip();
    const obs = new MutationObserver(strip);
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["title"],
    });
    return () => obs.disconnect();
  }, []);
  return null;
}
