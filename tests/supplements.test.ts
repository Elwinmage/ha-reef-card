// Consolidated tests for supplements

import { html } from "lit";
import { describe, expect, it, vi } from "vitest";
import supplements_list from "../src/devices/rsdose/supplements";

describe("supplements.get_supplement_from_fullname() L44-49 — Bundle inner match", () => {
  it("returns bundle sub-supplement with scaled sizes when fullname matches inside a Bundle", () => {
    const list = (supplements_list as any)._list;
    const bundle = list.find((s: any) => s.type === "Bundle");
    expect(bundle).toBeDefined();

    const innerKey = Object.keys(bundle.bundle)[0];
    const innerSupp = bundle.bundle[innerKey].supplement;
    const ratio = bundle.bundle[innerKey].ratio;
    const testFullname = "__test_bundle_fullname__";

    innerSupp.fullname = testFullname;

    try {
      const result =
        supplements_list.get_supplement_from_fullname(testFullname);

      expect(result).not.toBeNull();
      expect(result.uid).toBe(innerSupp.uid);

      expect(result.sizes).toEqual(bundle.sizes.map((x: number) => x * ratio));
    } finally {
      delete innerSupp.fullname;
    }
  });

  it("returns null when fullname matches nothing in list or any bundle", () => {
    const result = supplements_list.get_supplement_from_fullname(
      "NONEXISTENT_SUPPLEMENT_XYZ",
    );
    expect(result).toBeNull();
  });
});
