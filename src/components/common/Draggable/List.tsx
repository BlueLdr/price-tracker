import {
  useState,
  Children,
  isValidElement,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";

import { DragModeContext } from "~/context";
import { DraggableBinContext, getElementVisibleContentHeight } from "./utils";
import { DraggableItem } from "./Item";
import { DEBUG_SHOW_HITBOXES } from "~/utils/constants";

import Box from "@mui/material/Box";
import List from "@mui/material/List";

import type { DraggableEventHandler } from "react-draggable";
import type { DraggableItemRef } from "./Item";
import type { StyleProps } from "~/theme";

//================================================

// must drag over the top or bottom X portion of the element's height to switch placement
const PLACEMENT_THRESHOLD = 0.4;
const DEFAULT_ITEM_HEIGHT = 48;
const SPACING_FACTOR = 4;

const getPlacement = (
  mouseY: number,
  itemY: number,
  itemHeight: number,
  threshold = PLACEMENT_THRESHOLD,
) => {
  const positionPercent = (mouseY - itemY) / itemHeight;
  console.log(`positionPercent: `, positionPercent, mouseY, itemY, itemHeight);
  if (positionPercent <= threshold) {
    return "before";
  }
  if (positionPercent >= 1 - threshold) {
    return "after";
  }
};

//================================================

const baseTransitionStyle: StyleProps = {
  transition: theme =>
    theme.transitions.create(["padding", "margin", "height", "top", "bottom"], {
      duration: 175,
      easing: "ease-out",
    }),
};

//================================================

export interface DraggableItemListProps<T = any> {
  children: React.ReactElement<{ data: T }>[];
  spacing: number;
  fullWidth?: boolean;
  muiList?: boolean;
}

export const DraggableItemList: React.FC<DraggableItemListProps> = ({
  children,
  spacing,
  fullWidth,
  muiList,
}) => {
  const {
    isDragging,
    dragLevel,
    heldItemMeta,
    dragEnabled,
    dropTargetMeta,
    setDropTargetMeta,
  } = useContext(DragModeContext);
  const {
    id: binId,
    level,
    listRef,
    onFinishDrag,
  } = useContext(DraggableBinContext);

  const isDraggingAtThisLevel = isDragging && dragLevel === level + 1;
  const isDraggingFrom = isDraggingAtThisLevel && binId === heldItemMeta?.binId;
  const isDraggingTo = isDraggingAtThisLevel && binId === dropTargetMeta?.binId;
  const isDraggingToSameBin = isDraggingFrom && isDraggingTo;

  const childrenCount = Children.count(children);
  const lastIndex = childrenCount - 1;
  const childrenRefs = useRef(new Map<number, DraggableItemRef>());

  const activeIndex =
    isDraggingAtThisLevel && isDraggingTo && dropTargetMeta
      ? dropTargetMeta?.index
      : -1;

  //================================================

  const [enableDragModeTransitions, setEnableDragModeTransitions] =
    useState(isDragging);
  const transitionStyle =
    enableDragModeTransitions && isDragging ? baseTransitionStyle : {};

  useEffect(() => {
    setEnableDragModeTransitions(isDragging);
  }, [isDragging]);

  //================================================
  // Lock list height during dragging to prevent the rest of the page from
  // shifting during animations

  const spacingPx = spacing * SPACING_FACTOR;
  const heldItemHeight = getElementVisibleContentHeight(
    heldItemMeta?.nodeRef?.current,
    DEFAULT_ITEM_HEIGHT,
  );
  const listHeight =
    Children.toArray(children).reduce<number>((total, _, index) => {
      if (muiList) {
        console.log(
          `item ${index} height`,
          (childrenRefs.current.get(index)?.getHeight() ?? 0) +
            (index === 0 && !muiList ? 0 : spacingPx),
        );
      }
      return (
        total +
        (childrenRefs.current.get(index)?.getHeight() ?? 0) +
        (index === 0 && !muiList ? 0 : spacingPx)
      );
    }, 0) +
    (isDraggingToSameBin
      ? 0
      : (isDraggingTo ? 1 : isDraggingFrom ? -1 : 0) *
        (heldItemHeight + spacingPx));

  if (muiList) {
    console.log(`listHeight: `, listHeight);
  }

  //================================================

  const onStop = useCallback<DraggableEventHandler>(() => {
    if (
      (!isDraggingTo && !isDraggingFrom) ||
      !isDraggingAtThisLevel ||
      !heldItemMeta ||
      !dropTargetMeta
    ) {
      return;
    }
    onFinishDrag(heldItemMeta, dropTargetMeta);
    if (!isDraggingToSameBin) {
      dropTargetMeta.onFinishDrag(heldItemMeta, dropTargetMeta);
    }
  }, [
    dropTargetMeta,
    heldItemMeta,
    isDraggingAtThisLevel,
    isDraggingFrom,
    isDraggingTo,
    isDraggingToSameBin,
    onFinishDrag,
  ]);

  return (
    <Box
      ref={listRef}
      style={
        isDraggingAtThisLevel
          ? {
              height: `${listHeight}px`,
            }
          : undefined
      }
      component={muiList ? List : undefined}
      sx={{
        width: fullWidth ? "100%" : undefined,
        ...(!!listHeight && dragLevel === level + 1
          ? {
              ...transitionStyle,
            }
          : {}),
        ...(DEBUG_SHOW_HITBOXES
          ? {
              boxShadow:
                dragLevel === level + 1
                  ? "0 0 0 1px rgba(0,0,255,0.3)"
                  : "0 0 0 1px rgba(10,180,255,0.5)",
            }
          : undefined),
      }}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        const itemRef = childrenRefs.current.get(index);
        const isHeldItem =
          binId === heldItemMeta?.binId && index === heldItemMeta?.index;
        const heldItemIsBefore =
          isDraggingToSameBin && heldItemMeta?.index === index - 1
            ? activeIndex === index - 1
            : isDraggingTo && activeIndex === index;
        const isFirst =
          (index === 0 && !heldItemIsBefore) ||
          (index === 1 &&
            isDraggingFrom &&
            heldItemMeta?.index === 0 &&
            (!isDraggingTo || activeIndex !== 0));

        const heldItemIsAfter = isDraggingTo && activeIndex === index + 1;
        const isLast =
          (index === lastIndex && !heldItemIsAfter) ||
          (index === lastIndex - 1 &&
            isDraggingFrom &&
            heldItemMeta?.index === lastIndex &&
            (!isDraggingTo || activeIndex !== lastIndex));

        const heldItemIsFirst = heldItemIsBefore && activeIndex === 0;
        const heldItemIsLast =
          heldItemIsAfter &&
          activeIndex === (isDraggingFrom ? lastIndex : childrenCount);
        const heldItemSpace =
          heldItemHeight / SPACING_FACTOR +
          spacing / ((heldItemIsFirst || heldItemIsLast) && !muiList ? 2 : 1);

        const paddingTop =
          (heldItemIsBefore ? heldItemSpace : 0) +
          (isFirst && !muiList ? 0 : spacing / 2);
        const paddingBottom =
          (heldItemIsAfter && isLast ? heldItemSpace : 0) +
          (isLast && !muiList ? 0 : spacing / 2);

        const contentHeight = itemRef?.getHeight() ?? DEFAULT_ITEM_HEIGHT;
        if (level === dragLevel + 1 && contentHeight > DEFAULT_ITEM_HEIGHT) {
          // console.log(`${index} contentHeight: `, contentHeight);
        }

        //================================================

        const onMouseMoveOverItem = (
          e: React.MouseEvent<HTMLDivElement>,
          index: number,
        ) => {
          const itemBounds = e.currentTarget.getBoundingClientRect();
          const itemY = itemBounds.y + (heldItemIsBefore ? heldItemSpace : 0);
          const itemHeight =
            itemBounds.height + (heldItemIsBefore ? -heldItemSpace : 0);
          const placement = getPlacement(
            e.clientY,
            itemY,
            itemHeight,
            activeIndex === -1 ? 0.5 : PLACEMENT_THRESHOLD,
          );
          let newIndex: number;
          if (
            isDraggingToSameBin &&
            placement === "before" &&
            index === heldItemMeta?.index + 1
          ) {
            newIndex = index - 1;
          } else {
            newIndex = placement === "before" ? index : index + 1;
          }

          if (newIndex !== activeIndex) {
            setDropTargetMeta({ binId, index: newIndex, onFinishDrag });
          }
        };

        return (
          <Box
            key={child.key}
            component={muiList ? "li" : undefined}
            style={
              isDraggingAtThisLevel
                ? { height: isHeldItem ? 0 : `${contentHeight}px` }
                : undefined
            }
            sx={{
              ...(isDragging ? transitionStyle : undefined),
              boxSizing: "content-box",
              ...(DEBUG_SHOW_HITBOXES
                ? {
                    boxShadow: !isHeldItem
                      ? "0 0 0 1px rgba(0,255,0,0.3)"
                      : "0 0 0 1px rgba(10,255,100,0.5)",
                  }
                : undefined),
              overflow: dragEnabled ? "visible" : undefined,
              ...(isHeldItem
                ? {
                    paddingTop: 0,
                    paddingBottom: 0,
                  }
                : {
                    paddingTop: theme => theme.spacing(paddingTop),
                    paddingBottom: theme => theme.spacing(paddingBottom),
                  }),
            }}
            onMouseMove={
              isDraggingAtThisLevel && !isHeldItem
                ? e => onMouseMoveOverItem(e, index)
                : undefined
            }
          >
            <DraggableItem
              index={index}
              itemRef={ref => {
                if (ref) {
                  childrenRefs.current.set(index, ref);
                }
              }}
              onStop={onStop}
              data={child.props.data}
            >
              {child}
            </DraggableItem>
          </Box>
        );
      })}
    </Box>
  );
};
