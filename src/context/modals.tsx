import { createContext, useMemo, useState } from "react";

import type {
  ModalTarget,
  ProductData,
  ProductListingData,
  ValueAndSetter,
  WithChildren,
} from "~/utils";

//================================================

export type ModalsContext = ValueAndSetter<
  "addProductTarget",
  ModalTarget<ProductData, "name"> | undefined
> &
  ValueAndSetter<
    "editProductTarget",
    ModalTarget<ProductData, "name"> | undefined
  > &
  ValueAndSetter<
    "deleteProductTarget",
    ModalTarget<ProductData, "name"> | undefined
  > &
  ValueAndSetter<
    "addListingTarget",
    ModalTarget<ProductListingData, "url"> | undefined
  > &
  ValueAndSetter<
    "editListingTarget",
    ModalTarget<ProductListingData, "url"> | undefined
  > &
  ValueAndSetter<
    "deleteListingTarget",
    ModalTarget<ProductListingData, "url"> | undefined
  >;

export const ModalsContext = createContext<ModalsContext>({
  addProductTarget: undefined,
  setAddProductTarget: () => {},
  editProductTarget: undefined,
  setEditProductTarget: () => {},
  deleteProductTarget: undefined,
  setDeleteProductTarget: () => {},
  addListingTarget: undefined,
  setAddListingTarget: () => {},
  editListingTarget: undefined,
  setEditListingTarget: () => {},
  deleteListingTarget: undefined,
  setDeleteListingTarget: () => {},
});

export const ModalsContextProvider: React.FC<WithChildren> = ({ children }) => {
  const [editProductTarget, setEditProductTarget] =
    useState<ModalTarget<ProductData, "name">>();
  const [deleteProductTarget, setDeleteProductTarget] =
    useState<ModalTarget<ProductData, "name">>();
  const [addProductTarget, setAddProductTarget] =
    useState<ModalTarget<ProductData, "name">>();

  const [editListingTarget, setEditListingTarget] =
    useState<ModalTarget<ProductListingData, "url">>();
  const [deleteListingTarget, setDeleteListingTarget] =
    useState<ModalTarget<ProductListingData, "url">>();
  const [addListingTarget, setAddListingTarget] =
    useState<ModalTarget<ProductListingData, "url">>();

  const value = useMemo(
    () => ({
      addProductTarget,
      setAddProductTarget,
      editProductTarget,
      setEditProductTarget,
      deleteProductTarget,
      setDeleteProductTarget,
      addListingTarget,
      setAddListingTarget,
      editListingTarget,
      setEditListingTarget,
      deleteListingTarget,
      setDeleteListingTarget,
    }),
    [
      addProductTarget,
      editProductTarget,
      deleteProductTarget,
      addListingTarget,
      editListingTarget,
      deleteListingTarget,
    ],
  );

  return (
    <ModalsContext.Provider value={value}>{children}</ModalsContext.Provider>
  );
};
