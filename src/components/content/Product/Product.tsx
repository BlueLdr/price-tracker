import { useCallback, useContext, useMemo } from "react";
import styled from "@emotion/styled";

import { Disclosure, Draggable, Listing, PriceAlertDot } from "~/components";
import {
  acknowledgeListingAlert,
  applyProductUpdates,
  Product,
  removeItemFrom,
  replaceItemIn,
} from "~/utils";
import { DragModeContext, ModalsContext, PrefsContext } from "~/context";
import { ActionsMenu } from "./ActionsMenu";
import { CurrentLowestPrice } from "./CurrentLowestPrice";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";

import type { ProductData, ProductListingData, Updater } from "~/utils";

//================================================

const Image = styled.img`
  width: ${({ theme }) => theme.spacing(30)};
  max-height: ${({ theme }) => theme.spacing(30)};
  object-fit: contain;
`;
Image.displayName = "styled(Image)";

const CompactImage = styled.img`
  width: ${({ theme }) => theme.spacing(20)};
  max-height: ${({ theme }) => theme.spacing(20)};
  object-fit: contain;
`;
CompactImage.displayName = "styled(CompactImage)";

//================================================

export interface ProductProps {
  data: ProductData;
  updateProduct: Updater<ProductData, "name">;
  removeProduct: (id: ProductData["name"]) => void;
  index: number;
}

export const ProductView: React.FC<ProductProps> = ({
  data,
  updateProduct,
  removeProduct,
}) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const { setDeleteProductTarget, setEditProductTarget, setAddListingTarget } =
    useContext(ModalsContext);
  const { dragEnabled } = useContext(DragModeContext);
  const product = useMemo(() => new Product(data), [data]);

  const updateListing = useCallback<Updater<ProductListingData, "url">>(
    (id, newListing) => {
      updateProduct(data.name, curProduct =>
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
                        history: [
                          {
                            dateUpdated: Date.now(),
                            dateAdded: Date.now(),
                          },
                        ],
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
    [data.name, updateProduct],
  );
  const removeListing = useCallback(
    (id: ProductListingData["url"]) => {
      updateProduct(data.name, curProduct => ({
        ...curProduct,
        listings: removeItemFrom(curProduct.listings, item => item.url === id),
      }));
    },
    [data.name, updateProduct],
  );

  const setOpen = useCallback(
    (value: boolean) =>
      updateProduct(data.name, curProduct => ({
        ...curProduct,
        open: value,
      })),
    [data.name, updateProduct],
  );

  return (
    <Disclosure
      headerIcon={dragEnabled ? <Draggable.Handle /> : undefined}
      header={
        <>
          {!product.open && (
            <PriceAlertDot
              mr={compactView ? 3 : 4}
              data={product}
              onClick={e => {
                e.stopPropagation();
                !!product.currentPrice?.url &&
                  updateListing(
                    product.currentPrice.url,
                    acknowledgeListingAlert,
                  );
              }}
            />
          )}
          {product.name}
        </>
      }
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
              product.open || !product.currentPrice ? null : (
                <CurrentLowestPrice
                  key="curLowestPrice"
                  {...product.currentPrice}
                />
              ),
              <ActionsMenu
                key="product-actions"
                product={product}
                onClickAdd={() =>
                  setAddListingTarget({
                    target: undefined,
                    onSave: updateListing,
                  })
                }
                onClickRemove={() =>
                  setDeleteProductTarget({
                    target: product,
                    onSave: removeProduct,
                  })
                }
                onClickEdit={() =>
                  setEditProductTarget({
                    target: product,
                    onSave: updateProduct,
                  })
                }
              />,
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
                data={listing}
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
