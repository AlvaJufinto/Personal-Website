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
