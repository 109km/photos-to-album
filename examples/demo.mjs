// Synthetic vector landscapes: no personal photos or downloaded assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const root=fileURLToPath(new URL('../',import.meta.url));
await fs.mkdir(path.join(root,'outputs'),{recursive:true});
const out=await fs.mkdtemp(path.join(root,'outputs','demo-'));
for(const [i,colors] of [['#dce9e7','#dfad67','#486b72','#284950'],['#eedcc9','#de916c','#9d6473','#554c6b']].entries()){
 const [sky,sun,near,far]=colors;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2260" height="1000"><rect width="2260" height="1000" fill="${sky}"/><circle cx="1660" cy="290" r="130" fill="${sun}"/><path d="M0 710L370 310L710 650L1050 210L1450 650L1800 410L2260 700V1000H0Z" fill="${near}"/><path d="M0 850L520 610L930 850L1450 530L1850 790L2260 600V1000H0Z" fill="${far}"/><path d="M0 920Q600 830 1130 925T2260 900V1000H0Z" fill="${sky}" opacity=".35"/></svg>`;
 await sharp(Buffer.from(svg)).png().toFile(path.join(out,`${i}.png`));
}
// Include the return turn, excluding the intro/outro so playback loops at a resting green page.
await fs.writeFile(path.join(out,'job.json'),JSON.stringify({images:['0.png','1.png','0.png'],quality:'720p',duration:'1s',frameRange:[120,359]},null,2));
const result=spawnSync(process.execPath,[path.join(root,'scripts/render.mjs'),path.join(out,'job.json'),path.join(out,'album.mp4')],{stdio:'inherit'});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status??1);
console.log(`Demo saved to ${out}`);
