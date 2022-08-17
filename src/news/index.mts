import { generateNewsFeed } from "./feed.mjs";
import { NewsItem } from "./news-item.mjs";

export const newsFeed = async () => {
  const news = await NewsItem.all();
  await generateNewsFeed(news);

  console.log("Generated news feed!");
};
