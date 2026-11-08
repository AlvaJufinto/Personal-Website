/** @format */

/* Floating-window dragging for the Typeset studio panel: the head drags the
 * panel anywhere in the viewport, and releasing it near a horizontal edge lets
 * that edge take it. Kept separate from the panel's settings wiring so the
 * component stays readable. */

/** A free panel's edge never sits closer than this to the viewport. */
const VIEWPORT_MARGIN = 12;
/** Where a docked panel rests — the 24px the CSS already placed it at. */
const EDGE_OFFSET = 24;
/** Docking zone as a share of the width, so it is 96px at 1200px, bounded. */
const SNAP_ZONE_RATIO = 1;
const SNAP_ZONE_MIN = 170;
const SNAP_ZONE_MAX = 250;
/** Keyboard step; Shift takes four of them. */
const KEY_STEP = 16;
/** Below this the panel is a bottom sheet and owns no position of its own. */
export const SHEET_LAYOUT = "(max-width: 640px)";

type DockState = "floating" | "left" | "right";

/** Where the panel last rested in this session, so navigating the portfolio
 * does not drop it back on the default right edge. Session rather than local
 * storage, like the panel's open state: a fresh tab starts from the plain
 * sheet. */
const DOCK_STORAGE_KEY = "porto:studio-dock";

interface SavedDock {
  dock: DockState;
  left: number;
  top: number;
}

function readSavedDock(): SavedDock | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DOCK_STORAGE_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return null;
    const { dock, left, top } = parsed as Partial<SavedDock>;
    if (dock !== "floating" && dock !== "left" && dock !== "right") return null;
    if (typeof left !== "number" || typeof top !== "number") return null;
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    return { dock, left, top };
  } catch {
    return null;
  }
}

function writeSavedDock(saved: SavedDock): void {
  try {
    sessionStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage unavailable (private mode): the position still holds for this page.
  }
}

/* Idempotent rather than assumed-once: the panel is one per page today, and a
 * second mount — a re-run script, a future client-side navigation — must not
 * stack a second set of handlers onto the same head. */
const dragBound = new WeakSet<HTMLElement>();

