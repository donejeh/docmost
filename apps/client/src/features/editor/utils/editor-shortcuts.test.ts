import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchSpotlight } from "@/features/search/constants.ts";
import { handleEditorShortcut } from "./editor-shortcuts";

vi.mock("@/features/search/constants.ts", () => ({
  searchSpotlight: { open: vi.fn() },
}));

// ctrlKey and metaKey together count as the platform modifier on any OS
function keydown(code: string, modifier = true) {
  return new KeyboardEvent("keydown", {
    code,
    key: code.replace(/^Key/, "").toLowerCase(),
    ctrlKey: modifier,
    metaKey: modifier,
    bubbles: true,
    cancelable: true,
  });
}

beforeEach(() => vi.mocked(searchSpotlight.open).mockClear());

describe("handleEditorShortcut", () => {
  it("opens search on Mod+K and keeps the browser from handling it", () => {
    const event = keydown("KeyK");

    expect(handleEditorShortcut(event)).toBe(true);
    expect(searchSpotlight.open).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("keeps the browser from saving the web page on Mod+S", () => {
    const event = keydown("KeyS");

    expect(handleEditorShortcut(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(searchSpotlight.open).not.toHaveBeenCalled();
  });

  it.each([
    ["K without the modifier", keydown("KeyK", false)],
    ["another Mod shortcut", keydown("KeyB")],
  ])("leaves %s alone", (_name, event) => {
    expect(handleEditorShortcut(event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(searchSpotlight.open).not.toHaveBeenCalled();
  });
});

describe("Mod+K typed in an editor", () => {
  let editor: Editor;

  afterEach(() => editor?.destroy());

  it("opens search without leaving the key to the browser", () => {
    editor = new Editor({
      extensions: [StarterKit],
      content: "<p>text</p>",
      editorProps: {
        handleDOMEvents: {
          keydown: (_view, event) => handleEditorShortcut(event),
        },
      },
    });
    const event = keydown("KeyK");

    editor.view.dom.dispatchEvent(event);

    expect(searchSpotlight.open).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });
});
