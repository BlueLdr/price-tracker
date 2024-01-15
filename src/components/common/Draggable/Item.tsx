import {
  memo,
  useContext,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { DraggableCore } from "react-draggable";

import { DragModeContext } from "~/context";
import { useValueRef } from "~/utils";
import {
  DEBUG_SHOW_HITBOXES,
  DRAGGED_ITEM_CONTAINER_ID,
} from "~/utils/constants";
import {
  DraggableBinContext,
  getDraggableHandleClassName,
  DraggableItemContext,
  getElementVisibleContentHeight,
} from "./utils";

import Box from "@mui/material/Box";

import type { BoxProps } from "@mui/material/Box";
import type { WithChildren } from "~/utils";
import type { StyleProps } from "~/theme";
import type {
  DraggableCoreProps,
  DraggableEventHandler,
} from "react-draggable";
import type { DraggableItemMeta } from "./utils";

//================================================

const heldItemSiblingStyle: StyleProps = {
  position: "relative",
  "&::before": {
    content: '" "',
    boxShadow: DEBUG_SHOW_HITBOXES
      ? "0 0 2px 2px rgba(255,0,0,0.3)"
      : undefined,
    display: "block",
    position: "absolute",
    top: 0,
    left: "-100vh",
    height: "100%",
    width: "200vw",
  },
};

//================================================

interface HeldItemPortalProps extends WithChildren {
  isActive: boolean;
}
const HeldItemPortal: React.FC<HeldItemPortalProps> = memo(
  ({ isActive, children }) => {
    const container = useValueRef(
      document.getElementById(DRAGGED_ITEM_CONTAINER_ID),
    );

    return (
      <>
        {isActive && container.current
          ? createPortal(children, container.current)
          : children}
      </>
    );
  },
);

//================================================

export interface DraggableItemRef {
  getHeight: () => number;
}

export interface DraggableItemProps extends Partial<DraggableCoreProps> {
  index: number;
  itemRef?: React.Ref<DraggableItemRef>;
  data: any;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  onStart: onStartProp,
  onStop: onStopProp,
  onDrag: onDragProp,
  children,
  index,
  itemRef,
  data,
  ...props
}) => {
  const {
    dragEnabled,
    isDragging,
    dragLevel,
    heldItemMeta,
    setHeldItemMeta,
    setDropTargetMeta,
  } = useContext(DragModeContext);
  const { level: binLevel, id: binId } = useContext(DraggableBinContext);
  const level = binLevel + 1;

  const id = `draggableItem-${useId()}`;
  const ref = useRef<HTMLDivElement>(null);
  const isActive = id === heldItemMeta?.id;
  const ctxValue = useMemo<DraggableItemMeta>(
    () => ({
      id,
      index,
      level,
      isActive,
      nodeRef: ref,
    }),
    [id, index, level, isActive],
  );

  useImperativeHandle(
    itemRef,
    () => ({
      getHeight: () => getElementVisibleContentHeight(ref.current, 0),
    }),
    [],
  );

  const [initialPosition, setInitialPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [position, setPosition] = useState(0);
  const lastTouchY = useRef(0);

  const onStart: DraggableEventHandler = (e, eventData) => {
    if (isDragging || dragLevel === level) {
      return false;
    }
    if (onStartProp?.(e, eventData) === false) {
      return false;
    }

    if ("touches" in e && e.touches.length) {
      lastTouchY.current = e.touches[0].clientY;
    }
    const rect = ref.current?.getBoundingClientRect();
    setInitialPosition({
      x: rect?.x ?? 0,
      y: rect?.y ?? 0,
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
    });

    setHeldItemMeta({
      id,
      index,
      level,
      nodeRef: ref,
      data,
      binId,
    });
    setDropTargetMeta({
      binId,
      index,
      onFinishDrag: () => {},
    });
  };
  const onStop: DraggableEventHandler = (e, data) => {
    if (!isDragging || dragLevel !== level) {
      return false;
    }
    if (onStopProp?.(e, data) === false) {
      return false;
    }
    setInitialPosition({ x: 0, y: 0, width: 0, height: 0 });
    setPosition(0);
    setHeldItemMeta(null);
    setDropTargetMeta(null);
  };

  const onDrag: DraggableEventHandler = (e, data) => {
    if (onDragProp?.(e, data) === false) {
      return false;
    }
    if ((e as MouseEvent).movementY) {
      setPosition(value => value + (e as MouseEvent).movementY);
    } else if ("changedTouches" in e && e.changedTouches.length) {
      const y = (e as TouchEvent).changedTouches?.[0]?.clientY;
      const delta = y - lastTouchY.current;
      if (delta === 0) {
        return;
      }
      setPosition(value => value + delta);
      lastTouchY.current = y;
    }
  };

  const style = useMemo(
    () =>
      ({
        pointerEvents: "none",
        position: "absolute",
        transform: `translateY(${position}px)`,
        top: `${initialPosition.y}px`,
        left: `${initialPosition.x}px`,
        width: `${initialPosition.width}px`,
        height: `${initialPosition.height}px`,
      }) satisfies BoxProps["style"],
    [initialPosition, position],
  );

  if (!binId || binLevel < 0) {
    return children;
  }

  return (
    <DraggableItemContext.Provider value={ctxValue}>
      <DraggableCore
        key={id}
        nodeRef={ref}
        handle={`[id='${id}'] .${getDraggableHandleClassName(level)}`}
        disabled={!dragEnabled || (isDragging && !isActive)}
        {...props}
        onDrag={onDrag}
        onStart={onStart}
        onStop={onStop}
      >
        <div
          style={
            isActive ? { display: "none", pointerEvents: "none" } : undefined
          }
        >
          <HeldItemPortal isActive={isActive}>
            {
              <Box
                sx={isDragging && !isActive ? heldItemSiblingStyle : undefined}
                key={id}
                id={id}
                ref={ref}
                style={isActive ? style : undefined}
                onClickCapture={isActive ? e => e.preventDefault() : undefined}
              >
                {children}
              </Box>
            }
          </HeldItemPortal>
        </div>
      </DraggableCore>
    </DraggableItemContext.Provider>
  );
};
