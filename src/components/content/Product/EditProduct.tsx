"use client";
import { useContext } from "react";

import { Modal } from "~/components";
import { ModalsContext } from "~/context";
import { applyProductUpdates, useModalTarget } from "~/utils";
import { ProductForm } from "./ProductForm";

import Button from "@mui/material/Button";

import type { ProductWithUpdates } from "~/utils";

//================================================

const FORM_ID = "edit-product-form";

//================================================

export const EditProductModal: React.FC = () => {
  const { editProductTarget, setEditProductTarget } = useContext(ModalsContext);

  const [open, target, TransitionProps] = useModalTarget(editProductTarget);
  const onClose = () => setEditProductTarget(undefined);

  const { target: product, onSave } = target ?? {};

  return (
    <Modal
      open={open}
      id="add-product-modal"
      onClose={onClose}
      titleText="Edit Product"
      cancelButton={<Button>Cancel</Button>}
      confirmButton={
        <Button type="submit" form={FORM_ID}>
          Save
        </Button>
      }
      TransitionProps={TransitionProps}
      maxWidth="sm"
      fullWidth
    >
      {product && onSave && (
        <ProductForm
          id={FORM_ID}
          product={product}
          onSave={(newProduct: ProductWithUpdates) => {
            onSave(product.name, applyProductUpdates(newProduct, product));
            onClose();
          }}
        />
      )}
    </Modal>
  );
};
