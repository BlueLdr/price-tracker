import { useContext, useState } from "react";
import { Button, TextField } from "@mui/material";

import { AppContext } from "~/context";
import { useModalToggle } from "~/utils";
import { Modal } from "~/components";

import Upload from "@mui/icons-material/Upload";
import Fab from "@mui/material/Fab";

// =======================================================

export const ImportModal: React.FC = () => {
  const { groups } = useContext(AppContext);

  const [open, openModal, closeModal] = useModalToggle();
  const [text, setText] = useState("");
  const onSubmit = () => {
    if (!text) {
      return;
    }
    localStorage.setItem("price-checker-data", text);
    window.location.reload();
  };

  if (groups.length) {
    return null;
  }
  return (
    <>
      <Fab
        color="secondary"
        sx={{
          position: "fixed",
          left: theme => theme.spacing(6),
          bottom: theme => theme.spacing(6),
        }}
        onClick={openModal}
      >
        <Upload />
      </Fab>

      <Modal
        id="import-modal"
        open={open}
        titleText="Import data"
        onClose={closeModal}
        confirmButton={<Button onClick={onSubmit}>Import</Button>}
      >
        <TextField
          multiline
          onChange={e => setText(e.currentTarget.value)}
          value={text}
          label="JSON"
        />
      </Modal>
    </>
  );
};
