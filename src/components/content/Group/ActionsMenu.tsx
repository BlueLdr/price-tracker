import { useContext, useState } from "react";

import { PrefsContext } from "~/context";

import Divider from "@mui/material/Divider";
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
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import type { ProductGroup, Updater } from "~/utils";

//================================================

export interface ActionsMenuProps {
  group: ProductGroup;
  updateGroup: Updater<ProductGroup, "name">;
  onClickAdd: () => void;
  onClickRemove: (group: ProductGroup) => void;
  onClickEdit: (group: ProductGroup) => void;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({
  group,
  updateGroup,
  onClickAdd,
  onClickRemove,
  onClickEdit,
}) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const setAllOpen = (open: boolean) =>
    updateGroup(group.name, curGroup => ({
      ...curGroup,
      products: curGroup.products.map(p => ({ ...p, open })),
    }));

  const allAreOpen = group.products.every(p => p.open);
  const allAreClosed = group.products.every(p => !p.open);

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
        id={`${group.name}-actions-menu`}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted={false}
      >
        <MenuList dense={compactView} onClick={() => setAnchorEl(null)}>
          <MenuItem disabled={allAreOpen} onClick={() => setAllOpen(true)}>
            <ListItemIcon>
              <UnfoldMoreIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Expand all</ListItemText>
          </MenuItem>

          <MenuItem disabled={allAreClosed} onClick={() => setAllOpen(false)}>
            <ListItemIcon>
              <UnfoldLessIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Collapse all</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={onClickAdd}>
            <ListItemIcon>
              <AddIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Add Product</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => onClickEdit(group)}>
            <ListItemIcon>
              <EditIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Edit Group</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => onClickRemove(group)}>
            <ListItemIcon>
              <DeleteIcon fontSize={compactView ? "small" : undefined} />
            </ListItemIcon>
            <ListItemText>Remove Group</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};
