import { Feed } from "feed";
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { ZUTOMAYO_WEBSITE_URL } from "../lib/zutomayo-url.mjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NEWS_FEED_FILE_PATH = path.resolve(__dirname, "../../feed/news.xml");

interface FeedItem {
  date: Date;
  title: string;
  url: string;
}

export const generateNewsFeed = async (items: FeedItem[]) => {
  const feed = new Feed({
    copyright: "zutomayo",
    description: "Zutomayo news RSS",
    id: ZUTOMAYO_WEBSITE_URL,
    link: ZUTOMAYO_WEBSITE_URL,
    title: "Zutomayo News",
  });

  items.forEach((item) => {
    const { date, title, url } = item;

    feed.addItem({
      date,
      id: url,
      link: url,
      title: title,
    });
  });

  const rss = feed.rss2();
  await fs.writeFile(NEWS_FEED_FILE_PATH, rss, "utf-8");
};
