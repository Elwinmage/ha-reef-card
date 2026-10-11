import { describe, expect, it } from "vitest";
import {
  coral_palette,
  frame_rect,
  hex_rgb,
  loop_frame,
  once_frame,
  recolor_pixels,
  rgb_hex,
} from "../src/aquarium/sprites";
import type { CoralSpecies } from "../src/aquarium/types";

const clip = { from: 10, to: 13, fps: 24, loop: true };

describe("frames", () => {
  it("loops and plays once", () => {
    expect(loop_frame(clip, 0)).toBe(10);
    expect(loop_frame(clip, 5.7)).toBe(11);
    expect(loop_frame(clip, -1)).toBe(13);
    expect(once_frame(clip, 0)).toBe(10);
    expect(once_frame(clip, 0.5)).toBe(12);
    expect(once_frame(clip, 1)).toBe(13);
    expect(once_frame(clip, 7)).toBe(13);
  });

  it("plays a ping-pong clip forward then backward", () => {
    const pp = { ...clip, pingpong: true };
    const frames = Array.from({ length: 8 }, (_, i) => loop_frame(pp, i));
    expect(frames).toEqual([10, 11, 12, 13, 12, 11, 10, 11]);
    expect(loop_frame(pp, -1)).toBe(11);
    expect(loop_frame({ ...pp, to: 10 }, 5)).toBe(10);
  });

  it("finds a frame in the atlas", () => {
    const species = { frame: [256, 128], columns: 8 } as any;
    expect(frame_rect(species, 0)).toEqual([0, 0, 256, 128]);
    expect(frame_rect(species, 9)).toEqual([256, 128, 256, 128]);
    expect(frame_rect(species, 9, 2)).toEqual([512, 256, 512, 256]);
    expect(frame_rect({ frame: [10, 10], columns: 0 } as any, 3)).toEqual([
      0, 30, 10, 10,
    ]);
  });
});

describe("colours", () => {
  it("converts hex", () => {
    expect(hex_rgb("#ff8000")).toEqual([255, 128, 0]);
    expect(hex_rgb("bad")).toEqual([128, 128, 128]);
    expect(hex_rgb(undefined, [1, 2, 3])).toEqual([1, 2, 3]);
    expect(rgb_hex([255, 128, 0])).toBe("#ff8000");
    expect(rgb_hex([300, -5, 1.4])).toBe("#ff0001");
  });

  it("builds a coral palette from defaults and choices", () => {
    const species = {
      palette: [
        { default: "#ff0000" },
        { default: "#00ff00" },
        { default: "#0000ff" },
      ],
    } as CoralSpecies;
    expect(coral_palette(species, ["#111111"])).toEqual([
      [17, 17, 17],
      [0, 255, 0],
      [0, 0, 255],
      [128, 128, 128],
    ]);
  });

  it("recolours shade + mask pixels", () => {
    // 3 pixels: pure colour 1 at half brightness, grey (colour 4), transparent
    const shade = new Uint8ClampedArray([
      128, 128, 128, 255, 255, 255, 255, 200, 0, 0, 0, 0,
    ]);
    const mask = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0,
    ]);
    const palette: [number, number, number][] = [
      [200, 0, 0],
      [0, 200, 0],
      [0, 0, 200],
      [10, 20, 30],
    ];
    const out = recolor_pixels(shade, mask, palette);
    expect(Array.from(out.slice(0, 4))).toEqual([100, 0, 0, 255]);
    expect(Array.from(out.slice(4, 8))).toEqual([10, 20, 30, 200]);
    expect(Array.from(out.slice(8, 12))).toEqual([0, 0, 0, 0]);

    // Glow layer: only colour 1
    const glow = recolor_pixels(shade, mask, palette, [
      true,
      false,
      false,
      false,
    ]);
    expect(Array.from(glow.slice(0, 4))).toEqual([100, 0, 0, 255]);
    expect(Array.from(glow.slice(4, 8))).toEqual([0, 0, 0, 0]);
  });
});
