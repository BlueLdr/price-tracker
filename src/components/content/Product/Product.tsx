import { useCallback, useContext } from "react";
import styled from "@emotion/styled";

import { Disclosure, Draggable, Listing } from "~/components";
import { applyProductUpdates, removeItemFrom, replaceItemIn } from "~/utils";
import { DragModeContext, ModalsContext, PrefsContext } from "~/context";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import type { Product, ProductListing, Updater } from "~/utils";

//================================================

const Image = styled.img`
  width: ${({ theme }) => theme.spacing(30)};
  height: ${({ theme }) => theme.spacing(30)};
  object-fit: contain;
`;
Image.displayName = "styled(Image)";

const CompactImage = styled.img`
  width: ${({ theme }) => theme.spacing(20)};
  height: ${({ theme }) => theme.spacing(20)};
  object-fit: contain;
`;
CompactImage.displayName = "styled(CompactImage)";

//================================================

export interface ProductProps {
  data: Product;
  updateProduct: Updater<Product, "name">;
  removeProduct: (id: Product["name"]) => void;
  index: number;
}

export const ProductView: React.FC<ProductProps> = ({
  data: product,
  updateProduct,
  removeProduct,
}) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const { setDeleteProductTarget, setEditProductTarget, setAddListingTarget } =
    useContext(ModalsContext);
  const { dragEnabled } = useContext(DragModeContext);

  const updateListing = useCallback<Updater<ProductListing, "url">>(
    (id, newListing) => {
      updateProduct(product.name, curProduct =>
        applyProductUpdates(
          {
            ...curProduct,
            listings: replaceItemIn(
              curProduct.listings,
              oldListing => oldListing.url === id,
              oldListing =>
                typeof newListing === "function"
                  ? newListing(
                      oldListing || {
                        url: id,
                        dateAdded: 0,
                        dateUpdated: 0,
                        history: [],
                      },
                    )
                  : newListing,
              "end",
            ),
          },
          curProduct,
        ),
      );
    },
    [product.name, updateProduct],
  );
  const removeListing = useCallback(
    (id: ProductListing["url"]) => {
      updateProduct(product.name, curProduct => ({
        ...curProduct,
        listings: removeItemFrom(curProduct.listings, item => item.url === id),
      }));
    },
    [product.name, updateProduct],
  );

  const setOpen = useCallback(
    (value: boolean) =>
      updateProduct(product.name, curProduct => ({
        ...curProduct,
        open: value,
      })),
    [product.name, updateProduct],
  );

  return (
    <Disclosure
      headerIcon={dragEnabled ? <Draggable.Handle /> : undefined}
      header={product.name}
      open={!!product.open && !dragEnabled}
      setOpen={dragEnabled ? () => {} : setOpen}
      size={compactView ? "sm" : undefined}
      sx={{
        borderLeftColor: "transparent",
      }}
      actions={
        dragEnabled
          ? []
          : [
              <IconButton
                key="add"
                size={compactView ? "small" : undefined}
                onClick={() =>
                  setAddListingTarget({
                    target: undefined,
                    onSave: updateListing,
                  })
                }
              >
                <AddIcon fontSize="inherit" />
              </IconButton>,
              <IconButton
                key="edit"
                size={compactView ? "small" : undefined}
                onClick={() =>
                  setEditProductTarget({
                    target: product,
                    onSave: updateProduct,
                  })
                }
              >
                <EditIcon fontSize="inherit" />
              </IconButton>,
              <IconButton
                key="delete"
                size={compactView ? "small" : undefined}
                onClick={() =>
                  setDeleteProductTarget({
                    target: product,
                    onSave: removeProduct,
                  })
                }
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>,
            ]
      }
    >
      <Grid container alignItems="center" flexWrap="nowrap">
        {product.imageUrl &&
          (compactView ? (
            <CompactImage src={product.imageUrl} />
          ) : (
            <Image src={product.imageUrl} />
          ))}

        {product.listings.length === 0 ? (
          <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            p={12}
            spacing={2}
          >
            <Typography>No listings for this product</Typography>
            <Button startIcon={<AddIcon />} variant="outlined">
              Add Listing
            </Button>
          </Grid>
        ) : (
          <List
            sx={{
              flex: "1 1 auto",
              paddingLeft: theme =>
                theme.spacing(
                  product.imageUrl
                    ? compactView
                      ? 4
                      : 6
                    : compactView
                    ? 24
                    : 36,
                ),
            }}
          >
            {product.listings.map(listing => (
              <Listing
                key={listing.url}
                listing={listing}
                updateListing={updateListing}
                removeListing={removeListing}
              />
            ))}
          </List>
        )}
      </Grid>
    </Disclosure>
  );
};
