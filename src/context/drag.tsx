import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useValueRef } from "~/utils";

import type { DraggableItemMeta } from "~/components";
import type { WithChildren } from "~/utils";

//================================================

export type FinishDragHandler = <T = any>(
  heldItemMeta: DragHeldItemMeta<T>,
  dropTargetMeta: DragDropTargetMeta,
) => void;

export interface DragHeldItemMeta<T = any>
  extends Pick<DraggableItemMeta, "id" | "level" | "nodeRef" | "index"> {
  binId: string;
  data: T | null;
}

export interface DragDropTargetMeta {
  index: number;
  binId: string;
  onFinishDrag: FinishDragHandler;
}

export interface DragModeState {
  dragLevel: number;
  isDragging: boolean;
  dragEnabled: boolean;
  setDragEnabled: (value: boolean) => void;
  heldItemMeta: DragHeldItemMeta | null;
  setHeldItemMeta: (meta: DragHeldItemMeta | null) => void;
  dropTargetMeta: DragDropTargetMeta | null;
  setDropTargetMeta: (meta: DragDropTargetMeta | null) => void;
}

export const DragModeContext = createContext<DragModeState>({
  dragLevel: -1,
  isDragging: false,
  dragEnabled: false,
  setDragEnabled: () => {},
  heldItemMeta: null,
  setHeldItemMeta: () => {},
  dropTargetMeta: null,
  setDropTargetMeta: () => {},
});

//================================================

export interface DragModeContextProviderProps extends WithChildren {
  enabled?: boolean;
}

export const DragModeContextProvider: React.FC<
  DragModeContextProviderProps
> = ({ enabled = false, children }) => {
  const [dragEnabled, setDragEnabled] = useState(enabled);
  const [heldItemMeta, setHeldItemMetaState] =
    useState<DragHeldItemMeta | null>(null);
  const [dropTargetMeta, setDropTargetMetaState] =
    useState<DragDropTargetMeta | null>(null);

  const enableDragRef = useValueRef(dragEnabled);
  const setHeldItemMeta = useCallback(
    (meta: DragHeldItemMeta | null) => {
      if (enableDragRef.current) {
        setHeldItemMetaState(meta);
      }
    },
    [enableDragRef],
  );
  const setDropTargetMeta = useCallback(
    (meta: DragDropTargetMeta | null) => {
      if (enableDragRef.current) {
        setDropTargetMetaState(meta);
      }
    },
    [enableDragRef],
  );

  useEffect(() => {
    if (dragEnabled) {
      return () => setHeldItemMetaState(null);
    }
  }, [dragEnabled]);

  const value = useMemo<DragModeState>(
    () => ({
      dragEnabled,
      setDragEnabled,
      isDragging: dragEnabled && (heldItemMeta?.level ?? -1) > 0,
      dragLevel: heldItemMeta?.level ?? -1,
      heldItemMeta: dragEnabled ? heldItemMeta : null,
      setHeldItemMeta,
      dropTargetMeta: dragEnabled ? dropTargetMeta : null,
      setDropTargetMeta,
    }),
    [
      heldItemMeta,
      dragEnabled,
      setHeldItemMeta,
      dropTargetMeta,
      setDropTargetMeta,
    ],
  );

  return (
    <DragModeContext.Provider value={value}>
      {children}
    </DragModeContext.Provider>
  );
};
