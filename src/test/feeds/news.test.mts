import esmock from "esmock";
import fetch from "node-fetch";
import assert from "node:assert";
import { describe, it } from "node:test";
import { NewsFeed } from "../../feeds/news.mjs";
import { snapshot } from "../helpers/snapshot.mjs";

const mockFetch = async (url: string) => {
  const expectedUrl = "https://zutomayo.net/news";
  assert.equal(url, expectedUrl);

  const body = await snapshot("news-feed-fetch", async () => {
    const response = await fetch(expectedUrl);
    const body = await response.text();
    return body;
  });

  return {
    text: async () => {
      return body;
    },
  };
};

describe(NewsFeed.name, () => {
  it("returns RSS feed", async () => {
    const { NewsFeed: MockNewsFeed } = (await esmock("../../feeds/news.mjs", {
      "node-fetch": mockFetch,
    })) as { NewsFeed: typeof NewsFeed };

    const feed = await MockNewsFeed.create();
    const xml = feed.toRss();
    const expected = await snapshot("news-feed-to-rss", async () => {
      return xml;
    });

    assert.equal(xml, expected);
  });

  describe("with atomSelfLink option", () => {
    it("returns RSS feed with atomSelfLink", async () => {
      const { NewsFeed: MockNewsFeed } = (await esmock("../../feeds/news.mjs", {
        "node-fetch": mockFetch,
      })) as { NewsFeed: typeof NewsFeed };

      const feed = await MockNewsFeed.create();
      const xml = feed.toRss({
        atomSelfLink: "https://example.com",
      });
      const expected = await snapshot(
        "news-feed-to-rss-with-atom-self-link",
        async () => {
          return xml;
        },
      );

      assert.equal(xml, expected);
    });
  });
});
