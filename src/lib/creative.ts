/** Creative mode's state. Session rather than local storage: the annotation
 * layer is a way of reading this visit, so a fresh tab starts from the plain
 * sheet while every navigation inside this one keeps the mode. */

export const CREATIVE_STORAGE_KEY = "porto:creative";

export function writeOpen(open: boolean): void {
  try {
    if (open) sessionStorage.setItem(CREATIVE_STORAGE_KEY, "open");
    else sessionStorage.removeItem(CREATIVE_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode): the layer still toggles for this page.
  }
}

/** Pre-paint bootstrap, inline in <head> because a module script is deferred
 * and would paint the plain sheet first, then jump into annotations. */
export function inlineBootstrap(): string {
  return `try {
  if (sessionStorage.getItem(${JSON.stringify(CREATIVE_STORAGE_KEY)}) === "open") {
    document.documentElement.classList.add("notes-open");
  }
} catch {
  // No storage simply means the default: annotations off.
}`;
}
