import { useCallback, useContext, useState } from "react";

import { DragModeContext, PrefsContext } from "~/context";
import {
  Group,
  DeleteProductModal,
  AddProductModal,
  EditProductModal,
  EditGroupModal,
  Draggable,
} from "~/components";
import { removeItemFrom, replaceItemIn, rgba } from "~/utils";
import { AddGroupModal, DeleteGroupModal } from "./Group";
import { ImportModal } from "./Import";
import { SchedulerManager } from "./SchedulerManager";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";

import type { ProductGroup, Updater, WithStateHook } from "~/utils";

//================================================

export const Main: React.FC<WithStateHook<"groups", ProductGroup[]>> = ({
  groups,
  setGroups,
}) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const { dragEnabled } = useContext(DragModeContext);
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
      {/*<DragPlayground />*/}
      <Draggable.Bin updateList={setGroups}>
        <Grid
          mx="auto"
          maxWidth={1080}
          width="100%"
          container
          px={8}
          py={compactView ? 4 : 8}
          sx={{
            transition: theme =>
              theme.transitions.create("box-shadow", { duration: "300ms" }),
            boxShadow: theme =>
              `0 0 6px ${rgba(theme.palette.primary.main, 0)}`,

            ...(dragEnabled
              ? {
                  borderRadius: "6px",
                  boxShadow: theme =>
                    `0 0 6px ${rgba(theme.palette.primary.main, 1)}`,
                }
              : undefined),
          }}
        >
          <Draggable.List spacing={compactView ? 4 : 6} fullWidth>
            {groups.map(group => (
              <Group
                key={group.name}
                data={group}
                updateGroup={updateGroup}
                onClickRemove={setDeleteTarget}
                onClickEdit={setEditTarget}
              />
            ))}
          </Draggable.List>
          {!groups.length && (
            <Grid container alignItems="center" justifyContent="center" py={12}>
              <Button startIcon={<AddIcon />}>Create Group</Button>
            </Grid>
          )}
        </Grid>
      </Draggable.Bin>

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
      <ImportModal />
      <SchedulerManager />
    </>
  );
};
