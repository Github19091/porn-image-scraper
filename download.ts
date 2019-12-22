import { createWriteStream, mkdirSync, existsSync } from "fs";
import { join, basename } from "path";
import Axios from "axios";

const baseFolder = "images";
if (!existsSync(baseFolder)) mkdirSync(baseFolder);

export async function downloadImages(gallery: string, urls: string[]) {
  const galleryFolder = join(baseFolder, gallery);

  if (!existsSync(galleryFolder)) {
    try {
      mkdirSync(galleryFolder);
    } catch (err) {
      console.error("Could not create gallery folder");
      process.exit(1);
    }
  }

  for (const url of urls) {
    const path = join(galleryFolder, basename(url));
    await downloadImage(url, path);
  }
}

export async function downloadImage(url: string, path: string) {
  if (existsSync(path)) {
    console.warn(`\t${url} already exists, skipping...`);
    return;
  }

  const writer = createWriteStream(path);

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  console.log(`\tDownloading ${url}...`);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
