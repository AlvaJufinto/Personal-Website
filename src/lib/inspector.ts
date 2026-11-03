/** @format */

/* Design inspector — Figma-style measurement overlays over the rendered page.
 *
 * Owned by Style Studio (so only reachable through Creative mode) but kept in
 * its own module: the studio owns settings and the floating panel, while this
 * file owns the overlay layer and everything it measures. Every number comes
 * from getBoundingClientRect() or getComputedStyle(); nothing is restated.
 *
 * Coordinate system: outlines, selection, spacing, column guides and the
 * baseline grid are drawn in an absolutely-positioned layer at the document's
 * top-left, so they scroll with the page and never touch layout. The rulers
 * are fixed to the viewport and relabel themselves against the scroll offset,
 * the way a design tool's rulers follow the canvas. */

export interface InspectorFacts {
  /** Body font-size in px. */
  type: number;
  /** Body line-height in px. */
  leading: number;
  /** Declared portfolio column width in px. */
  column: number;
  /** Section rhythm in px. */
  rhythm: number;
}

export type OverlayName =
  | "outlines"
  | "dimensions"
  | "spacing"
  | "ruler"
  | "columns"
  | "baseline";

export interface InspectorDeps {
  /** Live token values, read off the studio probe by the caller. */
  getFacts: () => InspectorFacts;
  /** Container the studio provides for the selected-section readout. */
  infoPanel: HTMLElement | null;
}

export interface Inspector {
  setActive(active: boolean): void;
  setOverlay(name: OverlayName, on: boolean): void;
  refresh(): void;
  destroy(): void;
}

/** Portfolio pages put one `.section` per block; long-form pages have semantic
 * children of `#main` instead. Both are meaningful inspection targets. */
const SECTION_SELECTOR = "#main > .section";
const FALLBACK_SELECTOR = "#main > header, #main > article, #main > section";

/** Descendants whose own interaction must win over section selection. */
const INTERACTIVE =
  "a, button, input, select, textarea, label, summary, " +
  "[role='button'], [role='link'], [contenteditable='true']";

const ROOT_CLASS = "studio-inspect";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function px(value: number, digits = 0): string {
  return `${String(Number(value.toFixed(digits)))}px`;
}

function docRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top + window.scrollY,
    left: r.left + window.scrollX,
    width: r.width,
    height: r.height,
  };
}

function place(el: HTMLElement, box: Rect) {
  el.style.top = px(box.top);
  el.style.left = px(box.left);
  el.style.width = px(box.width);
  el.style.height = px(box.height);
}

/** A section's own max-width is usually `none` (it fills the centered column),
 * so the meaningful constraint is the nearest ancestor that declares one. */
function effectiveMaxWidth(el: HTMLElement): string {
  let node: HTMLElement | null = el;
  while (node) {
    const maxWidth = getComputedStyle(node).maxWidth;
    if (maxWidth && maxWidth !== "none") return maxWidth;
    node = node.parentElement;
  }
  return "none";
}

function sectionLabel(el: HTMLElement, index: number): string {
  const heading = el.querySelector<HTMLElement>("h1, h2, h3");
  const text = heading?.textContent?.trim();
  return text || `Section ${String(index + 1).padStart(2, "0")}`;
}

