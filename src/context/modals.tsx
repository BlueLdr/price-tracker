import { createContext, useMemo, useState } from "react";

import type {
  ModalTarget,
  Product,
  ProductListing,
  ValueAndSetter,
  WithChildren,
} from "~/utils";

//================================================

export type ModalsContext = ValueAndSetter<
  "addProductTarget",
  ModalTarget<Product, "name"> | undefined
> &
  ValueAndSetter<
    "editProductTarget",
    ModalTarget<Product, "name"> | undefined
  > &
  ValueAndSetter<
    "deleteProductTarget",
    ModalTarget<Product, "name"> | undefined
  > &
  ValueAndSetter<
    "addListingTarget",
    ModalTarget<ProductListing, "url"> | undefined
  > &
  ValueAndSetter<
    "editListingTarget",
    ModalTarget<ProductListing, "url"> | undefined
  > &
  ValueAndSetter<
    "deleteListingTarget",
    ModalTarget<ProductListing, "url"> | undefined
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
    useState<ModalTarget<Product, "name">>();
  const [deleteProductTarget, setDeleteProductTarget] =
    useState<ModalTarget<Product, "name">>();
  const [addProductTarget, setAddProductTarget] =
    useState<ModalTarget<Product, "name">>();

  const [editListingTarget, setEditListingTarget] =
    useState<ModalTarget<ProductListing, "url">>();
  const [deleteListingTarget, setDeleteListingTarget] =
    useState<ModalTarget<ProductListing, "url">>();
  const [addListingTarget, setAddListingTarget] =
    useState<ModalTarget<ProductListing, "url">>();

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
