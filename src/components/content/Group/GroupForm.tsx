import { useState } from "react";

import TextField from "@mui/material/TextField";

import type { ProductGroup } from "~/utils";

//================================================

export interface GroupFormProps {
  id: string;
  group?: ProductGroup;
  onSave: (group: ProductGroup) => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({ id, group, onSave }) => {
  const [name, setName] = useState(group?.name ?? "");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ ...(group ?? { products: [], open: true }), name });
  };

  return (
    <form id={id} onSubmit={onSubmit}>
      <TextField
        sx={{
          marginY: theme => theme.spacing(4),
        }}
        label="Group Name"
        id="group-name"
        name="name"
        value={name}
        onChange={e => setName(e.currentTarget.value)}
      />
    </form>
  );
};
