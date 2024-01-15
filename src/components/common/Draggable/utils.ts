import { createContext } from "react";

import type { FinishDragHandler } from "~/context";

//================================================

export const getDraggableHandleClassName = (level: number) =>
  `draggableHandle-${level}`;

export const ROOT_BIN_ID = "draggableBin-rootBin";

//================================================

export interface DraggableBinMeta {
  id: string;
  level: number;
  isTarget: boolean;
  listRef: React.RefObject<HTMLElement>;
  onFinishDrag: FinishDragHandler;
}
export const DraggableBinContext = createContext<DraggableBinMeta>({
  id: "",
  level: -1,
  isTarget: false,
  listRef: { current: null },
  onFinishDrag: () => {},
});

export interface DraggableItemMeta {
  id: string;
  index: number;
  level: number;
  isActive: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
}
export const DraggableItemContext = createContext<DraggableItemMeta>({
  id: "",
  index: -1,
  level: -1,
  isActive: false,
  nodeRef: { current: null },
});

//================================================

export const getElementVisibleContentHeight = (
  element: Element | null | undefined,
  defaultHeight?: number,
) => {
  if (!element) {
    return defaultHeight ?? 0;
  }
  const style = window.getComputedStyle(element);
  const paddingTop = Number(style.paddingTop.replace(/px$/, ""));
  const paddingBottom = Number(style.paddingBottom.replace(/px$/, ""));
  let height = Number(style.height.replace(/px$/, ""));
  if (style.boxSizing !== "content-box") {
    height = height - paddingTop - paddingBottom;
  }
  return isNaN(height) ? defaultHeight ?? 0 : height;
};
