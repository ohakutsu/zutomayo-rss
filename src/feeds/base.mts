import type { FeedOptions } from "feed";
import { Feed } from "feed";

export interface FeedItem {
  date: number; // unix time
  link: string;
  title: string;
}

export interface FeedAttributes {
  copyright: string;
  id: string;
  items: FeedItem[];
  link: string;
  title: string;
  description: string;
}

interface FeedGenerateOptions {
  atomSelfLink?: string;
}

export abstract class FeedBase {
  readonly copyright: string;
  readonly id: string;
  readonly items: FeedItem[];
  readonly link: string;
  readonly title: string;
  readonly description: string;

  constructor(attrs: FeedAttributes) {
    const { copyright, id, items, link, title, description } = attrs;
    this.copyright = copyright;
    this.id = id;
    this.items = items;
    this.link = link;
    this.title = title;
    this.description = description;
  }

  toRss(options?: FeedGenerateOptions): string {
    const feedOptions: FeedOptions = {
      copyright: this.copyright,
      id: this.link,
      link: this.link,
      title: this.title,
      description: this.description,
      updated: new Date(this.latestFeedItemDate()),
    };

    // `atom:link` with `rel="self"`
    // https://validator.w3.org/feed/docs/warning/MissingAtomSelfLink.html
    if (options && options.atomSelfLink) {
      feedOptions.feedLinks = {
        rss: options.atomSelfLink,
      };
    }

    const feed = new Feed(feedOptions);

    this.items.forEach((item) => {
      feed.addItem({
        date: new Date(item.date),
        id: item.link,
        link: item.link,
        title: item.title,
      });
    });

    return feed.rss2();
  }

  private latestFeedItemDate(): number {
    const now = Date.now();
    const latestItemDate = this.items
      .map((item) => item.date)
      .filter((date) => date < now)
      .sort((a, b) => a + b) // order by desc
      .at(0);

    return latestItemDate || 0;
  }

  static async create(): Promise<FeedBase> {
    throw new Error("Not Implement Error");
  }
}
