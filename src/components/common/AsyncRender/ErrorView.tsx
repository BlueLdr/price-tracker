import styled from "@emotion/styled";

import { classNames } from "~/utils";
import { SpacedGrid } from "~/components";

import ErrorIcon from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import type { StyleProps } from "~/theme";
import type { ErrorPageProps } from "./types";

//================================================

const pageContainerStyle: StyleProps = {
  paddingTop: "10rem",
};

const sectionContainerStyle: StyleProps = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
};

const errorContainerStyle: StyleProps = {
  maxWidth: theme => theme.spacing(160),
};

const TextContainer = styled.section`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
TextContainer.displayName = "styled(TextContainer)";

const StyledErrorIcon = styled(ErrorIcon)`
  font-size: 2em;
  color: ${({ theme }) => theme.palette.error.main};
`;
StyledErrorIcon.displayName = "styled(StyledErrorIcon)";

const Spacer = () => <Box py={2} />;

//================================================

const fallbackText = {
  title: "Unknown Error",
  message: "Something went wrong",
  instructions:
    "Please try refreshing the page. If this problem persists, call customer service.",
  buttonText: "Refresh",
};

const refresh = () => document.location.reload();

//================================================

export const ErrorPage: React.FC<ErrorPageProps> = ({
  defaultText = fallbackText,
  title = defaultText?.title,
  message = defaultText?.message,
  instructions = defaultText.instructions,
  buttonText = defaultText?.buttonText,
  onClickButton = refresh,
  hideButton = false,
  className,
}) => (
  <Grid
    sx={pageContainerStyle}
    container
    alignItems="flex-start"
    justifyContent="center"
  >
    <SpacedGrid
      sx={errorContainerStyle}
      wrap="nowrap"
      spacing={6}
      alignItems="flex-start"
      justifyContent="center"
    >
      <ErrorIcon color="error" sx={{ fontSize: "8em" }} />
      <TextContainer className={classNames("error-full-page", className)}>
        {title && (
          <Typography
            className="error-view-title"
            variant="h2"
            fontWeight={500}
          >
            {title}
          </Typography>
        )}
        {message && (
          <Typography
            className="error-view-message"
            variant="h4"
            textTransform="uppercase"
            paragraph
          >
            {message}
          </Typography>
        )}
        {instructions && (
          <Typography
            className="error-view-instructions"
            variant="body1"
            color="textSecondary"
          >
            {instructions}
          </Typography>
        )}
        <Spacer />
        {buttonText && !hideButton && (
          <Button size="large" variant="contained" onClick={onClickButton}>
            {buttonText}
          </Button>
        )}
      </TextContainer>
    </SpacedGrid>
  </Grid>
);

//================================================

export const ErrorSection: React.FC<Omit<ErrorPageProps, "title">> = ({
  defaultText = fallbackText,
  message = defaultText?.message,
  instructions = defaultText.instructions,
  buttonText = defaultText?.buttonText,
  onClickButton = refresh,
  hideButton = true,
  className,
}) => (
  <SpacedGrid
    sx={{
      ...errorContainerStyle,
      paddingTop: theme => theme.spacing(4),
      paddingBottom: theme => theme.spacing(4),
    }}
    wrap="nowrap"
    spacing={6}
    justifyContent="center"
    alignItems="center"
  >
    <ErrorIcon color="error" sx={{ fontSize: "5em" }} />
    <Box
      sx={sectionContainerStyle}
      className={classNames("error-section", className)}
    >
      {message && (
        <Typography
          className="error-view-message"
          variant="h5"
          textTransform="uppercase"
        >
          {message}
        </Typography>
      )}
      {instructions && (
        <Typography
          className="error-view-instructions"
          variant="body1"
          color="textSecondary"
        >
          {instructions}
        </Typography>
      )}
      <Spacer />
      {buttonText && !hideButton && (
        <Button size="large" variant="contained" onClick={onClickButton}>
          {buttonText}
        </Button>
      )}
    </Box>
  </SpacedGrid>
);
