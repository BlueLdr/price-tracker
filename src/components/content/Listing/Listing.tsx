import styled from "@emotion/styled";
import { useContext, useEffect, useMemo } from "react";

import { AppContext, PrefsContext } from "~/context";
import {
  acknowledgeListingAlert,
  applyListingUpdates,
  formatPrice,
  ProductListing,
} from "~/utils";
import { PriceAlertDot } from "~/components";

import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { ProductListingData, Updater } from "~/utils";
import type { StyleProps } from "~/theme";

//================================================

const Icon = styled.img`
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(6)};
`;
Icon.displayName = "styled(Icon)";

const CompactIcon = styled.img`
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
`;
CompactIcon.displayName = "styled(CompactIcon)";

const contentStyle: StyleProps = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

//================================================

export interface ListingProps {
  data: ProductListingData;
  updateListing: Updater<ProductListingData, "url">;
  removeListing: (id: ProductListingData["url"]) => void;
}

export const Listing: React.FC<ListingProps> = ({ data, updateListing }) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const { scrapeScheduler } = useContext(AppContext);
  const listing = useMemo(() => new ProductListing(data), [data]);

  useEffect(() => {
    let cancelled = false;
    const promise = scrapeScheduler
      ?.enqueueRequest(data.url, listing.dateUpdated)
      ?.then(async newListing => {
        if (!cancelled) {
          updateListing(data.url, oldListing =>
            newListing
              ? applyListingUpdates(newListing, oldListing)
              : oldListing,
          );
        }
      });
    return () => {
      cancelled = true;
      promise?.catch(err =>
        err === "Cancelled" ? undefined : Promise.reject(err),
      );
      scrapeScheduler?.cancelRequest(data.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.dateUpdated, updateListing]);

  return (
    <ListItem
      sx={
        compactView
          ? {
              paddingTop: theme => theme.spacing(0.5),
              paddingBottom: theme => theme.spacing(0.5),
            }
          : undefined
      }
    >
      <ListItemIcon
        sx={
          compactView
            ? { minWidth: "0", marginRight: theme => theme.spacing(4) }
            : undefined
        }
      >
        {compactView ? (
          <CompactIcon src={data.siteIconUrl} />
        ) : (
          <Icon src={data.siteIconUrl} />
        )}
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{
          sx: contentStyle,
          variant: compactView ? "body2" : "body1",
          component: "div",
        }}
      >
        <Link href={data.url} target="_blank" sx={{ flex: "0 0 auto" }}>
          {data.siteName || data.url}
        </Link>
        <PriceAlertDot
          ml={compactView ? 3 : 4}
          data={listing}
          onClick={() => updateListing(data.url, acknowledgeListingAlert)}
        />
        <Grid
          container
          alignItems="center"
          justifyContent="flex-end"
          flex="0 1 auto"
        >
          {(listing.priceDropped || listing.priceIncreased) && (
            <Typography
              variant={compactView ? "body2" : "body1"}
              sx={
                listing.priceDropped
                  ? { textDecorationLine: "line-through" }
                  : undefined
              }
              color="grey.600"
            >
              {listing.priceDropped
                ? `$${listing.previousPrice?.price?.toFixed(2) || " --.--"}`
                : `Lowest Price: $${
                    listing.lowestPrice.price?.toFixed(2) || " --.--"
                  }`}
            </Typography>
          )}
          <Tooltip
            title={`Last updated: ${new Date(
              listing.dateUpdated,
            ).toLocaleString()}`}
            placement="top"
          >
            <Typography
              component="span"
              variant={compactView ? "body2" : "body1"}
              color={
                (listing.currentPrice.price ?? Infinity) <
                (listing.originalPrice.price ?? 0)
                  ? (listing.currentPrice.price ?? Infinity) <=
                    (listing.lowestPrice.price ?? 0)
                    ? "success.main"
                    : "success.dark"
                  : undefined
              }
              flex="0 0 auto"
              marginInlineStart={3}
              textAlign="right"
            >
              {formatPrice(listing.currentPrice)}
            </Typography>
          </Tooltip>
        </Grid>
      </ListItemText>
    </ListItem>
  );
};
