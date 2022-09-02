import * as R from 'react';
import {usePlugin, AppEvents, useAPIEventListener} from '@remnote/plugin-sdk';
import {POPUP_Y_OFFSET} from './constants';

// These hooks are used to keep the floating widget popup
// position synced with the user's caret in the editor.

export const useSyncWidgetPositionWithCaret = (
  floatingWidgetId: string | undefined,
  hidden: boolean
) => {
  const plugin = usePlugin();
  const caretPos = useCaretPosition();
  R.useEffect(() => {
    const effect = async () => {
      if (floatingWidgetId && caretPos) {
        await plugin.window.setFloatingWidgetPosition(floatingWidgetId, {
          top: caretPos.y + POPUP_Y_OFFSET,
          left: caretPos.x,
        });
      }
    };
    if (!hidden) {
      effect();
    }
  }, [caretPos?.x, caretPos?.y, floatingWidgetId, hidden]);
};

const useCaretPosition = (): DOMRect | null => {
  const plugin = usePlugin();
  const [caret, setCaret] = R.useState<DOMRect | null>(null);
  useAPIEventListener(
    AppEvents.EditorTextEdited,
    undefined,
    async () => {
      const caret = await plugin.editor.getCaretPosition();
      setCaret(caret ? caret : null);
    }
  )
  return caret;
};
