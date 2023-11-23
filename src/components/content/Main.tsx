import { useCallback, useContext, useState } from "react";

import {
  SpacedGrid,
  Group,
  DeleteProductModal,
  AddProductModal,
  EditProductModal,
  EditGroupModal,
} from "~/components";
import { AppContext } from "~/context";
import { removeItemFrom, replaceItemIn } from "~/utils";
import { AddGroupModal, DeleteGroupModal } from "./Group";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";

import type { ProductGroup, Updater } from "~/utils";

//================================================

export const Main: React.FC = () => {
  const { groups, setGroups } = useContext(AppContext);
  const updateGroup = useCallback<Updater<ProductGroup, "name">>(
    (id, newGroup) => {
      setGroups(curGroups =>
        replaceItemIn(
          curGroups,
          item => item.name === id,

          oldGroup =>
            typeof newGroup === "function"
              ? newGroup(oldGroup || { name: id, products: [] })
              : newGroup,
          "end",
        ),
      );
    },
    [setGroups],
  );
  const removeGroup = useCallback(
    (id: ProductGroup["name"]) => {
      setGroups(curGroups =>
        removeItemFrom(curGroups, item => item.name === id),
      );
    },
    [setGroups],
  );

  const [deleteTarget, setDeleteTarget] = useState<ProductGroup>();
  const [editTarget, setEditTarget] = useState<ProductGroup>();

  return (
    <>
      <Grid mx="auto" maxWidth={1080} container>
        <SpacedGrid direction="column" spacing={6} p={8}>
          {groups.map(group => (
            <Group
              key={group.name}
              group={group}
              updateGroup={updateGroup}
              onClickRemove={setDeleteTarget}
              onClickEdit={setEditTarget}
            />
          ))}
          {!groups.length && (
            <Grid container alignItems="center" justifyContent="center" py={12}>
              <Button startIcon={<AddIcon />}>Create Group</Button>
            </Grid>
          )}
        </SpacedGrid>
      </Grid>

      <AddGroupModal updateGroup={updateGroup} />
      <EditGroupModal
        target={editTarget}
        updateGroup={updateGroup}
        onClose={() => setEditTarget(undefined)}
      />
      <DeleteGroupModal
        target={deleteTarget}
        onRemove={removeGroup}
        onClose={() => setDeleteTarget(undefined)}
      />

      <AddProductModal />
      <DeleteProductModal />
      <EditProductModal />
    </>
  );
};
