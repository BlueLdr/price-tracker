import { useCallback, useContext } from "react";

import { Disclosure, SpacedGrid, ProductView } from "~/components";
import { removeItemFrom, replaceItemIn } from "~/utils";
import { ModalsContext } from "~/context";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import type { Product, ProductGroup, Updater } from "~/utils";

//================================================

export interface GroupProps {
  group: ProductGroup;
  updateGroup: Updater<ProductGroup, "name">;
  onClickRemove: (group: ProductGroup) => void;
  onClickEdit: (group: ProductGroup) => void;
}

export const Group: React.FC<GroupProps> = ({
  group,
  updateGroup,
  onClickRemove,
  onClickEdit,
}) => {
  const { setAddProductTarget } = useContext(ModalsContext);

  const updateProduct = useCallback<Updater<Product, "name">>(
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
    (id: Product["name"]) => {
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

  return (
    <Disclosure
      header={group.name}
      open={group.open || false}
      setOpen={setOpen}
      sx={{
        borderLeftColor: "transparent",
      }}
      actions={[
        <IconButton
          key="add"
          onClick={() =>
            setAddProductTarget({ target: undefined, onSave: updateProduct })
          }
        >
          <AddIcon />
        </IconButton>,
        <IconButton key="edit" onClick={() => onClickEdit(group)}>
          <EditIcon />
        </IconButton>,
        <IconButton key="delete" onClick={() => onClickRemove(group)}>
          <DeleteIcon />
        </IconButton>,
      ]}
    >
      <SpacedGrid direction="column" spacing={4} pl={24}>
        {group.products.map(product => (
          <ProductView
            key={product.name}
            product={product}
            updateProduct={updateProduct}
            removeProduct={removeProduct}
          />
        ))}
        {group.products.length === 0 && (
          <SpacedGrid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            p={12}
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
      </SpacedGrid>
    </Disclosure>
  );
};