export function mountInspector(deps: InspectorDeps): Inspector {
  let active = false;
  let destroyed = false;

  const overlays: Record<OverlayName, boolean> = {
    outlines: false,
    dimensions: false,
    spacing: false,
    ruler: false,
    columns: false,
    baseline: false,
  };

  let sections: HTMLElement[] = [];
  let labels: string[] = [];
  let outlineEls: HTMLElement[] = [];
  let dimWEls: HTMLElement[] = [];
  let dimHEls: HTMLElement[] = [];
  let hovered: HTMLElement | null = null;
  let selected: HTMLElement | null = null;

  let frame = 0;
  let observer: ResizeObserver | null = null;

  const layer = document.createElement("div");
  layer.id = "studio-overlay";
  layer.setAttribute("aria-hidden", "true");
  layer.hidden = true;
  document.body.appendChild(layer);

  const ruler = document.createElement("div");
  ruler.id = "studio-ruler";
  ruler.setAttribute("aria-hidden", "true");
  ruler.hidden = true;
  ruler.innerHTML = '<div class="so-ruler-h"></div><div class="so-ruler-v"></div>';
  document.body.appendChild(ruler);

  /* The detached listeners each section carries while inspecting. Keyed on the
   * element so deactivate can remove exactly what activate added. */
  const sectionListeners = new WeakMap<
    HTMLElement,
    { over: (e: PointerEvent) => void; out: (e: PointerEvent) => void; click: (e: MouseEvent) => void }
  >();

  function el(className: string): HTMLElement {
    const node = document.createElement("div");
    node.className = className;
    return node;
  }

  /* --- overlays ------------------------------------------------------ */

  function renderOutlines() {
    for (let i = 0; i < sections.length; i++) {
      place(outlineEls[i], docRect(sections[i]));
      outlineEls[i].hidden = !overlays.outlines;
    }
  }

  function renderSelection() {
    const target = selected ?? hovered;
    const sel = layer.querySelector<HTMLElement>(".so-selected");
    const selLabel = layer.querySelector<HTMLElement>(".so-selected-label");
    if (!sel || !selLabel) return;

    if (!target) {
      sel.hidden = true;
      selLabel.hidden = true;
      return;
    }

    const box = docRect(target);
    place(sel, box);
    sel.hidden = false;

    const index = sections.indexOf(target);
    selLabel.textContent = index >= 0 ? labels[index] : "";
    selLabel.style.top = px(Math.max(0, box.top - 22));
    selLabel.style.left = px(box.left);
    selLabel.hidden = false;
  }

  /* Width and height labels, one pair per section. Drawn for every section so
   * toggling Dimensions has an immediate effect like the other overlays, and so
   * the column setting's real rendered width is visible across the whole page
   * rather than only under the cursor. */
  function renderDimensions() {
    for (let i = 0; i < sections.length; i++) {
      const box = docRect(sections[i]);
      const dimW = dimWEls[i];
      const dimH = dimHEls[i];
      if (!dimW || !dimH) continue;

      if (!overlays.dimensions) {
        dimW.hidden = true;
        dimH.hidden = true;
        continue;
      }

      dimW.textContent = px(Math.round(box.width));
      dimW.style.top = px(Math.max(0, box.top - 22));
      dimW.style.left = px(box.left + box.width / 2);
      dimW.hidden = false;

      dimH.textContent = px(Math.round(box.height));
      dimH.style.top = px(box.top + box.height / 2);
      dimH.style.left = px(box.left);
      dimH.hidden = false;
    }
  }

  function renderSpacing() {
    const nodes = layer.querySelectorAll<HTMLElement>(".so-gap");
    if (!overlays.spacing) {
      nodes.forEach((node) => (node.hidden = true));
      return;
    }

    /* One guide per neighbouring pair, drawn in the gap itself. The gap is
     * next.top - prev.bottom: real rendered distance, whatever its CSS source. */
    let pair = 0;
    for (let i = 0; i < sections.length - 1; i++) {
      const prev = docRect(sections[i]);
      const next = docRect(sections[i + 1]);
      const gap = next.top - (prev.top + prev.height);
      if (gap <= 0.5) continue;

      const node = nodes[pair];
      if (!node) break;
      const center = prev.left + prev.width / 2;
      node.style.top = px(prev.top + prev.height);
      node.style.height = px(gap);
      node.style.left = px(center - 1);
      const label = node.querySelector<HTMLElement>(".so-gap-label");
      if (label) {
        label.textContent = px(Math.round(gap));
        label.style.top = px(gap / 2);
      }
      node.hidden = false;
      pair++;
    }
    for (let i = pair; i < nodes.length; i++) nodes[i].hidden = true;
  }

  function renderColumns() {
    const main = document.querySelector<HTMLElement>("#main");
    const line = layer.querySelectorAll<HTMLElement>(".so-column");
    const label = layer.querySelector<HTMLElement>(".so-column-label");
    if (!overlays.columns || !main) {
      line.forEach((node) => (node.hidden = true));
      if (label) label.hidden = true;
      return;
    }

    const box = docRect(main);
    line.forEach((node) => {
      node.style.top = px(box.top);
      node.style.height = px(box.height);
      node.hidden = false;
    });
    // Two edges: the first and last children hold left/right respectively.
    line[0]?.style.setProperty("left", px(box.left));
    line[line.length - 1]?.style.setProperty("left", px(box.left + box.width));

    if (label) {
      label.textContent = px(Math.round(box.width));
      label.style.top = px(Math.max(0, box.top - 20));
      label.style.left = px(box.left + box.width / 2);
      label.hidden = false;
    }
  }

  function renderBaseline() {
    const grid = layer.querySelector<HTMLElement>(".so-baseline");
    const main = document.querySelector<HTMLElement>("#main");
    if (!grid || !overlays.baseline || !main) {
      if (grid) grid.hidden = true;
      return;
    }

    const facts = deps.getFacts();
    const leading = Math.max(8, facts.leading || 24);
    const top = docRect(main).top;
    const height = document.documentElement.scrollHeight - top;

    grid.style.top = px(top);
    grid.style.height = px(Math.max(0, height));
    grid.style.backgroundImage = `repeating-linear-gradient(
      to bottom,
      var(--inspector-grid, rgba(155, 177, 255, 0.08)) 0,
      var(--inspector-grid, rgba(155, 177, 255, 0.08)) 1px,
      transparent 1px,
      transparent ${px(leading)}
    )`;
    grid.hidden = false;
  }

  function renderRulers() {
    // Visibility is derived here, not from `hidden` state: toggling the ruler
    // on after the inspector is already active must reveal it, and off must
    // clear it. The `hidden` flag is set in exactly one place per pass.
    ruler.hidden = !overlays.ruler;
    if (!overlays.ruler) return;
    const h = ruler.querySelector<HTMLElement>(".so-ruler-h");
    const v = ruler.querySelector<HTMLElement>(".so-ruler-v");
    if (!h || !v) return;

    h.innerHTML = "";
    v.innerHTML = "";
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const sx = window.scrollX;
    const sy = window.scrollY;
    const step = 100;

    for (let x = Math.floor(sx / step) * step; x <= sx + vw; x += step) {
      const screen = x - sx;
      const tick = document.createElement("span");
      tick.className = "so-tick";
      tick.style.left = px(screen);
      h.appendChild(tick);

      if (x % 200 === 0) {
        const label = document.createElement("span");
        label.className = "so-tick-label";
        label.style.left = px(screen + 3);
        label.textContent = String(x);
        h.appendChild(label);
      }
    }

    for (let y = Math.floor(sy / step) * step; y <= sy + vh; y += step) {
      const screen = y - sy;
      const tick = document.createElement("span");
      tick.className = "so-tick";
      tick.style.top = px(screen);
      v.appendChild(tick);

      if (y % 200 === 0) {
        const label = document.createElement("span");
        label.className = "so-tick-label so-tick-label-v";
        label.style.top = px(screen + 2);
        label.textContent = String(y);
        v.appendChild(label);
      }
    }
  }

  /* --- section info ------------------------------------------------ */

  function renderInfo() {
    const panel = deps.infoPanel;
    if (!panel) return;

    if (!selected) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }

    panel.hidden = false;
    const box = selected.getBoundingClientRect();
    const index = sections.indexOf(selected);
    const prev = index > 0 ? sections[index - 1] : null;
    const next = index >= 0 && index < sections.length - 1 ? sections[index + 1] : null;
    const main = document.querySelector<HTMLElement>("#main");
    const mainBox = main?.getBoundingClientRect();

    const gapAbove =
      prev && mainBox
        ? box.top - prev.getBoundingClientRect().bottom
        : mainBox
          ? box.top - mainBox.top
          : 0;
    const gapBelow =
      next && mainBox
        ? next.getBoundingClientRect().top - box.bottom
        : mainBox
          ? mainBox.bottom - box.bottom
          : 0;

    const cs = getComputedStyle(selected);
    const maxWidth = effectiveMaxWidth(selected);

    const rows: Array<[string, string]> = [
      ["Width", px(Math.round(box.width))],
      ["Max width", maxWidth === "none" ? "—" : maxWidth],
      ["Height", px(Math.round(box.height))],
      ["Top spacing", px(Math.round(gapAbove))],
      ["Bottom spacing", px(Math.round(gapBelow))],
      ["Alignment", cs.textAlign],
    ];

    const label = index >= 0 ? labels[index] : "Section";
    const table = document.createElement("table");
    table.className = "so-info-table";

    const caption = document.createElement("caption");
    caption.textContent = label;
    table.appendChild(caption);

    for (const [name, value] of rows) {
      const row = table.insertRow();
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = name;
      const td = document.createElement("td");
      td.textContent = value;
      row.append(th, td);
    }

    const note = document.createElement("p");
    note.className = "so-info-note";
    note.textContent = `margin-top ${cs.marginTop} · padding ${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`;

    panel.innerHTML = "";
    panel.append(table, note);
  }

  /* --- refresh ------------------------------------------------------ */

  function refresh() {
    if (!active || destroyed) return;
    renderOutlines();
    renderSelection();
    renderDimensions();
    renderSpacing();
    renderColumns();
    renderBaseline();
    renderRulers();
    renderInfo();
  }

  function scheduleRefresh() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      refresh();
    });
  }

  function onScroll() {
    if (!active || destroyed) return;
    if (!overlays.ruler) return;
    scheduleRefresh();
  }

  /* --- hover / selection ------------------------------------------- */

  function select(el: HTMLElement) {
    selected = el;
    renderSelection();
    renderInfo();
  }

  function attach(el: HTMLElement) {
    const over = () => {
      if (hovered !== el) {
        hovered = el;
        renderSelection();
      }
    };
    const out = (event: PointerEvent) => {
      const to = event.relatedTarget as Node | null;
      if (to && el.contains(to)) return;
      if (hovered === el) {
        hovered = null;
        renderSelection();
      }
    };
    const click = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE)) return;
      select(el);
    };
    sectionListeners.set(el, { over, out, click });
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerout", out);
    el.addEventListener("click", click);
  }

  function detachAll() {
    for (const el of sections) {
      const handlers = sectionListeners.get(el);
      if (!handlers) continue;
      el.removeEventListener("pointerover", handlers.over);
      el.removeEventListener("pointerout", handlers.out);
      el.removeEventListener("click", handlers.click);
    }
  }

  function buildLayers() {
    layer.innerHTML = "";
    for (const name of ["so-selected", "so-selected-label"]) {
      layer.appendChild(el(name));
    }

    dimWEls = sections.map(() => {
      const node = el("so-dim-w");
      layer.appendChild(node);
      return node;
    });
    dimHEls = sections.map(() => {
      const node = el("so-dim-h");
      layer.appendChild(node);
      return node;
    });

    for (const name of ["so-column", "so-column"]) {
      layer.appendChild(el(name));
    }
    const columnLabel = el("so-column-label");
    layer.appendChild(columnLabel);

    const gapCount = Math.max(0, sections.length - 1);
    for (let i = 0; i < gapCount; i++) {
      const gap = el("so-gap");
      const label = el("so-gap-label");
      gap.appendChild(label);
      layer.appendChild(gap);
    }

    layer.appendChild(el("so-baseline"));

    outlineEls = sections.map(() => {
      const node = el("so-outline");
      layer.appendChild(node);
      return node;
    });
  }

  /* --- lifecycle ---------------------------------------------------- */

  function setActive(next: boolean) {
    if (destroyed || next === active) return;
    active = next;

    if (next) {
      sections = Array.from(
        document.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
      );
      if (sections.length === 0) {
        sections = Array.from(
          document.querySelectorAll<HTMLElement>(FALLBACK_SELECTOR),
        );
      }
      labels = sections.map((section, index) => sectionLabel(section, index));

      buildLayers();
      sections.forEach(attach);
      document.documentElement.classList.add(ROOT_CLASS);
      layer.hidden = false;

      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", scheduleRefresh);

      const main = document.querySelector<HTMLElement>("#main");
      if (main && typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(scheduleRefresh);
        observer.observe(main);
      }
    } else {
      detachAll();
      hovered = null;
      selected = null;
      sections = [];
      labels = [];
      outlineEls = [];
      dimWEls = [];
      dimHEls = [];

      removeEventListener("scroll", onScroll);
      removeEventListener("resize", scheduleRefresh);
      observer?.disconnect();
      observer = null;

      document.documentElement.classList.remove(ROOT_CLASS);
      layer.hidden = true;
      layer.innerHTML = "";
      ruler.hidden = true;
    }
  }

  function setOverlay(name: OverlayName, on: boolean) {
    overlays[name] = on;
    if (active) refresh();
  }

  function destroy() {
    if (destroyed) return;
    setActive(false);
    destroyed = true;
    layer.remove();
    ruler.remove();
  }

  return { setActive, setOverlay, refresh, destroy };
}
