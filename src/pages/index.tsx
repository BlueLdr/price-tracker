import { useContext } from "react";

import { Main } from "~/components";
import { AppContext } from "~/context";

//================================================

const Page = () => {
  const { groups, setGroups } = useContext(AppContext);

  if (!groups) {
    return null;
  }
  return <Main groups={groups} setGroups={setGroups} />;
};

export default Page;
