import fs from 'fs';
import path from 'path';
import https from 'https';

const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const fonts = [
    { id: 'lato', variants: ['300', 'regular', '700', '900'] },
    { id: 'jetbrains-mono', variants: ['regular', '700'] },
    { id: 'inter', variants: ['300', 'regular', '500', '600', '700', '800'] },
    { id: 'space-grotesk', variants: ['300', 'regular', '500', '600', '700'] }
  ];

  const targetDir = path.resolve('public/fonts');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const font of fonts) {
    console.log(`Fetching metadata for ${font.id}...`);
    const data = await getJSON(`https://gwfh.mranftl.com/api/fonts/${font.id}?subsets=latin`);
    
    // Find matching variants
    for (const variant of data.variants) {
      if (font.variants.includes(variant.id)) {
        const woff2Url = variant.woff2;
        if (woff2Url) {
          const suffix = variant.id === 'regular' ? '400' : variant.id;
          const filename = `${font.id}-${suffix}.woff2`;
          const destPath = path.join(targetDir, filename);
          console.log(`Downloading ${filename} from ${woff2Url}...`);
          await downloadFile(woff2Url, destPath);
          console.log(`Saved to ${destPath}`);
        }
      }
    }
  }
  console.log('All fonts downloaded successfully!');
}

main().catch(console.error);
