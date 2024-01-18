import { useCallback, useContext, useEffect, useState } from "react";

import {
  Disclosure,
  SpacedGrid,
  ProductView,
  Draggable,
  DraggableBinContext,
  DraggableItemContext,
} from "~/components";
import { removeItemFrom, replaceItemIn } from "~/utils";
import { DragModeContext, ModalsContext, PrefsContext } from "~/context";
import { ActionsMenu } from "./ActionsMenu";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";

import type { ProductData, ProductGroup, Updater } from "~/utils";

//================================================

interface GroupProps {
  data: ProductGroup;
  updateGroup: Updater<ProductGroup, "name">;
  onClickRemove: (group: ProductGroup) => void;
  onClickEdit: (group: ProductGroup) => void;
}

const GroupBase: React.FC<GroupProps> = ({
  data: group,
  updateGroup,
  onClickRemove,
  onClickEdit,
}) => {
  const { setAddProductTarget } = useContext(ModalsContext);
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const { dragEnabled, isDragging } = useContext(DragModeContext);
  const { isTarget } = useContext(DraggableBinContext);
  const { isActive } = useContext(DraggableItemContext);

  const updateProduct = useCallback<Updater<ProductData, "name">>(
    (id, newProduct) => {
      updateGroup(group.name, curGroup => ({
        ...curGroup,
        products: replaceItemIn(
          curGroup.products,
          oldProduct => oldProduct.name === id,
          oldProduct =>
            typeof newProduct === "function"
              ? newProduct(oldProduct || { name: id, listings: [] })
              : newProduct,
          "end",
        ),
      }));
    },
    [group.name, updateGroup],
  );
  const removeProduct = useCallback(
    (id: ProductData["name"]) => {
      updateGroup(group.name, curGroup => ({
        ...curGroup,
        products: removeItemFrom(curGroup.products, item => item.name === id),
      }));
    },
    [group.name, updateGroup],
  );

  const setOpen = useCallback(
    (value: boolean) =>
      updateGroup(group.name, curGroup => ({ ...curGroup, open: value })),
    [group.name, updateGroup],
  );

  const [forceOpen, setForceOpen] = useState(false);
  const [disableOpenOnClick, setDisableOpenOnClick] = useState(false);

  useEffect(() => {
    if (isDragging && isTarget) {
      const timer = setTimeout(() => {
        setForceOpen(true);
      }, 600);
      return () => {
        clearTimeout(timer);
        setForceOpen(false);
      };
    }
  }, [isTarget, isDragging]);

  useEffect(() => {
    setDisableOpenOnClick(isActive);
  }, [isActive]);

  return (
    <Disclosure
      headerIcon={dragEnabled ? <Draggable.Handle /> : undefined}
      header={group.name}
      open={isActive ? false : forceOpen || !!group.open}
      setOpen={disableOpenOnClick ? () => {} : setOpen}
      sx={{
        borderLeftColor: "transparent",
      }}
      size={compactView ? "md" : undefined}
      actions={
        dragEnabled ? undefined : (
          <ActionsMenu
            group={group}
            updateGroup={updateGroup}
            onClickAdd={() =>
              setAddProductTarget({
                target: undefined,
                onSave: updateProduct,
              })
            }
            onClickEdit={onClickEdit}
            onClickRemove={onClickRemove}
          />
        )
      }
    >
      <Box pl={compactView ? 18 : 24}>
        <Draggable.List spacing={compactView ? 2 : 4}>
          {group.products.map((product, index) => (
            <ProductView
              key={product.name}
              data={product}
              updateProduct={updateProduct}
              removeProduct={removeProduct}
              index={index}
            />
          ))}
        </Draggable.List>
        {group.products.length === 0 && !dragEnabled && (
          <SpacedGrid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            p={compactView ? 8 : 12}
            spacing={2}
          >
            <Typography variant="body2">No products for this group</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() =>
                setAddProductTarget({
                  target: undefined,
                  onSave: updateProduct,
                })
              }
            >
              Add Product
            </Button>
          </SpacedGrid>
        )}
      </Box>
    </Disclosure>
  );
};

//================================================

export const Group: React.FC<GroupProps> = ({ updateGroup, ...props }) => {
  const updateList = useCallback(
    (transform: (items: ProductData[]) => ProductData[]) =>
      updateGroup(props.data.name, group => ({
        ...group,
        products: transform(group.products),
      })),
    [updateGroup, props.data.name],
  );
  return (
    <Draggable.Bin updateList={updateList}>
      <GroupBase {...props} updateGroup={updateGroup} />
    </Draggable.Bin>
  );
};
