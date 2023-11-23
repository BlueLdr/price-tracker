import styled from "@emotion/styled";
import * as React from "react";

import {
  classNameWithModifiers,
  classNames,
  useSuffix,
  useUniqueId,
} from "~/utils";

import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";

import type { StyleProps } from "~/theme";
import type { ModalProps } from "./types";

//================================================

const modalStyle: StyleProps = {
  border: theme => `1px solid ${theme.palette.grey["400"]}`,
};

const headerStyle: StyleProps = {
  backgroundColor: theme => theme.palette.grey["100"],
  borderBottom: theme => `1px solid ${theme.palette.grey["400"]}`,
  marginBottom: theme => theme.spacing(4),
};

const CloseButton = styled(IconButton)`
  padding: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(-2, -2, 0, 2)};
`;
CloseButton.displayName = "CloseButton";

//================================================

/** MUI Dialog and its subcomponents bundled together for convenience */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  titleText,
  maxWidth = "md",
  fullWidth = false,
  className,
  hideCloseButton,
  id: propsId,
  confirmButton: confirmButtonProp,
  cancelButton: cancelButtonProp,
  ...props
}) => {
  const id = useSuffix(propsId, "modal");
  const makeId = useUniqueId(id);

  // clone cancel button with default props set, and onClick listener overridden
  const cancelButton = cancelButtonProp
    ? React.cloneElement(cancelButtonProp, {
        name: "cancel-button",
        variant: "outlined",
        ...cancelButtonProp.props,
        onClick: cancelButtonProp.props?.disabled
          ? undefined
          : cancelButtonProp.props?.onClick ?? onClose,
      })
    : undefined;

  // clone confirm button with default props set, and onClick listener overridden
  const confirmButton = confirmButtonProp
    ? React.cloneElement(confirmButtonProp, {
        name: "confirm-button",
        variant: "contained",
        ...confirmButtonProp.props,
        onClick: confirmButtonProp.props?.disabled
          ? undefined
          : confirmButtonProp.props?.onClick,
      })
    : undefined;

  return (
    <Dialog
      {...props}
      className={classNames(
        classNameWithModifiers("modal", { "-open": open }),
        className,
      )}
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      onClose={onClose}
      PaperProps={{
        elevation: 24,
        ...(props.PaperProps ?? {}),
        sx: {
          ...modalStyle,
          ...(props.PaperProps?.sx ?? {}),
        },
      }}
      id={id}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      {
        // if close button is hidden and no title, don't render the DialogTitle
        (!hideCloseButton || !!titleText) && (
          <DialogTitle
            component="div"
            id={makeId("title")}
            sx={!!titleText ? headerStyle : undefined}
          >
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              spacing={4}
            >
              <Grid item>{titleText}</Grid>
              {!hideCloseButton ? (
                <Grid item sx={{ lineHeight: 0 }}>
                  <CloseButton
                    className="modal-close"
                    aria-label="close"
                    onClick={onClose}
                  >
                    <CloseIcon />
                  </CloseButton>
                </Grid>
              ) : undefined}
            </Grid>
          </DialogTitle>
        )
      }

      <DialogContent id={makeId("description")}>{children}</DialogContent>

      {
        // if no cancel or confirm button, don't render DialogActions
        (confirmButton || cancelButton) && (
          <DialogActions>
            <Grid
              container
              alignItems="center"
              justifyContent="flex-end"
              spacing={4}
            >
              {cancelButton && <Grid item>{cancelButton}</Grid>}
              {confirmButton && <Grid item>{confirmButton}</Grid>}
            </Grid>
          </DialogActions>
        )
      }
    </Dialog>
  );
};
