import { comparator, scrapeUrl } from "~/utils/helpers";

import type { ParsedPageListing } from "~/utils/types";

//================================================

const DEBUG = false;

const MINUTE = 1000 * 60; // 1 min
const QUEUE_INTERVAL = 2000; // 2 s
const POLL_INTERVAL = 10 * MINUTE;
const TIMER_PAUSED = "PAUSED";

const debugLog = (...args: any[]) =>
  DEBUG ? console.debug(...args) : undefined;
const debugGroup = (...args: any[]) =>
  DEBUG ? console.group(...args) : undefined;
const debugGroupEnd = () => (DEBUG ? console.groupEnd() : undefined);

//================================================

export interface QueuedRequest {
  url: string;
  timestamp: number;
  resolve: (value: ParsedPageListing | undefined) => void;
  reject: (reason?: any) => void;
}

interface ScheduledRequest extends QueuedRequest {
  timer: any;
}

//================================================

export class ScrapeScheduler {
  private timer: any = null;
  private queue: QueuedRequest[] = [];
  private scheduledQueue: ScheduledRequest[] = [];

  constructor() {
    this.start();
  }

  private processQueue = () => {
    if (!this.queue.length) {
      if (!this.scheduledQueue.length) {
        debugLog("Queue is now empty.");
        this.stop();
      }
      return;
    }
    this.queue = this.queue.slice().sort(comparator("timestamp", "asc"));
    if (this.shouldScheduleRequest(this.queue[0])) {
      this.scheduleRequest(this.queue.shift());
      if (this.queue.length) {
        debugGroup("Next queue item is: ");
        debugLog("url:", this.queue[0].url);
        const timestamp = new Date(this.queue[0].timestamp);
        const timePassed = Math.floor(
          (Date.now() - timestamp.getTime()) / MINUTE,
        );
        debugLog(
          "Last updated:",
          timestamp,
          `${timePassed} minute${timePassed === 1 ? "" : "s"} ago)`,
        );
        debugGroupEnd();
      } else {
        debugLog("Queue is now empty.");
      }
    }
  };

  private shouldScheduleRequest = (request: QueuedRequest) =>
    Date.now() - request.timestamp > POLL_INTERVAL - MINUTE;

  private scheduleRequest = (request: QueuedRequest | undefined) => {
    if (!request) {
      return;
    }
    debugGroup("Scheduling request for", request.url);
    const maxDelay = request.timestamp + POLL_INTERVAL + MINUTE - Date.now();
    if (maxDelay <= 0) {
      debugLog("Too much time has passed, sending request immediately");
      this.processRequest(request);
    } else {
      const time = Math.random() * maxDelay;
      debugLog(`Request should be sent in ${Math.round(time / 1000)} seconds`);
      this.scheduledQueue.push({
        ...request,
        timer: setTimeout(
          () => this.processRequest(request),
          Math.random() * maxDelay,
        ),
      });
    }
    debugGroupEnd();
  };

  private processRequest = (request: QueuedRequest) => {
    scrapeUrl(request.url)
      .then(result => request.resolve(result))
      .catch(err => request.reject(err));
  };

  start = () => {
    if (this.timer) {
      return;
    }
    debugLog("Starting scheduler...");
    this.timer = setInterval(this.processQueue, QUEUE_INTERVAL);
    debugGroup("Checking existing queue items for overdue requests...");
    this.queue = this.queue.filter(item => {
      if (this.shouldScheduleRequest(item)) {
        this.scheduleRequest(item);
        return false;
      }
      return true;
    });
    debugGroupEnd();
  };

  stop = () => {
    if (this.timer && this.timer !== TIMER_PAUSED) {
      debugLog("Stopping scheduler...");
      clearInterval(this.timer);
      this.timer = null;
      debugLog("Moving scheduled requests back to queue...");
      this.scheduledQueue.forEach(({ timer, ...request }) => {
        clearTimeout(timer);
        this.queue.unshift(request);
      });
    }
  };

  enqueueRequest = (
    url: string,
    timestamp: number | undefined,
  ): Promise<ParsedPageListing | undefined> => {
    debugGroup("Enqueuing request for", url);
    if (!timestamp) {
      debugLog("First time scraping this URL, sending request immediately");
      debugGroupEnd();
      return scrapeUrl(url);
    }
    const queueItem = {
      url,
      timestamp: timestamp || Date.now(),
    };

    this.start();
    debugGroupEnd();
    return new Promise<ParsedPageListing | undefined>((resolve, reject) => {
      this.queue.push({
        ...queueItem,
        resolve,
        reject,
      });
    });
  };

  cancelRequest = (url: string) => {
    debugGroup("Cancelling request for", url);
    let found = false;
    this.queue = this.queue.filter(item => {
      if (item.url === url) {
        found = true;
        debugLog("Found request in queue, removing...");
        item.reject("Cancelled");
        return false;
      }
      return true;
    });
    this.scheduledQueue = this.scheduledQueue.filter(item => {
      if (item.url === url) {
        found = true;
        debugLog("Found request in scheduled queue, removing...");
        clearTimeout(item.timer);
        item.reject("Cancelled");
        return false;
      }
      return true;
    });
    if (!found) {
      debugLog("Request not found; doing nothing.");
    }
    debugGroupEnd();
  };

  pause = () => {
    this.stop();
    this.timer = TIMER_PAUSED;
  };

  unpause = () => {
    this.timer = null;
    this.start();
  };
}
