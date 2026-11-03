"""Build the VSON fish feeder state images from the open/full render.

Outputs (same canvas as the source, transparent background; converted to
WebP for the card bundle):
  closed_full.webp, closed_empty.webp, open_full.webp, open_empty.webp

Usage: python3 generate_img.py source/open_full.png .
"""
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
src = np.array(Image.open(SRC).convert("RGBA")).astype(np.float32)
H, W = src.shape[:2]
SS = 4  # supersampling for anti-aliased shapes


def poly_mask(points, blur=0.0):
    """Anti-aliased polygon mask in [0,1]."""
    im = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(im).polygon([(x * SS, y * SS) for x, y in points], fill=255)
    im = im.resize((W, H), Image.LANCZOS)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.array(im).astype(np.float32) / 255.0


def inpaint(rgba, mask_bool, radius=4):
    rgb = rgba[..., :3].copy()
    rgb[rgba[..., 3] < 128] = 245  # neutral fill behind transparent pixels
    out = cv2.inpaint(rgb.astype(np.uint8), mask_bool.astype(np.uint8) * 255,
                      radius, cv2.INPAINT_TELEA).astype(np.float32)
    res = rgba.copy()
    res[..., :3][mask_bool] = out[mask_bool]
    return res


# ---------------------------------------------------------------- food removal
def remove_food(img):
    r, g, b, a = [img[..., i] for i in range(4)]
    food = (r - b > 22) & (a > 200)
    food[:40, :] = False
    food[160:, :] = False
    food = cv2.dilate(food.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    out = inpaint(img, food, radius=6)
    # Smooth the repainted floor, then shade it: darker toward the back
    # wall (top-left) like an empty, recessed tray.
    smooth = cv2.GaussianBlur(out[..., :3], (0, 0), 6)
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    ys_f, xs_f = ys[food], xs[food]
    y0, y1 = ys_f.min(), ys_f.max()
    t = (ys - y0) / max(1.0, (y1 - y0))  # 0 at back, 1 at front
    shade = 0.86 + 0.12 * np.clip(t, 0, 1)
    floor = np.clip(smooth * shade[..., None], 0, 255)
    soft = cv2.GaussianBlur(food.astype(np.float32), (0, 0), 1.2)[..., None]
    out[..., :3] = out[..., :3] * (1 - soft) + floor * soft
    # Outlet slot at the bottom of the hopper (food falls through it)
    cx, cy = (xs_f.mean() + 10, ys_f.mean() + 6)
    slot = poly_mask([(cx - 26, cy + 2), (cx + 18, cy + 19),
                      (cx + 26, cy + 14), (cx - 18, cy - 3)], blur=0.6)
    slot_shadow = poly_mask([(cx - 27, cy + 1), (cx + 18, cy + 18),
                             (cx + 27, cy + 15), (cx - 18, cy - 2)], blur=2.5)
    out[..., :3] *= (1 - 0.18 * slot_shadow)[..., None]
    out[..., :3] = out[..., :3] * (1 - slot[..., None]) + \
        np.array([92, 92, 96], np.float32) * slot[..., None]
    return out


# ----------------------------------------------------------------- close trap
# Body front face (with the trap): bottom edge and opening geometry, measured
# on the 367x368 source render.
def body_bottom(x):
    return 258 + 0.57 * (x - 10)


def top_edge(x):
    return 192 + 0.4 * (x - 39)


TRAP = [(39, top_edge(39)), (104, top_edge(104)), (107.5, top_edge(104) + 1.2),
        (109, top_edge(104) + 4), (109, 286), (39, 258)]


def close_trap(img):
    zone = [(0, 220), (37, 212), (37, 188), (108, 214), (118, 220),
            (118, 350), (0, 350)]
    zone_m = poly_mask(zone) > 0.5
    out = inpaint(img, zone_m, radius=5)
    # Face fill: each column keeps the colour of the untouched face just
    # above the zone (so the rounded left edge keeps its shading), darkened
    # near the bottom edge like the rest of the body.
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    face_rgb = np.zeros((H, W, 3), np.float32)
    for x in range(W):
        y_ref = 214 if x < 37 else int(top_edge(min(x, 108)) - 5)
        ref = img[max(0, y_ref - 3):y_ref + 1, x, :3].mean(0)
        if img[y_ref, x, 3] < 128:
            ref = np.array([247, 247, 248], np.float32)
        face_rgb[:, x] = ref
    face_rgb = cv2.GaussianBlur(face_rgb, (0, 0), sigmaX=4, sigmaY=0.1)
    d = body_bottom(xs) - ys  # distance above the bottom edge
    face_rgb *= (1 - np.clip(16 - d, 0, 16) * 0.0045)[..., None]
    blend = cv2.GaussianBlur(zone_m.astype(np.float32), (0, 0), 1.5)
    blend = np.where(zone_m, 1.0, blend)
    # Feather the right side of the zone into the untouched body
    blend *= np.clip((112 - xs) / 8.0, 0, 1)
    blend = blend[..., None]
    out[..., :3] = out[..., :3] * (1 - blend) + face_rgb * blend
    # Silhouette: nothing left of the body side, nor below its bottom edge
    sil = poly_mask([(9, 60), (W, 60), (W, H), (118, H), (118, body_bottom(118)),
                     (9, body_bottom(9))])
    alpha = img[..., 3] / 255.0
    alpha = np.where(zone_m, sil, alpha)
    # soften the left edge transition (body side shading)
    out[..., 3] = alpha * 255
    # Trap door: flush panel, thin seam, light inner shadow under the top edge
    seam = poly_mask(TRAP)
    inner = poly_mask([(40, top_edge(40) + 1), (104, top_edge(104) + 1),
                       (108, top_edge(104) + 5), (108, 285), (40, 257)])
    out[..., :3] = out[..., :3] * (1 - seam[..., None]) + \
        np.array([168, 168, 174], np.float32) * seam[..., None]
    panel = 244 - np.clip(top_edge(xs) + 6 - ys, 0, 6) * 3  # top shadow
    panel_rgb = np.stack([panel, panel, panel + 2], -1)
    out[..., :3] = out[..., :3] * (1 - inner[..., None]) + panel_rgb * inner[..., None]
    # Small grip notch in the panel
    notch = poly_mask([(66, 246), (82, 252.5), (82, 255), (66, 248.5)], blur=0.4)
    out[..., :3] = out[..., :3] * (1 - notch[..., None]) + \
        np.array([200, 200, 205], np.float32) * notch[..., None]
    return out


def save(arr, name):
    """Write a state picture as WebP (lossy colour, lossless alpha)."""
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    im.save(f"{OUT}/{name.replace('.png', '.webp')}", "WEBP",
            quality=90, method=6, alpha_quality=100)


empty = remove_food(src)
save(src, "open_full.png")
save(empty, "open_empty.png")
save(close_trap(src), "closed_full.png")
save(close_trap(empty), "closed_empty.png")
