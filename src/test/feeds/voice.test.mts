import esmock from "esmock";
import fetch from "node-fetch";
import assert from "node:assert";
import { describe, it } from "node:test";
import { VoiceFeed } from "../../feeds/voice.mjs";
import { snapshot } from "../helpers/snapshot.mjs";

const mockFetch = async (url: string) => {
  const expectedUrl = "https://zutomayo.net/voice";
  assert.equal(url, expectedUrl);

  const body = await snapshot("voice-feed-fetch", async () => {
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

describe(VoiceFeed.name, () => {
  it("returns RSS feed", async () => {
    const { VoiceFeed: MockVoiceFeed } = (await esmock(
      "../../feeds/voice.mjs",
      {
        "node-fetch": mockFetch,
      },
    )) as { VoiceFeed: typeof VoiceFeed };

    const feed = await MockVoiceFeed.create();
    const xml = feed.toRss();
    const expected = await snapshot("voice-feed-to-rss", async () => {
      return xml;
    });

    assert.equal(xml, expected);
  });

  describe("with atomSelfLink option", () => {
    it("returns RSS feed with atomSelfLink", async () => {
      const { VoiceFeed: MockVoiceFeed } = (await esmock(
        "../../feeds/voice.mjs",
        {
          "node-fetch": mockFetch,
        },
      )) as { VoiceFeed: typeof VoiceFeed };

      const feed = await MockVoiceFeed.create();
      const xml = feed.toRss({
        atomSelfLink: "https://example.com",
      });
      const expected = await snapshot(
        "voice-feed-to-rss-with-atom-self-link",
        async () => {
          return xml;
        },
      );

      assert.equal(xml, expected);
    });
  });
});
