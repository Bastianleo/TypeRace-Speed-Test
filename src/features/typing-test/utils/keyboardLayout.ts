import type { KeyMapEntry } from "../types/typing.types";

/**
 * Layout keyboard TKL (Tenkeyless) yang disederhanakan.
 * `widthUnit` dipakai untuk lebar relatif tombol (1u = tombol standar).
 */
export const KEYBOARD_ROWS: KeyMapEntry[][] = [
  [
    { code: "Backquote", label: "`" },
    { code: "Digit1", label: "1" },
    { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" },
    { code: "Digit4", label: "4" },
    { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" },
    { code: "Digit7", label: "7" },
    { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-" },
    { code: "Equal", label: "=" },
    { code: "Backspace", label: "Backspace", widthUnit: 2 },
  ],
  [
    { code: "Tab", label: "Tab", widthUnit: 1.5 },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[" },
    { code: "BracketRight", label: "]" },
    { code: "Backslash", label: "\\", widthUnit: 1.5 },
  ],
  [
    { code: "CapsLock", label: "Caps", widthUnit: 1.75 },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";" },
    { code: "Quote", label: "'" },
    { code: "Enter", label: "Enter", widthUnit: 2.25 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", widthUnit: 2.25 },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: "," },
    { code: "Period", label: "." },
    { code: "Slash", label: "/" },
    { code: "ShiftRight", label: "Shift", widthUnit: 2.75 },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", widthUnit: 1.25 },
    { code: "MetaLeft", label: "Win", widthUnit: 1.25 },
    { code: "AltLeft", label: "Alt", widthUnit: 1.25 },
    { code: "Space", label: "", widthUnit: 6.25 },
    { code: "AltRight", label: "Alt", widthUnit: 1.25 },
    { code: "MetaRight", label: "Win", widthUnit: 1.25 },
    { code: "ControlRight", label: "Ctrl", widthUnit: 1.25 },
  ],
];

/** Peta karakter -> KeyboardEvent.code, dipakai untuk highlight tombol berikutnya */
export const CHAR_TO_KEYCODE: Record<string, string> = {
  " ": "Space",
  ".": "Period",
  ",": "Comma",
  ";": "Semicolon",
  "'": "Quote",
  "-": "Minus",
  "=": "Equal",
  "/": "Slash",
  "\\": "Backslash",
  "[": "BracketLeft",
  "]": "BracketRight",
  "`": "Backquote",
  "\n": "Enter",
};

export function charToKeyCode(char: string): string | null {
  if (!char) return null;
  const lower = char.toLowerCase();
  if (CHAR_TO_KEYCODE[char]) return CHAR_TO_KEYCODE[char];
  if (/[a-z]/.test(lower)) return `Key${lower.toUpperCase()}`;
  if (/[0-9]/.test(lower)) return `Digit${lower}`;
  return null;
}
