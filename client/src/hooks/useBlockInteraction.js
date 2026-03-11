import { useEffect } from "react";

/**
 * Blocks all keyboard interaction when `active` is true.
 * Used to prevent background interaction when loader overlays are visible.
 */
export default function useBlockInteraction(active) {
  useEffect(() => {
    if (!active) return;

    const block = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("keydown", block, true);
    return () => window.removeEventListener("keydown", block, true);
  }, [active]);
}
