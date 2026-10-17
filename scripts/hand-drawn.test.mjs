import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import catalog from '../references/hand-drawn-catalog.json' with {type:'json'};
import manifest from '../vendor/hand-drawn/assets/image-manifest.json' with {type:'json'};
import {normalizeOptions} from './options.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const script=path.join(root,'scripts/hand-drawn-prompt.mjs');
const cacheScript=path.join(root,'scripts/cache-hand-drawn-references.py');
const provider=path.join(root,'vendor/hand-drawn/scripts/render_prompt.py');
const source=path.join(root,'assets/book-reference.png');
const offline={...process.env,HAND_DRAWN_OFFLINE:'1'};
const pythonAvailable=spawnSync('python3',['-c','import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)']).status===0;
const referencesReady=pythonAvailable && spawnSync('python3',['-B',cacheScript,'--verify-only'],{env:offline}).status===0;

test('all 21 recipe IDs, names and 108 upstream aliases normalize without changing legacy styles',()=>{
 const ids=['1','2','3','3.1',...Array.from({length:17},(_,i)=>String(i+4))];
 assert.deepEqual(catalog.map(entry=>entry.style_id),ids);
 assert.equal(catalog.reduce((sum,entry)=>sum+entry.aliases.length,0),108);
 for(const entry of catalog)for(const value of [entry.style_id,entry.photo_style,entry.name,entry.name.split('(')[0],...entry.aliases])assert.equal(normalizeOptions({照片风格:value}).photo_style,entry.photo_style,value);
 for(const [input,id] of [['水彩','watercolor'],['涂鸦','graffiti'],['淡彩回忆册','memory-sketch'],['北欧人物纪念册','nordic-memory']])assert.equal(normalizeOptions({照片风格:input}).photo_style,id);
 assert.equal(normalizeOptions({photo_style:'3.1',照片风格:'亲子手绘'}).photo_style,'hand-drawn-3.1');
 assert.throws(()=>normalizeOptions({photo_style:'3.1',照片风格:'水墨写意'}),/参数冲突/);
 assert.equal(normalizeOptions({照片风格:'我的自定义画风'}).photo_style,'我的自定义画风');
});

test('the full menu is available without Python or network',()=>{
 const menu=JSON.parse(execFileSync(process.execPath,[script,'--list'],{encoding:'utf8',env:{...process.env,PATH:'',HAND_DRAWN_OFFLINE:'1'}}));
 assert.deepEqual(menu,catalog);
});

test('the integrated catalog matches the pinned provider parameters and reference links',{skip:!pythonAvailable},()=>{
 const upstream=JSON.parse(execFileSync('python3',['-B',provider,'--list'],{encoding:'utf8'}));
 assert.deepEqual(catalog.map(({photo_style,...entry})=>entry),upstream);
});

for(const entry of catalog)test(`style ${entry.style_id} preserves the complete upstream call, source and workflow`,{skip:!pythonAvailable || (entry.references.length>0 && !referencesReady)},()=>{
 const parameters=JSON.parse(execFileSync('python3',['-B','-c',`import sys,json; sys.path.insert(0,${JSON.stringify(path.dirname(provider))}); import check_skill; print(json.dumps(check_skill.SMOKE_PARAMETERS))`],{encoding:'utf8'}))[entry.style_id];
 const vars=Object.entries(parameters).flatMap(([key,value])=>['--var',`${key}=${value}`]);
 const aspect=Number(entry.style_id)%2 ? '1:2.26' : '2.26:1';
 const call=JSON.parse(execFileSync(process.execPath,[script,'--style',entry.photo_style,'--source',source,'--aspect',aspect,...vars],{encoding:'utf8',env:offline}));
 const expected=JSON.parse(execFileSync('python3',['-B',provider,'--style',entry.style_id,'--aspect',aspect,'--format','json','--character-reference',source,...vars],{encoding:'utf8',env:offline}));
 const {photo_style,source_reference,...upstreamCall}=call;
 assert.equal(photo_style,entry.photo_style);assert.equal(source_reference.path,source);
 assert.deepEqual(upstreamCall,expected);
 assert.equal(call.references.at(-1).path,source);
 assert.equal(call.references.filter(reference=>reference.role==='style-only').length,entry.references.length);
 assert.ok(!/【[\p{L}\p{N}_]+】/u.test(call.prompt));
 if(entry.style_id==='3.1')assert.deepEqual(call.workflow.stages.map(stage=>stage.output_status),['intermediate-only','intermediate-only','final']);
 if(['19','20'].includes(entry.style_id)){
  assert.equal(call.model_requirements.snapshot_lock_required,true);
  assert.equal(call.model_requirements.high_fidelity_image_input_required,true);
  assert.equal(call.model_requirements.production_fallback,'fail-closed');
  assert.equal(call.acceptance_contract.minimum_score,entry.style_id==='19'?30:34);
 }
 if(entry.style_id==='20')assert.equal(call.workflow.stages.at(-1).validator.required_exit_code,0);
});

