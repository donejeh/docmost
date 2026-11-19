import { platformModifierKey } from "@/lib";
import { searchSpotlight } from "@/features/search/constants.ts";

/**
 * Shortcuts the page and title editors take over from the browser: Mod+S
 * does nothing, since pages save on their own, and Mod+K opens search.
 * Both cancel the browser's default, which would save the web page or move
 * focus to the browser's own search field. Returns true when it handled the
 * key.
 */
export function handleEditorShortcut(event: KeyboardEvent): boolean {
  if (!platformModifierKey(event)) return false;

  if (event.code === "KeyS") {
    event.preventDefault();
    return true;
  }

  if (event.code === "KeyK") {
    event.preventDefault();
    searchSpotlight.open();
    return true;
  }

  return false;
}
