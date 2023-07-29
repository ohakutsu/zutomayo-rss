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
    const elements = dom.window.document.querySelectorAll(".ztmy-detail-list");

    const items: FeedItem[] = Array.from(elements)
      .map((element) => {
        const head = element.querySelector(".ztmy-topics-head");
        const title = head!.querySelector("h3")!.textContent!;
        const [, year, month, day] = head!
          .querySelector("p")!
          .textContent!.match(/\[(\d{4})\.(\d{2})\.(\d{2})\]/)!;

        const anchor = element.querySelector("a")!;
        if (!isAnchorElement(anchor)) {
          throw new Error("Element is not anchor");
        }
        const link = new URL(anchor.href, BASE_URL).toString();

        const date = new Date(
          Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
          ),
        );
        date.setUTCHours(date.getUTCHours() - 9); // JST to UTC

        return {
          date: date.getTime(),
          link,
          title,
        };
      })
      .slice(0, 20);

    return new NewsFeed({
      copyright: "ZUTOMAYO",
      id: "news",
      items,
      link: NEWS_URL,
      title: "ZUTOMAYO News",
    });
  }
}
