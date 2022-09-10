import { JSDOM, VirtualConsole } from "jsdom";
import fetch from "node-fetch";
import { isAnchorElement } from "../lib/element-type.mjs";
import type { FeedItem } from "./base.mjs";
import { FeedBase } from "./base.mjs";

const BASE_URL = "https://zutomayo.net";
const NEWS_URL = new URL("/news", BASE_URL).toString();

export class NewsFeed extends FeedBase {
  static async create() {
    const response = await fetch(NEWS_URL);
    const html = await response.text();

    const virtualConsole = new VirtualConsole();
    const dom = new JSDOM(html, { virtualConsole });
    const elements = dom.window.document.querySelectorAll(
      ".ztmy-pcmove-news-list a"
    );

    const items: FeedItem[] = Array.from(elements).map((element) => {
      if (!isAnchorElement(element)) {
        throw new Error("Element is not anchor");
      }

      const link = new URL(element.href, BASE_URL).toString();
      const title = element.querySelector("p")!.textContent!;
      const [, year, month, day] = element
        .querySelector("time")!
        .textContent!.match(/\[(\d{4})\.(\d{2})\.(\d{2})\]/)!;

      const date = new Date(
        Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
      );
      date.setUTCHours(date.getUTCHours() - 9); // JST to UTC

      return {
        date: date.getTime(),
        link,
        title,
      };
    });

    return new NewsFeed({
      copyright: "zutomayo",
      id: "news",
      items,
      link: NEWS_URL,
      title: "Zutomayo News",
    });
  }
}
