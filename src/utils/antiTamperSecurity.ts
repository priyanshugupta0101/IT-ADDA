/**
 * Anti-Tamper & UI Hardening Security Utility
 * Protects platform source code, blocks right-click inspect, and enforces server-authoritative integrity.
 */

export function initAntiTamperProtection(): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Disable Right-Click (Context Menu) across all elements and touch hold
  const handleContextMenu = (e: MouseEvent | Event) => {
    e.preventDefault();
    e.stopPropagation();
    if ('stopImmediatePropagation' in e) {
      e.stopImmediatePropagation();
    }
    return false;
  };

  // 2. Prevent selecting and dragging static content for copying
  const handleSelectStart = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return true;
    }
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
    return false;
  };

  // 3. Block DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K, Ctrl+U, Ctrl+S, etc.)
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+Shift+I (Inspect) or Cmd+Option+I
    if (
      (ctrlOrCmd && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) ||
      (isMac && e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+Shift+J (Console) or Cmd+Option+J
    if (
      (ctrlOrCmd && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) ||
      (isMac && e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+Shift+C (Inspect Element) or Cmd+Option+C
    if (
      (ctrlOrCmd && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) ||
      (isMac && e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+Shift+K (Firefox DevTools) or Cmd+Option+K
    if (
      (ctrlOrCmd && e.shiftKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) ||
      (isMac && e.metaKey && e.altKey && (e.key === 'K' || e.key === 'k'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+U (View Page Source) or Cmd+U
    if (ctrlOrCmd && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+S (Save Page)
    if (ctrlOrCmd && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+P (Print Page / PDF save)
    if (ctrlOrCmd && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
      const target = e.target as HTMLElement | null;
      if (target?.closest('.allow-print')) return true;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  };

  // 4. Keyboard & Context menu listeners
  let clearTimer: any = null;

  // 6. Attach event listeners at capturing phase
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  document.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  document.addEventListener('keydown', handleKeyDown, { capture: true });
  document.addEventListener('selectstart', handleSelectStart, { capture: true });
  document.addEventListener('dragstart', handleDragStart, { capture: true });

  return () => {
    clearInterval(clearTimer);
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('selectstart', handleSelectStart, { capture: true });
    document.removeEventListener('dragstart', handleDragStart, { capture: true });
  };
}
