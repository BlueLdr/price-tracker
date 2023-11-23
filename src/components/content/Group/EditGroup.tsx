import { Modal } from "~/components";
import { useModalTarget } from "~/utils";
import { GroupForm } from "./GroupForm";

import Button from "@mui/material/Button";

import type { ProductGroup, Updater } from "~/utils";

//================================================

const FORM_ID = "edit-group-form";

interface EditGroupModalProps {
  target?: ProductGroup;
  updateGroup: Updater<ProductGroup, "name">;
  onClose: () => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  target,
  updateGroup,
  onClose,
}) => {
  const [open, group, TransitionProps] = useModalTarget(target);

  const onSave = (newGroup: ProductGroup) => {
    if (group) {
      updateGroup(group.name, newGroup);
      onClose();
    }
  };

  return (
    <Modal
      id={`${FORM_ID}-modal`}
      open={open}
      onClose={onClose}
      titleText="Edit Group"
      cancelButton={<Button>Cancel</Button>}
      confirmButton={
        <Button type="submit" form={FORM_ID}>
          Save
        </Button>
      }
      TransitionProps={TransitionProps}
    >
      <GroupForm id={FORM_ID} onSave={onSave} group={group} />
    </Modal>
  );
};
