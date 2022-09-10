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
}

export abstract class FeedBase {
  readonly copyright: string;
  readonly id: string;
  readonly items: FeedItem[];
  readonly link: string;
  readonly title: string;

  constructor(attrs: FeedAttributes) {
    const { copyright, id, items, link, title } = attrs;
    this.copyright = copyright;
    this.id = id;
    this.items = items;
    this.link = link;
    this.title = title;
  }

  toRss(): string {
    const feed = new Feed({
      copyright: this.copyright,
      id: this.link,
      link: this.link,
      title: this.title,
      updated: new Date(this.latestFeedItemDate()),
    });

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
