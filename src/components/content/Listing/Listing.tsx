import styled from "@emotion/styled";
import { useContext, useEffect } from "react";

import { applyListingUpdates } from "~/utils";
import { AppContext, PrefsContext } from "~/context";

import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { ProductListing, Updater } from "~/utils";
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
  listing: ProductListing;
  updateListing: Updater<ProductListing, "url">;
  removeListing: (id: ProductListing["url"]) => void;
}

export const Listing: React.FC<ListingProps> = ({ listing, updateListing }) => {
  const { prefs: { compactView = false } = {} } = useContext(PrefsContext);
  const { scrapeScheduler } = useContext(AppContext);
  useEffect(() => {
    let cancelled = false;
    const promise = scrapeScheduler
      ?.enqueueRequest(listing.url, listing.dateUpdated)
      ?.then(async newListing => {
        if (!cancelled) {
          updateListing(listing.url, oldListing =>
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
      scrapeScheduler?.cancelRequest(listing.url);
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
          <CompactIcon src={listing.siteIconUrl} />
        ) : (
          <Icon src={listing.siteIconUrl} />
        )}
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{
          sx: contentStyle,
          variant: compactView ? "body2" : "body1",
        }}
      >
        <Link href={listing.url} target="_blank" sx={{ flex: "0 0 auto" }}>
          {listing.siteName || listing.url}
        </Link>
        <Grid
          container
          alignItems="center"
          justifyContent="flex-end"
          flex="0 1 auto"
        >
          <Typography
            variant={compactView ? "body2" : "body1"}
            color={
              listing.currentPrice !== listing.originalPrice &&
              listing.currentPrice === listing.lowestPrice
                ? "success"
                : "grey.300"
            }
          >
            Lowest Price: ${listing.lowestPrice?.toFixed(2) ?? " --.--"}
          </Typography>
          <Tooltip
            title={`Last updated: ${new Date(
              listing.dateUpdated,
            ).toLocaleString()}`}
            placement="left"
          >
            <Typography
              component="span"
              variant={compactView ? "body2" : "body1"}
              color={
                (listing.currentPrice ?? Infinity) <
                (listing.originalPrice ?? 0)
                  ? (listing.currentPrice ?? Infinity) <=
                    (listing.lowestPrice ?? 0)
                    ? "success.main"
                    : "success.dark"
                  : undefined
              }
              flex="0 0 4.5rem"
              textAlign="right"
            >
              ${listing.currentPrice?.toFixed(2) ?? " --.--"}
            </Typography>
          </Tooltip>
        </Grid>
      </ListItemText>
    </ListItem>
  );
};
