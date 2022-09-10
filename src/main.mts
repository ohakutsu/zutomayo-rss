import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import url from "node:url";
import { NewsFeed } from "./feeds/news.mjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PATH = path.resolve(__dirname, "../feed");

const feedClasses = [NewsFeed];

for (let feedClass of feedClasses) {
  const feed = await feedClass.create();
  const xml = feed.toRss();

  const filePath = path.resolve(PUBLIC_PATH, `${feed.id}.xml`);
  await fs.writeFile(filePath, xml, "utf-8");

  await setTimeout(1000); // Sleep 1 sec
}
