import { Modal } from "~/components";
import { useModalTarget } from "~/utils";

import Button from "@mui/material/Button";
import Delete from "@mui/icons-material/Delete";

import type { ProductGroup } from "~/utils";

//================================================

export interface DeleteGroupModalProps {
  target?: ProductGroup;
  onClose: () => void;
  onRemove: (id: ProductGroup["name"]) => void;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  target,
  onClose,
  onRemove,
}) => {
  const [open, group, TransitionProps] = useModalTarget(target);

  const onConfirm = () => {
    if (group) {
      onRemove(group.name);
      onClose();
    }
  };

  return (
    <Modal
      id="delete-group-modal"
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
      Are you sure you want to delete the group "{group?.name}" and all its
      products?
    </Modal>
  );
};
