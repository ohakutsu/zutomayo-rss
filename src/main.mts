import { JSDOM, VirtualConsole } from "jsdom";
import fetch from "node-fetch";
import { RssFeed } from "./feed.mjs";
import { ZUTOMAYO_NEWS_URL, ZUTOMAYO_WEBSITE_URL } from "./zutomayo-url.mjs";

const isAnchorElement = (element: Element): element is HTMLAnchorElement => {
  return typeof (element as any).href !== "undefined";
};
const isNotNullAndUndefined = <T extends any>(
  obj: T
): obj is Exclude<Exclude<T, null>, undefined> => {
  return obj !== null && obj !== undefined;
};

const getNews = async () => {
  const response = await fetch(ZUTOMAYO_NEWS_URL);
  if (!response.ok) {
    console.error(response);
    throw new Error("Request failed");
  }

  const html = await response.text();
  const virtualConsole = new VirtualConsole();
  const jsdom = new JSDOM(html, { virtualConsole });

  const newsAnchorElements = jsdom.window.document.querySelectorAll(
    ".ztmy-pcmove-news-list a"
  );
  const news = Array.from(newsAnchorElements)
    .map((anchor) => {
      if (!isAnchorElement(anchor)) {
        return null;
      }

      const href = anchor.href;
      const title = anchor.querySelector("p")?.textContent;
      const matchResult = anchor
        .querySelector("time")
        ?.textContent?.match(/\[(\d{4})\.(\d{2})\.(\d{2})\]/);

      if (!href || !title || !matchResult) {
        return null;
      }

      const url = `${ZUTOMAYO_WEBSITE_URL}${href}`;
      const [, year, month, day] = matchResult;

      return {
        date: {
          day: parseInt(day, 10),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
        },
        title,
        url,
      };
    })
    .filter(isNotNullAndUndefined);

  return news;
};

const main = async () => {
  const news = await getNews();
  const feed = new RssFeed(news);

  await feed.save();
};

await main();
