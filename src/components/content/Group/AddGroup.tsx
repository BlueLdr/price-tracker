import { Modal } from "~/components";
import { useModalToggle } from "~/utils";
import { GroupForm } from "./GroupForm";

import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";

import type { ProductGroup, Updater } from "~/utils";

//================================================

const FORM_ID = "add-group-form";

interface AddGroupModalProps {
  updateGroup: Updater<ProductGroup, "name">;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  updateGroup,
}) => {
  const [open, openModal, closeModal] = useModalToggle();

  const onSave = (group: ProductGroup) => {
    updateGroup("", group);
    closeModal();
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          right: theme => theme.spacing(6),
          bottom: theme => theme.spacing(6),
        }}
        onClick={openModal}
      >
        <AddIcon />
      </Fab>
      <Modal
        id={`${FORM_ID}-modal`}
        open={open}
        onClose={closeModal}
        titleText="Add Group"
        cancelButton={<Button>Cancel</Button>}
        confirmButton={
          <Button type="submit" form={FORM_ID}>
            Save
          </Button>
        }
      >
        <GroupForm id={FORM_ID} onSave={onSave} />
      </Modal>
    </>
  );
};
