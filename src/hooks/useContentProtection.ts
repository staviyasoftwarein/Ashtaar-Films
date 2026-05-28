import { useEffect } from 'react';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function useContentProtection() {
  useEffect(() => {
    const blockIfContent = (event: Event) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const blocksDevtools =
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key));
      const blocksSource = event.ctrlKey && key === 'u';
      const blocksCopy = (event.ctrlKey || event.metaKey) && ['c', 'x', 's', 'p'].includes(key);

      if (blocksDevtools || blocksSource || blocksCopy) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('contextmenu', blockIfContent, true);
    document.addEventListener('copy', blockIfContent, true);
    document.addEventListener('cut', blockIfContent, true);
    document.addEventListener('dragstart', blockIfContent, true);
    document.addEventListener('selectstart', blockIfContent, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('contextmenu', blockIfContent, true);
      document.removeEventListener('copy', blockIfContent, true);
      document.removeEventListener('cut', blockIfContent, true);
      document.removeEventListener('dragstart', blockIfContent, true);
      document.removeEventListener('selectstart', blockIfContent, true);
    };
  }, []);
}
