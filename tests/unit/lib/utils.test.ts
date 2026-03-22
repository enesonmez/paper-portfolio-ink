import { describe, expect, it } from "vitest";

import { cn } from "~/lib/utils";

describe("cn", () => {
  it("merges conditional class names with tailwind conflict resolution", () => {
    const hidden = false;

    expect(cn("px-2", hidden ? "hidden" : undefined, "px-4", ["text-sm"])).toBe(
      "px-4 text-sm",
    );
  });
});
