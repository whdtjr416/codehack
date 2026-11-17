// Physical KeyR also works while the Korean input source is selected.
export function isCodingRunShortcut(event: {
  key: string;
  code: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  isComposing: boolean;
}) {
  return (
    event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.isComposing &&
    (event.code === "KeyR" || event.key.toLowerCase() === "r")
  );
}
