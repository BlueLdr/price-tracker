import { useContext, useEffect } from "react";

import { AppContext, DragModeContext } from "~/context";

//================================================

export const SchedulerManager: React.FC = () => {
  const { dragEnabled } = useContext(DragModeContext);
  const { scrapeScheduler } = useContext(AppContext);
  useEffect(() => {
    if (!dragEnabled) {
      scrapeScheduler?.pause();
      return () => scrapeScheduler?.unpause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragEnabled]);

  return null;
};
