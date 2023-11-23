import { useCallback, useContext } from "react";

import { Disclosure, Listing, SpacedGrid } from "~/components";
import { applyProductUpdates, removeItemFrom, replaceItemIn } from "~/utils";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import type { Product, ProductListing, Updater } from "~/utils";
import { ModalsContext } from "~/context";
import styled from "@emotion/styled";

//================================================

const Image = styled.img`
  width: ${({ theme }) => theme.spacing(30)};
  height: ${({ theme }) => theme.spacing(30)};
  object-fit: contain;
`;
Image.displayName = "styled(Image)";

//================================================

export interface ProductProps {
  product: Product;
  updateProduct: Updater<Product, "name">;
  removeProduct: (id: Product["name"]) => void;
}

export const ProductView: React.FC<ProductProps> = ({
  product,
  updateProduct,
  removeProduct,
}) => {
  const { setDeleteProductTarget, setEditProductTarget, setAddListingTarget } =
    useContext(ModalsContext);

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
      header={product.name}
      open={product.open || false}
      setOpen={setOpen}
      sx={{
        borderLeftColor: "transparent",
      }}
      actions={[
        <IconButton
          key="add"
          onClick={() =>
            setAddListingTarget({ target: undefined, onSave: updateListing })
          }
        >
          <AddIcon />
        </IconButton>,
        <IconButton
          key="edit"
          onClick={() =>
            setEditProductTarget({ target: product, onSave: updateProduct })
          }
        >
          <EditIcon />
        </IconButton>,
        <IconButton
          key="delete"
          onClick={() =>
            setDeleteProductTarget({ target: product, onSave: removeProduct })
          }
        >
          <DeleteIcon />
        </IconButton>,
      ]}
    >
      <Grid container alignItems="center" flexWrap="nowrap">
        {product.imageUrl && <Image src={product.imageUrl} />}
        <SpacedGrid
          direction="column"
          spacing={4}
          pl={product.imageUrl ? 6 : 36}
          flex="1 1 auto"
          alignSelf="flex-start"
        >
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
            <List>
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
        </SpacedGrid>
      </Grid>
    </Disclosure>
  );
};
