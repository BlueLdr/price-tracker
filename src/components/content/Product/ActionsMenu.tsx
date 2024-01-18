import { useContext, useState } from "react";

import { PrefsContext } from "~/context";

import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreIcon from "@mui/icons-material/MoreVert";

import type { ProductData } from "~/utils";

//================================================

export interface ActionsMenuProps {
  product: ProductData;
  onClickAdd: () => void;
  onClickRemove: (product: ProductData) => void;
  onClickEdit: (product: ProductData) => void;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({
  product,
  onClickAdd,
  onClickRemove,
  onClickEdit,
}) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        sx={{ borderRadius: theme => `${theme.shape.borderRadius}px` }}
        onClick={e => setAnchorEl(e.currentTarget)}
        size={compactView ? "small" : undefined}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id={`${product.name}-actions-menu`}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted={false}
      >
        <MenuList dense={compactView} onClick={() => setAnchorEl(null)}>
          <MenuItem onClick={onClickAdd}>
            <ListItemIcon>
              <AddIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Add Listing</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => onClickEdit(product)}>
            <ListItemIcon>
              <EditIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Edit Product</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => onClickRemove(product)}>
            <ListItemIcon>
              <DeleteIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Remove Product</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};
