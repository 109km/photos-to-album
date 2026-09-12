import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const checkOnly = process.argv.includes('--check');
const run = (executable, args) => {
  const result = spawnSync(executable, args, {cwd:root, stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${executable} exited with status ${result.status}`);
};
try {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Install Node.js 22 or newer, then run npm run setup again.');
  if (!checkOnly) {
    console.log('1/3 Installing pinned dependencies…');
    // npm_execpath works on Windows too, without running a shell or npm.cmd.
    if (process.env.npm_execpath) run(process.execPath, [process.env.npm_execpath, 'ci', '--no-fund']);
    else if (process.platform !== 'win32') run('npm', ['ci', '--no-fund']);
    else throw new Error('On Windows, run this using npm run setup.');
  }
  if (checkOnly) console.log('1/3 Checking installed package versions…');
  const manifest = JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
  for (const [name, version] of Object.entries(manifest.dependencies)) {
    const installed = JSON.parse(await fs.readFile(path.join(root,'node_modules',name,'package.json'),'utf8')).version;
    if (installed !== version) throw new Error(`${name}: expected ${version}, found ${installed}. Run npm run setup.`);
  }
  const sharp = require('sharp');
  const {ensureBrowser, getVideoMetadata} = require('@remotion/renderer');
  console.log('2/3 Checking the rendering browser (downloads it if needed)…');
  process.chdir(root);
  await ensureBrowser();
  console.log('3/3 Rendering and reading a test MP4…');
  const temp = await fs.mkdtemp(path.join(root,'.setup-check-'));
  try {
    for (const [i,color] of ['#356a83','#d8ac63'].entries()) {
      await sharp({create:{width:1130,height:500,channels:3,background:color}}).png().toFile(path.join(temp,`${i}.png`));
    }
    const job = path.join(temp,'job.json');
    const output = path.join(temp,'test.mp4');
    await fs.writeFile(job,JSON.stringify({images:['0.png','1.png'],quality:'720p',duration:1,frameRange:[185,190]}));
    run(process.execPath,[path.join(root,'scripts/render.mjs'),job,output,root]);
    const metadata = await getVideoMetadata(output);
    if (metadata.width !== 1280 || metadata.height !== 720 || Math.abs(metadata.durationInSeconds-.1) > .03) throw new Error('Test video metadata does not match the requested output.');
    for (const name of ['01-book.png','02-book.png']) {
      const still = await sharp(path.join(output+'.stills',name)).metadata();
      if (still.width !== 3840 || still.height !== 1699) throw new Error('Book still dimensions are incorrect.');
    }
  } finally { await fs.rm(temp,{recursive:true,force:true}); }
  console.log('\nReady: local image preparation and MP4 rendering work. No personal photos were used.\nStyled image generation still requires an image-editing tool in your Codex session.');
} catch (error) {
  console.error(`\nSetup/check failed: ${error.message}\nSee README.md → Troubleshooting. Setup has not been verified.`);
  process.exitCode = 1;
}
