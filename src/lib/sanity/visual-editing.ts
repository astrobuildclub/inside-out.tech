// Visual Editing staat per request aan, niet per build.
// De cookie wordt gezet door /api/preview, dat alleen de Presentation tool
// in de Studio kan aanroepen (met een geldig preview-secret).
import { AsyncLocalStorage } from "node:async_hooks";

export const PREVIEW_COOKIE = "sanity-preview";

const storage = new AsyncLocalStorage<{ visualEditing: boolean }>();

export function runWithVisualEditing<T>(visualEditing: boolean, fn: () => T) {
  return storage.run({ visualEditing }, fn);
}

export function isVisualEditing() {
  return storage.getStore()?.visualEditing ?? false;
}
