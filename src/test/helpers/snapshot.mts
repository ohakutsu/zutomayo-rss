import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @deprecated Use `vitest`'s built-in snapshot testing instead. Consider other methods for HTTP response snapshots.
 */
export const snapshot = async <T,>(
  key: string,
  update: () => Promise<T>,
): Promise<T> => {
  const shouldUpdate = process.env.SNAPSHOT_UPDATE !== undefined;

  const snapshotFilePath = snapshotResolver(key);

  if (shouldUpdate) {
    const val = await update();
    const data = JSON.stringify(val);

    await fs.writeFile(snapshotFilePath, data, { encoding: "utf-8" });
  }

  const data = await fs.readFile(snapshotFilePath, { encoding: "utf-8" });
  return JSON.parse(data) as T;
};

const snapshotResolver = (key: string) => {
  const testDirPath = path.resolve(__dirname, "..");
  const snapshotDirPath = path.resolve(testDirPath, "__snapshots__");

  const snapshotFilePath = path.resolve(snapshotDirPath, `${key}.snap`);
  return snapshotFilePath;
};