test('formal contracts reject missing or tampered anchors in offline mode',{skip:!pythonAvailable},()=>{
 const cache=mkdtempSync(path.join(tmpdir(),'album-reference-cache-'));
 try{
  const env={...offline,HAND_DRAWN_IMAGE_CACHE:cache};
  const args=[script,'--style','3.1','--subject','妈妈和孩子一起看书'];
  const missing=spawnSync(process.execPath,args,{encoding:'utf8',env});
  assert.notEqual(missing.status,0);assert.equal(missing.stdout,'');assert.match(missing.stderr,/No valid cached reference/);
  const key='assets/style-3.1/anchor-family.png';
  const target=path.join(cache,manifest.images[key].sha256,key);
  mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,'invalid reference bytes');
  const corrupt=spawnSync(process.execPath,args,{encoding:'utf8',env});
  assert.notEqual(corrupt.status,0);assert.equal(corrupt.stdout,'');assert.match(corrupt.stderr,/No valid cached reference/);
 }finally{rmSync(cache,{recursive:true,force:true});}
});

test('fallback reference downloads also reject bytes that do not match the manifest',{skip:!pythonAvailable},()=>{
 const cache=mkdtempSync(path.join(tmpdir(),'album-reference-fallback-'));
 try{
  const result=spawnSync('python3',['-B','-c',`import runpy,io
namespace=runpy.run_path(${JSON.stringify(cacheScript)})
fn=namespace['cache_reference']
globals=fn.__globals__
def unavailable(*args): raise ValueError('original host unavailable')
globals['hosted_images'].download_image=unavailable
globals['urlopen']=lambda *args,**kwargs: io.BytesIO(b'wrong archive bytes')
try: fn('assets/style-3.1/anchor-family.png')
except ValueError: pass
else: raise AssertionError('invalid bytes accepted')
from pathlib import Path
assert not list(Path(${JSON.stringify(cache)}).rglob('*.png'))
`],{encoding:'utf8',env:{...process.env,HAND_DRAWN_OFFLINE:'0',HAND_DRAWN_IMAGE_CACHE:cache}});
  assert.equal(result.status,0,result.stderr);
 }finally{rmSync(cache,{recursive:true,force:true});}
});

test('invalid parameters and forbidden formal text never produce a partial call',{skip:!pythonAvailable},()=>{
 for(const args of [
  ['--style','hand-drawn-21','--subject','A child'],
  ['--style','1','--subject','A child'],
  ['--style','19','--subject','a child holding a kite','--title','A title'],
  ['--style','20','--subject','a child holding a kite','--text','Write a caption'],
  ['--style','3.1','--subject','妈妈和孩子一起看书','--text','添加文字'],
 ]){
  const result=spawnSync(process.execPath,[script,...args],{encoding:'utf8',env:offline});
  assert.notEqual(result.status,0);assert.equal(result.stdout,'');
 }
});
