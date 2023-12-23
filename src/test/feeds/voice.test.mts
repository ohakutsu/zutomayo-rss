import esmock from "esmock";
import assert from "node:assert";
import { describe, it } from "node:test";
import { VoiceFeed } from "../../feeds/voice.mjs";
import { request } from "../../lib/request.mjs";
import { snapshot } from "../helpers/snapshot.mjs";

const mockRequest = async (url: string) => {
  const expectedUrl = "https://zutomayo.net/voice";
  assert.equal(url, expectedUrl);

  const body = await snapshot("voice-feed-fetch", async () => {
    const response = await request(expectedUrl);
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
  const getDescribedClass = async () => {
    const { VoiceFeed: DescribedClass } = (await esmock(
      "../../feeds/voice.mjs",
      {
        "../../lib/request.mjs": {
          request: mockRequest,
        },
      },
    )) as { VoiceFeed: typeof VoiceFeed };

    return DescribedClass;
  };

  it("returns RSS feed", async () => {
    const DescribedClass = await getDescribedClass();
    const feed = await DescribedClass.create();
    const xml = feed.toRss();
    const expected = await snapshot("voice-feed-to-rss", async () => {
      return xml;
    });

    assert.equal(xml, expected);
  });

  describe("with atomSelfLink option", () => {
    it("returns RSS feed with atomSelfLink", async () => {
      const DescribedClass = await getDescribedClass();
      const feed = await DescribedClass.create();
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
