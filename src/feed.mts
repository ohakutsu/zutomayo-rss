import { Feed } from "feed";
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { ZUTOMAYO_WEBSITE_URL } from "./zutomayo-url.mjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE_PATH = path.resolve(__dirname, "../feed/news.xml");

interface Datum {
  date: {
    day: number;
    month: number;
    year: number;
  };
  title: string;
  url: string;
}

export class RssFeed {
  private rss: string;

  constructor(data: Datum[]) {
    this.rss = this.generate(data);
  }

  async save() {
    await fs.writeFile(STORE_FILE_PATH, this.rss, "utf-8");
  }

  private generate(data: Datum[]) {
    const feed = new Feed({
      copyright: "zutomayo",
      description: "Zutomayo news RSS",
      id: ZUTOMAYO_WEBSITE_URL,
      link: ZUTOMAYO_WEBSITE_URL,
      title: "Zutomayo News",
    });

    data.forEach((datum) => {
      const { date, title, url } = datum;
      const { year, month, day } = date;

      feed.addItem({
        date: new Date(year, month, day),
        id: url,
        link: url,
        title: title,
      });
    });

    return feed.rss2();
  }
}