export function mountStudioDrag(panel: HTMLElement, onMove: () => void) {
  const handle = panel.querySelector<HTMLElement>("[data-studio-handle]");
  if (!handle || dragBound.has(panel)) return () => {};
  dragBound.add(panel);

  interface Drag {
    pointerId: number;
    /** Pointer-to-window offset, taken at drag start so nothing jumps. */
    dx: number;
    dy: number;
    width: number;
    height: number;
  }

  const isSheet = () => matchMedia(SHEET_LAYOUT).matches;

  /* The layout viewport, not `innerWidth`: the scrollbar is excluded from the
   * containing block a fixed panel is placed in, and it is that edge the dock
   * has to line up with for 24px to mean 24px. */
  const viewport = () => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });

  let drag: Drag | null = null;
  let frame = 0;
  let pointer = { x: 0, y: 0 };

  function box() {
    const r = panel.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  /* The position the panel was last *written* to, not the one it is still
   * gliding through: a second arrow key before the glide lands measures from
   * the intention, so keystrokes add up instead of chasing their own tail.
   * A grab still measures where the panel visually is — see pointerdown. */
  function targetBox() {
    const r = box();
    return {
      left: panel.style.left ? Number.parseFloat(panel.style.left) : r.left,
      top: panel.style.top ? Number.parseFloat(panel.style.top) : r.top,
      width: r.width,
      height: r.height,
    };
  }

  /** Swap the CSS `top`/`right` anchor for explicit coordinates. Measuring
   * the rendered box first makes the swap visually a no-op, which is what
   * lets those same properties animate the snap afterwards. */
  function toCoordinates() {
    if (panel.style.left) return;
    const r = box();
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.left = `${r.left}px`;
    panel.style.top = `${r.top}px`;
  }

  /** Position clamped to the viewport, from the panel's real dimensions. */
  function place(left: number, top: number, width: number, height: number) {
    const { width: vw, height: vh } = viewport();
    const maxX = Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN);
    const maxY = Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN);
    panel.style.left = `${Math.min(Math.max(left, VIEWPORT_MARGIN), maxX)}px`;
    panel.style.top = `${Math.min(Math.max(top, VIEWPORT_MARGIN), maxY)}px`;
  }

  function dock(state: DockState) {
    if (panel.dataset.studioDock !== state) panel.dataset.studioDock = state;
  }

  /** The side whose zone the panel is in, or null when it is dropped free.
   * Horizontal only: the height the user chose is left alone. */
  function edgeZone(left: number, width: number): "left" | "right" | null {
    const vw = viewport().width;
    const zone = Math.round(
      Math.min(SNAP_ZONE_MAX, Math.max(SNAP_ZONE_MIN, vw * SNAP_ZONE_RATIO)),
    );
    const fromRight = vw - (left + width);
    if (fromRight <= zone && fromRight <= left) return "right";
    if (left <= zone) return "left";
    return null;
  }

  function dockOffset(state: "left" | "right", width: number) {
    return state === "right"
      ? viewport().width - width - EDGE_OFFSET
      : EDGE_OFFSET;
  }

  /* Capture where the panel ended up. A docked edge stores its edge, and the
   * explicit left/top come from `targetBox`, so the restore only has to trust
   * the saved numbers after re-measuring the viewport. */
  function savePosition() {
    if (isSheet() || panel.hidden) return;
    const { left, top } = targetBox();
    writeSavedDock({
      dock: (panel.dataset.studioDock as DockState | undefined) ?? "right",
      left,
      top,
    });
  }

  /* `dragging` is what keeps the declared transition off while the pointer
   * moves; dropping it before the final position is written is what lets that
   * same transition carry the panel to the edge. */
  function endDrag() {
    /* A release can outrun the frame it was queued for: settle on the newest
     * pointer position, not the last painted one. */
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      moveToPointer();
    }

    drag = null;
    delete panel.dataset.studioDragging;
    if (isSheet()) return;

    const { left, top, width, height } = targetBox();
    const state = edgeZone(left, width);
    if (state) place(dockOffset(state, width), top, width, height);
    dock(state ?? "floating");
    onMove();
    savePosition();
  }

  /** The newest pointer position, applied once per frame, not once per event. */
  function moveToPointer() {
    frame = 0;
    if (!drag) return;
    place(pointer.x - drag.dx, pointer.y - drag.dy, drag.width, drag.height);
    dock("floating");
    onMove();
  }

  handle.addEventListener("pointerdown", (event) => {
    if (drag || event.button !== 0 || isSheet()) return;

    const { left, top, width, height } = box();
    toCoordinates();
    drag = {
      pointerId: event.pointerId,
      dx: event.clientX - left,
      dy: event.clientY - top,
      width,
      height,
    };
    pointer = { x: event.clientX, y: event.clientY };
    panel.dataset.studioDragging = "";
    /* Capture keeps the stream coming once the pointer outruns the head, and
     * ends with the pointer, so a lost contact cannot strand a half-drag. */
    handle.setPointerCapture(event.pointerId);
    handle.focus({ preventScroll: true });
    event.preventDefault();
  });

  handle.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(moveToPointer);
  });

  handle.addEventListener("pointerup", (event) => {
    if (drag && event.pointerId === drag.pointerId) endDrag();
  });

  handle.addEventListener("pointercancel", (event) => {
    if (drag && event.pointerId === drag.pointerId) endDrag();
  });

  handle.addEventListener("keydown", (event) => {
    if (drag || isSheet() || event.ctrlKey || event.metaKey || event.altKey)
      return;

    const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const nudge: Record<string, readonly [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };

    const { left, top, width, height } = targetBox();
    const delta = nudge[event.key];

    if (delta) {
      event.preventDefault();
      toCoordinates();
      place(left + delta[0], top + delta[1], width, height);
      /* Named by proximity, like a release: a panel nudged to the edge is a
       * docked panel, but nothing gets pulled sideways unasked. */
      const moved = targetBox();
      dock(edgeZone(moved.left, moved.width) ?? "floating");
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const state = event.key === "Home" ? "left" : "right";
      toCoordinates();
      place(dockOffset(state, width), top, width, height);
      dock(state);
    } else {
      return;
    }

    onMove();
    savePosition();
  });

  addEventListener("resize", () => {
    if (drag || panel.hidden) return;

    if (isSheet()) {
      /* The sheet reclaims its own edges, and the coordinates that would
       * fight them go with it. */
      for (const edge of ["left", "top", "right", "bottom"] as const)
        panel.style.removeProperty(edge);
      delete panel.dataset.studioDock;
      return;
    }

    const state = panel.dataset.studioDock as DockState | undefined;
    if (!state) return;

    const { left, top, width, height } = targetBox();
    place(
      state === "floating" ? left : dockOffset(state, width),
      top,
      width,
      height,
    );
    onMove();
    savePosition();
  });

  /** Reapply where the panel was left earlier this visit. Called once the
   * panel is visible — its box must be real before left/top are meaningful. */
  function restoreDock() {
    if (isSheet() || panel.hidden) return;
    const saved = readSavedDock();
    if (!saved) return;
    const { width, height } = box();
    const left =
      saved.dock === "floating" ? saved.left : dockOffset(saved.dock, width);
    place(left, saved.top, width, height);
    dock(saved.dock);
  }

  return restoreDock;
}
