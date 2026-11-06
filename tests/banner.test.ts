import { afterEach, describe, expect, it, vi } from "vitest";

import { log_banner } from "../src/banner";
import { version } from "../package.json";

describe("console banner", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the name and the version, styled", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    log_banner();
    expect(info).toHaveBeenCalledTimes(1);
    const [text, name_style, version_style] = info.mock.calls[0];
    expect(text).toContain("REEF CARD");
    expect(text).toContain(version);
    expect(name_style).toContain("background");
    expect(version_style).toContain("background");
  });
});
