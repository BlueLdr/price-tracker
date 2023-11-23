import { useEffect, useState } from "react";
import styled from "@emotion/styled";

import {
  removeItemFrom,
  scrapeUrl,
  useApiRequest,
  useStateObject,
} from "~/utils";

import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import type {
  Product,
  ParsedPageListing,
  ProductListing,
  ProductWithUpdates,
} from "~/utils";
import type { StyleProps } from "~/theme";
import type { ApiResponse } from "~/api";

//================================================

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;
Image.displayName = "styled(Image)";

const Icon = styled.img`
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(6)};
`;
Icon.displayName = "styled(Icon)";

const listItemActionsStyle: StyleProps = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
};

const imageStyle: StyleProps = {
  cursor: "pointer",
  padding: theme => theme.spacing(4),
  transition: "all 200ms ease-out",
  border: "3px solid transparent",
  borderRadius: theme => theme.spacing(1),
  "& img": {
    transition: "transform 200ms ease-out",
    transform: "scale(1)",
  },
  "&[data-selected='true']": {
    border: theme => `3px solid ${theme.palette.primary.main}`,
    "& img": {
      transform: "scale(1.05)",
    },
  },
};

//================================================

const scrapeApiRequest = (...args: Parameters<typeof scrapeUrl>) =>
  scrapeUrl(...args).then(
    response =>
      ({ data: response, error: null, rawResponse: {} }) as ApiResponse<
        ParsedPageListing | undefined
      >,
  );

//================================================

export interface ProductFormProps {
  id: string;
  product: Partial<ProductWithUpdates>;
  onSave: (product: ProductWithUpdates) => void;
  onClearListings?: () => void;
}

export type ProductFormData = Omit<Product, "listings"> & {
  listings: (ProductListing & ParsedPageListing)[];
};

export const ProductForm: React.FC<ProductFormProps> = ({
  id,
  product,
  onSave,
  onClearListings,
}) => {
  const [formData, setFormData] = useStateObject(product ?? {});

  useEffect(() => {
    if (onClearListings && !formData.listings?.length) {
      onClearListings();
    }
  }, [formData.listings?.length, onClearListings]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.listings?.length || !formData.name) {
      return;
    }
    onSave(formData as ProductWithUpdates);
  };

  const [newListingUrl, setNewListingUrl] = useState("");
  const [newListingError, setNewListingError] = useState("");
  const [addNewListing, , status] = useApiRequest(scrapeApiRequest);
  const onAddListing = () => {
    if (!newListingUrl) {
      return;
    }
    addNewListing(newListingUrl)
      .then(({ data: listing }) => {
        if (listing) {
          setFormData(data => ({
            ...data,
            listings: [...(data.listings ?? []), listing],
          }));
          setNewListingUrl("");
          setNewListingError("");
        }
      })
      .catch(err => setNewListingError(err));
  };

  const nameOptions = (formData?.listings
    ?.map(l => l.productName)
    .filter(s => !!s) ?? []) as string[];

  const imageOptions = formData?.listings?.filter(
    listing => !!listing.imageUrl,
  );

  return (
    <form id={id} onSubmit={onSubmit}>
      <Autocomplete<string, false, false, true>
        autoFocus
        sx={{ marginY: theme => theme.spacing(2) }}
        fullWidth
        renderInput={props => <TextField name="name" label="Name" {...props} />}
        options={nameOptions}
        freeSolo
        value={formData.name}
        onChange={(_, newValue) => setFormData({ name: newValue || "" })}
      />

      <List>
        {formData.listings?.map((listing, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <Icon src={listing.siteIconUrl} />
            </ListItemIcon>
            <ListItemText>
              <Link href={listing.url} target="_blank">
                {listing.siteName || listing.url}
              </Link>
              <ListItemSecondaryAction sx={listItemActionsStyle}>
                <Typography component="span" color="success">
                  ${listing.currentPrice}
                </Typography>
                <IconButton
                  disabled={!("timestamp" in listing)}
                  type="button"
                  onClick={() =>
                    formData.listings
                      ? setFormData({
                          imageUrl:
                            formData.imageUrl === listing.imageUrl
                              ? undefined
                              : formData.imageUrl,
                          listings: removeItemFrom(
                            formData.listings,
                            i => i.url === listing.url,
                          ),
                        })
                      : undefined
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemText>
          </ListItem>
        ))}
        <ListItem key={formData.listings?.length}>
          <ListItemIcon />
          <TextField
            name="url"
            label="Add a URL"
            value={newListingUrl}
            onChange={e => setNewListingUrl(e.currentTarget.value)}
            disabled={status.pending}
            error={!!newListingUrl && !!newListingError}
            helperText={newListingError}
            fullWidth
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddListing();
              }
            }}
          />
          <ListItemSecondaryAction>
            <IconButton
              disabled={!newListingUrl || status.pending}
              onClick={onAddListing}
              type="button"
            >
              <AddIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <ImageList cols={3} rowHeight={180}>
        {!!imageOptions?.length ? (
          imageOptions.map(listing => (
            <ImageListItem
              key={listing.imageUrl}
              data-selected={formData.imageUrl === listing.imageUrl}
              onClick={() => setFormData({ imageUrl: listing.imageUrl })}
              sx={imageStyle}
            >
              <Image src={listing.imageUrl} loading="lazy" />
            </ImageListItem>
          ))
        ) : (
          <ImageListItem>No images found</ImageListItem>
        )}
      </ImageList>
    </form>
  );
};
