import fetch from "node-fetch";

export const request = (url: string) => {
  const headers = {
    "User-Agent": "zutomayo-rss",
  };

  return fetch(url, {
    headers,
  });
};
