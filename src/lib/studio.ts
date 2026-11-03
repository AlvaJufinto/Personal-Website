/** @format */

/* Typeset studio — the styling controls Creative mode exposes.
 *
 * Single source of truth: the panel markup, the pre-paint bootstrap and the
 * token overrides all read these constants, so an option cannot exist in one
 * place and not the others. The `value`s here are the exact strings the CSS
 * attribute selectors in global.css match on. */

export type StudioKey = "face" | "column" | "leading" | "rhythm" | "motion";

export interface StudioOption {
  value: string;
  label: string;
  /** The literal token value this option writes. */
  readout: string;
}

export interface StudioGroup {
  key: StudioKey;
  label: string;
  options: StudioOption[];
}

export type StudioSettings = Record<StudioKey, string>;

export const STUDIO_STORAGE_KEY = "porto:studio";

export const STUDIO_GROUPS: StudioGroup[] = [
  {
    key: "face",
    label: "Display face",
    options: [
      { value: "grotesk", label: "Bricolage", readout: "variable grotesque" },
      { value: "quiet", label: "Figtree", readout: "the body face" },
      { value: "serif", label: "Old serif", readout: "Palatino, Georgia" },
      { value: "mono", label: "Monospace", readout: "system terminal" },
    ],
  },
  {
    key: "column",
    label: "Column",
    options: [
      { value: "narrow", label: "Narrow", readout: "544 px" },
      { value: "standard", label: "Standard", readout: "600 px" },
      { value: "wide", label: "Wide", readout: "660 px" },
    ],
  },
  {
    key: "leading",
    label: "Leading",
    options: [
      { value: "tight", label: "Tight", readout: "1.45" },
      { value: "golden", label: "Golden", readout: "1.618" },
      { value: "open", label: "Open", readout: "1.8" },
    ],
  },
  {
    key: "rhythm",
    label: "Section rhythm",
    options: [
      { value: "close", label: "Close", readout: "27 px" },
      { value: "balanced", label: "Balanced", readout: "44 px" },
      { value: "airy", label: "Airy", readout: "72 px" },
    ],
  },
  {
    key: "motion",
    label: "Motion",
    options: [
      { value: "auto", label: "System", readout: "honour reduce" },
      { value: "off", label: "Off", readout: "0.01 ms" },
    ],
  },
];

/* Every default is what the site already renders, so a first visit cannot look
 * different from the pre-studio build. */
export const STUDIO_DEFAULTS: StudioSettings = {
  face: "grotesk",
  column: "standard",
  leading: "golden",
  rhythm: "balanced",
  motion: "auto",
};

/* Named configurations over the same option values the groups already offer.
 * A preset never introduces a value the CSS does not know: each `settings`
 * object reuses option values, so applying one is indistinguishable from
 * choosing the same radios by hand. Editorial is the site default on purpose —
 * first visit, Reset and the Editorial preset all agree. */
export interface StudioPreset {
  id: string;
  label: string;
  description: string;
  settings: StudioSettings;
}

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: "editorial",
    label: "Editorial",
    description: "Balanced column, golden leading",
    settings: {
      face: "grotesk",
      column: "standard",
      leading: "golden",
      rhythm: "balanced",
      motion: "auto",
    },
  },
  {
    id: "classic",
    label: "Classic",
    description: "Serif face, generous spacing",
    settings: {
      face: "serif",
      column: "standard",
      leading: "open",
      rhythm: "airy",
      motion: "auto",
    },
  },
  {
    id: "compact",
    label: "Compact",
    description: "Narrow column, tight leading",
    settings: {
      face: "quiet",
      column: "narrow",
      leading: "tight",
      rhythm: "close",
      motion: "auto",
    },
  },
  {
    id: "spacious",
    label: "Spacious",
    description: "Wide column, airy rhythm",
    settings: {
      face: "grotesk",
      column: "wide",
      leading: "open",
      rhythm: "airy",
      motion: "auto",
    },
  },
];

/** The preset whose settings match exactly, or null when the current settings
 * were arrived at by hand and match no single preset. */
export function matchPreset(settings: StudioSettings): StudioPreset | null {
  return (
    STUDIO_PRESETS.find((preset) =>
      STUDIO_GROUPS.every((group) => preset.settings[group.key] === settings[group.key]),
    ) ?? null
  );
}

export function isStudioKey(value: string): value is StudioKey {
  return STUDIO_GROUPS.some((group) => group.key === value);
}

export function normalize(settings: unknown): StudioSettings {
  const stored = (settings ?? {}) as Record<string, unknown>;

  return Object.fromEntries(
    STUDIO_GROUPS.map((group) => {
      const value = stored[group.key];
      const known = group.options.some(
        (option) => option.value === value,
      );
      return [
        group.key,
        known ? (value as string) : STUDIO_DEFAULTS[group.key],
      ];
    }),
  ) as StudioSettings;
}

export function readSettings(): StudioSettings {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(localStorage.getItem(STUDIO_STORAGE_KEY) ?? "null");
  } catch {
    parsed = null;
  }
  return normalize(parsed);
}

export function writeSettings(settings: StudioSettings): void {
  try {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode): the choice still applies to this page.
  }
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(STUDIO_STORAGE_KEY);
  } catch {
    // Nothing to clear without storage.
  }
}

export function applySettings(settings: StudioSettings): void {
  for (const group of STUDIO_GROUPS) {
    document.documentElement.dataset[group.key] = settings[group.key];
  }
}

/* --- Session-scoped UI state -------------------------------------------
 * Settings (above) persist in localStorage across visits. This is the other,
 * shorter-lived half: how the panel was left — open/closed, the inspector's
 * master switch, and each overlay toggle — so navigating the portfolio inside
 * one visit does not collapse the tool. Session rather than local storage, for
 * the same reason Creative mode is: a fresh tab starts from the plain sheet. */

export const STUDIO_UI_STORAGE_KEY = "porto:studio-ui";

export interface StudioUIState {
  open: boolean;
  inspecting: boolean;
  overlays: Record<string, boolean>;
}

export function readStudioUIState(): StudioUIState | null {
  try {
    const parsed = JSON.parse(
      sessionStorage.getItem(STUDIO_UI_STORAGE_KEY) ?? "null",
    );
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as StudioUIState;
  } catch {
    return null;
  }
}

export function writeStudioUIState(state: StudioUIState): void {
  try {
    sessionStorage.setItem(STUDIO_UI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode): the panel still works for this page.
  }
}

/** Pre-paint bootstrap, generated from the same constants as the panel so the
 * allow-list cannot drift. Runs inline in <head> because a module script is
 * deferred and would flash the default column before the stored one applied. */
export function inlineBootstrap(): string {
  const config = {
    storageKey: STUDIO_STORAGE_KEY,
    allowed: Object.fromEntries(
      STUDIO_GROUPS.map((group) => [
        group.key,
        group.options.map((option) => option.value),
      ]),
    ),
    defaults: STUDIO_DEFAULTS,
  };

  // Escaped so a value containing "<" can never close the script element.
  const literal = JSON.stringify(config).replace(/</g, "\\u003c");

  return `(() => {
  const config = ${literal};
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem(config.storageKey) || "{}");
  } catch {
    stored = {};
  }
  for (const key of Object.keys(config.defaults)) {
    const allowed = config.allowed[key];
    const value = stored && stored[key];
    document.documentElement.dataset[key] = allowed.includes(value)
      ? value
      : config.defaults[key];
  }
})();`;
}
