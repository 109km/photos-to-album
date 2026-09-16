import fs from 'node:fs/promises';
import {normalizeOptions} from './options.mjs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const args = process.argv.slice(2);
const planOnly = args.at(-1) === '--plan';
if (planOnly) args.pop();
const [jobFile, outputFile, runtimeArg, templateDir] = args;
const runtimeDir = runtimeArg ?? fileURLToPath(new URL('../', import.meta.url));
if (!jobFile || !outputFile) throw new Error('Usage: render.mjs job.json output.mp4 [runtime] [template] [--plan]');
const job = normalizeOptions(JSON.parse(await fs.readFile(jobFile, 'utf8')));
const ratio = value => {
  const parts = String(value).split(':').map(Number);
  const number = parts.length === 2 ? parts[0] / parts[1] : parts.length === 1 ? parts[0] : NaN;
  if (!Number.isFinite(number) || number <= 0) throw new Error('Ratios must be positive numbers or W:H');
  return number;
};
const duration = Number(String(job.duration ?? 2).replace(/s$/, ''));
if (!Number.isFinite(duration) || duration <= 0) throw new Error('duration must be positive seconds');
const hold = Math.max(1, Math.round(duration * 60)) / 60;
const videoRatio = ratio(job.videoRatio ?? '16:9');
const verticalTurn = videoRatio < 1;
const imageRatio = ratio(job.imageRatio ?? (verticalTurn ? 1 / 2.26 : 2.26));
const qualities = {'720p':720, '1080p':1080, '4k':2160};
const quality = job.quality ?? '4k';
const shortEdge = Object.hasOwn(qualities, quality) ? qualities[quality] : undefined;
if (!shortEdge) throw new Error('quality must be 720p, 1080p or 4k');
const even = n => Math.max(2, Math.round(n / 2) * 2);
const width = even(shortEdge * Math.max(1, videoRatio));
const height = even(shortEdge * Math.max(1, 1 / videoRatio));
if (![width, height].every(Number.isSafeInteger)) throw new Error('Video dimensions exceed supported numeric range');
if (!Array.isArray(job.images) || !job.images.length) throw new Error('Provide at least one styled image');
const images = job.images.map(file => path.resolve(path.dirname(path.resolve(jobFile)), file));
const require = createRequire(path.join(path.resolve(runtimeDir), 'package.json'));
const sharp = require('sharp');
for (const file of images) {
  const metadata = await sharp(file).metadata();
  if (!metadata.width || !metadata.height || Math.abs(metadata.width / metadata.height / imageRatio - 1) > .002)
    throw new Error(`Image ratio differs from album ratio: ${file}`);
}
const props = {pageFlipSound: job.pageFlipSound ?? false, images: images.map((file,i) => `${i}${path.extname(file)}`), imageRatio, verticalTurn, width, height, fps:60, duration:hold, durationInFrames:Math.round(((hold + 1) * images.length + 3) * 60)};
if (!Number.isSafeInteger(props.durationInFrames)) throw new Error('Duration exceeds supported numeric range');
if (job.frameRange && (!Array.isArray(job.frameRange) || job.frameRange.length !== 2 || !job.frameRange.every(Number.isInteger) || job.frameRange[0] < 0 || job.frameRange[1] < job.frameRange[0] || job.frameRange[1] >= props.durationInFrames)) throw new Error('Invalid frameRange');
console.log(JSON.stringify({...props, sources:images}, null, 2));
if (!planOnly) {
  const output = path.resolve(outputFile);
  if (path.extname(output).toLowerCase() !== '.mp4') throw new Error('Output must be .mp4');
  try { await fs.access(output); throw new Error('Output exists; choose a new filename'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const stillDir = output + '.stills';
  for (const existing of [stillDir, output + '.json']) {
    try { await fs.access(existing); throw new Error('Output artifacts exist; choose a new filename'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const template = templateDir ? path.resolve(templateDir) : fileURLToPath(new URL('../assets/travel-album/', import.meta.url));
  const temp = await fs.mkdtemp(path.join(path.resolve(runtimeDir), '.photos-to-album-'));
  try {
    await fs.cp(template, temp, {recursive:true});
    const publicDir = path.join(temp, 'public');
    await fs.mkdir(publicDir);
    if (props.pageFlipSound) await fs.copyFile(fileURLToPath(new URL('../assets/page-flip.wav', import.meta.url)), path.join(publicDir, 'page-flip.wav'));
    await Promise.all(images.map((file,i) => fs.copyFile(file, path.join(publicDir, props.images[i]))));
    const {bundle} = require('@remotion/bundler');
    const {selectComposition, renderMedia, renderStill} = require('@remotion/renderer');
    const serveUrl = await bundle({entryPoint:path.join(temp,'index.tsx'),publicDir});
    const composition = await selectComposition({serveUrl,id:'Album',inputProps:props});
    await fs.mkdir(path.dirname(output), {recursive:true});
    await fs.mkdir(stillDir, {recursive:true});
    for (let i=0; i<images.length; i++) {
      const stillWidth = imageRatio >= 1 ? 3840 : Math.round(3840 * imageRatio);
      const stillHeight = imageRatio >= 1 ? Math.round(3840 / imageRatio) : 3840;
      const stillProps = {...props, width:stillWidth, height:stillHeight, stillIndex:i};
      const stillComposition = await selectComposition({serveUrl,id:'Album',inputProps:stillProps});
      await renderStill({serveUrl,composition:stillComposition,inputProps:stillProps,frame:120,output:path.join(stillDir, `${String(i+1).padStart(2,'0')}-book.png`),imageFormat:'png'});
    }
    await renderMedia({serveUrl,composition,inputProps:props,outputLocation:output,codec:'h264',muted:!props.pageFlipSound,pixelFormat:'yuv420p',crf:18,concurrency:4,...(job.frameRange ? {frameRange:job.frameRange} : {})});
    await fs.writeFile(output + '.json', JSON.stringify({...props,sources:images,frameRange:job.frameRange ?? null},null,2));
  } finally { await fs.rm(temp,{recursive:true,force:true}); }
}
