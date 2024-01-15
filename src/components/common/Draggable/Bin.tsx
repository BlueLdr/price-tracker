import { useCallback, useContext, useId, useMemo, useRef } from "react";

import { DragModeContext } from "~/context";
import { addItemTo, removeItemFrom } from "~/utils";
import { DEBUG_SHOW_HITBOXES } from "~/utils/constants";
import { DraggableBinContext, ROOT_BIN_ID } from "./utils";

import Box from "@mui/material/Box";

import type { DragDropTargetMeta, DragHeldItemMeta } from "~/context";
import type { WithChildren } from "~/utils";

//================================================

export interface DraggableBinProps<T = any> extends WithChildren {
  updateList: (transform: (curItems: T[]) => T[]) => void;
}

export const DraggableBin: React.FC<DraggableBinProps> = ({
  children,
  updateList,
}) => {
  const { level: parentLevel } = useContext(DraggableBinContext);
  const level = parentLevel + 1;

  const randomId = `draggableBin-${useId()}`;
  const id = parentLevel === -1 ? ROOT_BIN_ID : randomId;
  const onFinishDrag = useCallback(
    <T = any,>(
      heldItemMeta: DragHeldItemMeta<T>,
      dropTargetMeta: DragDropTargetMeta,
    ) => {
      if (
        !heldItemMeta ||
        !dropTargetMeta ||
        (heldItemMeta.binId !== id && dropTargetMeta.binId !== id)
      ) {
        return;
      }

      const fromIndex = heldItemMeta.index;
      const toIndex = dropTargetMeta?.index;

      if (heldItemMeta.binId === dropTargetMeta.binId) {
        return updateList(items => {
          const item = heldItemMeta.data || items[fromIndex];
          const newItems = removeItemFrom(
            items,
            (_, index) => index === fromIndex,
          );
          const effectiveDestIndex = toIndex - (fromIndex < toIndex ? 1 : 0);
          return addItemTo(
            newItems,
            item,
            toIndex < 0 ? "end" : effectiveDestIndex,
          );
        });
      }

      if (heldItemMeta.binId === id) {
        return updateList(items =>
          removeItemFrom(items, (_, index) => index === fromIndex),
        );
      }
      if (dropTargetMeta.binId === id) {
        return updateList(items =>
          addItemTo(items, heldItemMeta.data, toIndex < 0 ? "end" : toIndex),
        );
      }
    },
    [id, updateList],
  );

  const {
    dragLevel,
    isDragging,
    heldItemMeta,
    dropTargetMeta,
    setDropTargetMeta,
  } = useContext(DragModeContext);
  const isTarget = dropTargetMeta?.binId === id;
  const listRef = useRef<HTMLElement>(null);
  const ctxValue = useMemo(
    () => ({ level, isTarget, id, listRef, onFinishDrag }),
    [level, isTarget, id, onFinishDrag],
  );

  const onMouseEnter = () => {
    if (dropTargetMeta?.binId !== id) {
      setDropTargetMeta({ binId: id, index: -1, onFinishDrag });
    }
  };
  const onMouseLeave = () => {
    setDropTargetMeta(null);
  };

  return (
    <DraggableBinContext.Provider value={ctxValue}>
      <Box
        id={id}
        sx={{
          ...(isDragging
            ? {
                position: "relative",
                zIndex: heldItemMeta?.binId === id ? 100 : 99,
                "&::before": {
                  content: '" "',
                  ...(DEBUG_SHOW_HITBOXES
                    ? {
                        boxShadow: isTarget
                          ? "0 0 2px 2px rgba(255,128,0,0.8)"
                          : "0 0 2px 2px rgba(255,128,0,0.3)",
                      }
                    : undefined),
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: "-100vh",
                  height: "100%",
                  width: "200vw",
                },
              }
            : {}),
          ...(isDragging && id === ROOT_BIN_ID
            ? {
                maxWidth: "100vw",
              }
            : {}),
        }}
        {...(isDragging && dragLevel === level + 1
          ? { onMouseEnter, onMouseLeave }
          : {})}
      >
        {children}
      </Box>
    </DraggableBinContext.Provider>
  );
};
