"use client";
import { useContext, useEffect, useRef, useState } from "react";

import { Modal } from "~/components";
import { ProductForm } from "./ProductForm";
import { ModalsContext } from "~/context";
import {
  applyProductUpdates,
  createProductFromListing,
  scrapeUrl,
  useModalTarget,
} from "~/utils";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import type { ProductWithUpdates } from "~/utils";

//================================================

const FORM_ID = "add-product-form";
const DEBUG = false;

//================================================

export const AddProductModal: React.FC = () => {
  const iframeRef = useRef<HTMLDivElement>(null);
  const { addProductTarget, setAddProductTarget } = useContext(ModalsContext);

  const [open, target, TransitionProps] = useModalTarget(addProductTarget);

  const [initialUrl, setInitialUrl] = useState("");
  const [initialData, setInitialData] = useState<ProductWithUpdates>();
  const [scrapeError, setScrapeError] = useState("");

  useEffect(() => {
    if (!initialUrl) {
      setInitialData(undefined);
      return;
    }
    try {
      new URL(initialUrl);
      scrapeUrl(initialUrl, DEBUG ? iframeRef : undefined)
        .then(listing => {
          if (!listing) {
            return;
          }
          setInitialData(createProductFromListing(listing));
        })
        .catch(err => {
          console.error(`Failed to preview link ${initialUrl}:`, err);
          setScrapeError(typeof err === "object" ? err.toString() : err);
        });
    } catch {
      return;
    }
  }, [initialUrl]);

  const onClose = () => {
    setAddProductTarget(undefined);
    setInitialUrl("");
  };

  const onSave = (product: ProductWithUpdates) => {
    target?.onSave("", applyProductUpdates(product));
    onClose();
  };

  return (
    <Modal
      open={open}
      id={`${FORM_ID}-modal`}
      titleText="Add Product"
      onClose={onClose}
      TransitionProps={TransitionProps}
      cancelButton={<Button>Cancel</Button>}
      fullWidth
      maxWidth={DEBUG && !initialData && !!initialUrl ? "md" : "sm"}
      confirmButton={
        <Button form={FORM_ID} type="submit">
          Save
        </Button>
      }
    >
      {initialData ? (
        <ProductForm
          id={FORM_ID}
          onSave={onSave}
          product={initialData}
          onClearListings={() => setInitialUrl("")}
        />
      ) : (
        <TextField
          sx={{ marginY: theme => theme.spacing(2) }}
          autoFocus
          label="Enter a URL:"
          fullWidth
          value={initialUrl}
          onChange={e => {
            setScrapeError("");
            setInitialUrl(e.currentTarget.value);
          }}
          error={!!initialUrl && !!scrapeError}
          helperText={scrapeError}
        />
      )}
      {DEBUG && !initialData && !!initialUrl && (
        <Box
          ref={iframeRef}
          width="100%"
          height="100%"
          maxHeight={720}
          maxWidth={1080}
        />
      )}
    </Modal>
  );
};
