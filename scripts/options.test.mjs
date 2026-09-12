import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeOptions} from './options.mjs';
test('Chinese job equals English job',()=>{
 assert.deepEqual(normalizeOptions({照片:['a.png'],照片风格:'原图',停留时间:'2秒',画质:'超高清',相册比例:'2.26比1',视频比例:'16：9',帧范围:[0,5]}),normalizeOptions({images:['a.png'],photo_style:'origin',duration:'2s',quality:'4k',imageRatio:'2.26:1',videoRatio:'16:9',frameRange:[0,5]}));
});
test('English prompt aliases and mixed-language values',()=>{
 assert.deepEqual(normalizeOptions({image_ratio:'2.26:1',video_ratio:'9：16',quality:'4K',photo_style:'大师级摄影'}),{imageRatio:'2.26:1',videoRatio:'9:16',quality:'4k',photo_style:'大师级摄影'});
});
test('quality aliases are explicit',()=>{
 for(const [cn,en] of [['高清','720p'],['全高清','1080p'],['超高清','4k']])assert.equal(normalizeOptions({视频画质:cn}).quality,en);
});
test('equivalent duplicate aliases accepted; contradictory aliases rejected',()=>{
 assert.equal(normalizeOptions({duration:2,停留时间:'2秒'}).duration,2);
 assert.throws(()=>normalizeOptions({duration:2,停留时间:'3秒'}),/参数冲突/);
});
test('custom style descriptions and image order preserved',()=>{
 const value=normalizeOptions({照片:['乙.png','甲.png'],照片风格:'铅笔素描'});
 assert.deepEqual(value.images,['乙.png','甲.png']);assert.equal(value.photo_style,'铅笔素描');
});

test('renderer defaults to 4K and two-second holds and preserves explicit overrides',async()=>{
 const fs=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');
 const {join}=await import('node:path');
 const {execFileSync}=await import('node:child_process');
 const {fileURLToPath}=await import('node:url');
 const {default:sharp}=await import('sharp');
 const dir=await fs.mkdtemp(join(tmpdir(),'album-duration-'));
 try {
  await sharp({create:{width:226,height:100,channels:3,background:'white'}}).png().toFile(join(dir,'photo.png'));
  for(const [setting,hold,frames,width,height] of [[{},2,540,3840,2160],[{duration:3,quality:'1080p'},3,660,1920,1080],[{停留时间:'1.5秒',画质:'高清'},1.5,480,1280,720],[{画质:'超高清',视频比例:'9:16',imageRatio:2.26},2,540,2160,3840]]){
   const job=join(dir,'job.json');
   await fs.writeFile(job,JSON.stringify({images:['photo.png','photo.png'],...setting}));
   const plan=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL('./render.mjs',import.meta.url)),job,join(dir,'unused.mp4'),'--plan'],{encoding:'utf8'}));
   assert.equal(plan.duration,hold);assert.equal(plan.durationInFrames,frames);
   assert.equal(plan.width,width);assert.equal(plan.height,height);
   assert.equal(plan.verticalTurn,height > width);assert.equal(plan.imageRatio,2.26);
  }
   await sharp({create:{width:100,height:226,channels:3,background:'white'}}).png().toFile(join(dir,'portrait.png'));
  for(const setting of [{video_ratio:'9:16'},{视频比例:'9：16'}]){
   const job=join(dir,'portrait.json');
   await fs.writeFile(job,JSON.stringify({images:['portrait.png'],...setting}));
   const plan=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL('./render.mjs',import.meta.url)),job,join(dir,'portrait.mp4'),'--plan'],{encoding:'utf8'}));
   assert.equal(plan.imageRatio,1/2.26);assert.equal(plan.verticalTurn,true);
   assert.equal(plan.width,2160);assert.equal(plan.height,3840);
  }
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});
