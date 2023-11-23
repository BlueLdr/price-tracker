import { useContext } from "react";

import { Modal } from "~/components";
import { useModalTarget } from "~/utils";
import { ModalsContext } from "~/context";

import Button from "@mui/material/Button";
import Delete from "@mui/icons-material/Delete";

//================================================

export const DeleteProductModal: React.FC = () => {
  const { deleteProductTarget, setDeleteProductTarget } =
    useContext(ModalsContext);

  const onClose = () => setDeleteProductTarget(undefined);

  const [open, product, TransitionProps] = useModalTarget(
    deleteProductTarget?.target,
  );

  const onConfirm = () => {
    if (product) {
      deleteProductTarget?.onSave(product.name, {} as any);
      onClose();
    }
  };

  return (
    <Modal
      id="delete-product-modal"
      open={open}
      onClose={onClose}
      confirmButton={
        <Button color="error" startIcon={<Delete />} onClick={onConfirm}>
          Delete
        </Button>
      }
      cancelButton={<Button>Cancel</Button>}
      TransitionProps={TransitionProps}
    >
      Are you sure you want to delete the product "{product?.name}" and all its
      listings?
    </Modal>
  );
};
