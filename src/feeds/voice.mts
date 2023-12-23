import { JSDOM, VirtualConsole } from "jsdom";
import { isAnchorElement } from "../lib/element-type.mjs";
import { request } from "../lib/request.mjs";
import type { FeedItem } from "./base.mjs";
import { FeedBase } from "./base.mjs";

const BASE_URL = "https://zutomayo.net";
const VOICE_URL = new URL("/voice", BASE_URL).toString();

export class VoiceFeed extends FeedBase {
  static async create() {
    const response = await request(VOICE_URL);
    const html = await response.text();

    const virtualConsole = new VirtualConsole();
    const dom = new JSDOM(html, { virtualConsole });
    const elements = dom.window.document.querySelectorAll(".ztmy-topics");

    const items: FeedItem[] = Array.from(elements).map((element) => {
      const [, year, month, day] = element
        .querySelector(".ztmy-date")!
        .textContent!.match(/(\d{4})\.(\d{2})\.(\d{2})/)!;
      const date = new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
        ),
      );
      date.setUTCHours(date.getUTCHours() - 9); // JST to UTC

      const title = element.querySelector(".ztmy-ttl")!.textContent;
      if (!title) {
        throw new Error("Title is blank");
      }

      const anchor = element.querySelector(".ztmy-topics-more a")!;
      if (!isAnchorElement(anchor)) {
        throw new Error("Expect an anchor element");
      }
      const link = new URL(anchor.href, BASE_URL).toString();

      return {
        date: date.getTime(),
        link,
        title,
      };
    });

    return new VoiceFeed({
      copyright: "ZUTOMAYO",
      id: "voice",
      items,
      link: VOICE_URL,
      title: "ZUTOMAYO Voice",
    });
  }
}
