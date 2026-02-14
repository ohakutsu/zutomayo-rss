import { Response } from "node-fetch";
import { describe, expect, it, vi } from "vitest";
import { NewsFeed } from "../../feeds/news.mjs";
import { snapshot } from "../helpers/snapshot.mjs";

vi.mock(import("../../lib/request.mjs"), (importOriginal) => {
  const mockRequest = async (url: string) => {
    const expectedUrl = "https://zutomayo.net/news";
    expect(url).toBe(expectedUrl);

    const body = await snapshot("news-feed-fetch", async () => {
      const { request: realRequest } = await importOriginal();

      const response = await realRequest(expectedUrl);
      const body = await response.text();
      return body;
    });

    return {
      text: async () => {
        return body;
      },
    } as Response;
  };

  return {
    request: mockRequest,
  };
});

describe(NewsFeed.name, () => {
  it("returns RSS feed", async () => {
    const feed = await NewsFeed.create();
    const xml = feed.toRss();

    await expect(xml).toMatchFileSnapshot(
      "../__snapshots__/news-feed-to-rss.snap",
    );
  });

  describe("with atomSelfLink option", () => {
    it("returns RSS feed with atomSelfLink", async () => {
      const feed = await NewsFeed.create();
      const xml = feed.toRss({
        atomSelfLink: "https://example.com",
      });

      await expect(xml).toMatchFileSnapshot(
        "../__snapshots__/news-feed-to-rss-with-atom-self-link.snap",
      );
    });
  });
});
