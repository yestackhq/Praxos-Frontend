import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge can't see our custom theme, so it lumps `text-label` (a custom
 * font-size) and `text-bg`/`text-ink` (custom colors) into one `text-*` group and
 * drops the earlier one. Register both so they live in separate groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["eyebrow", "caption", "label", "body", "body-s", "title", "h1", "h2", "h3", "metric"] },
      ],
      "text-color": [
        {
          text: [
            "bg", "surface", "ink", "soft", "faint", "hairline",
            "background", "foreground", "muted-foreground", "primary", "primary-foreground",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
