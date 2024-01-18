import styled from "@emotion/styled";

import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { ProductListingSnapshot } from "~/utils";

//================================================

const CompactIcon = styled.img`
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
`;
CompactIcon.displayName = "styled(CompactIcon)";

//================================================

export interface CurrentLowestPriceProps extends ProductListingSnapshot {
  siteIconUrl?: string;
  siteName?: string;
  priceDropped?: boolean;
  isHistoricalLow?: boolean;
}

export const CurrentLowestPrice: React.FC<CurrentLowestPriceProps> = ({
  price,
  dateUpdated,
  siteIconUrl,
  siteName,
  url,
  isHistoricalLow,
  priceDropped,
}) =>
  price == null ? null : (
    <Tooltip
      title={`From ${siteName} at ${new Date(dateUpdated).toLocaleString()}`}
    >
      <Link
        href={url}
        onClick={e => e.stopPropagation()}
        display="inline-flex"
        alignItems="center"
        columnGap={2}
        sx={{
          color: theme =>
            isHistoricalLow
              ? "success.main"
              : priceDropped
              ? `success.${theme.palette.mode === "dark" ? "light" : "dark"}`
              : undefined,
        }}
      >
        <CompactIcon src={siteIconUrl} />
        <Typography variant="body2">${price.toFixed(2)}</Typography>
      </Link>
    </Tooltip>
  );
