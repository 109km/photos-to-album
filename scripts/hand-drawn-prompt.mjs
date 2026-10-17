import {parseArgs} from 'node:util';
import {execFileSync} from 'node:child_process';
import {accessSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeOptions} from './options.mjs';
import catalog from '../references/hand-drawn-catalog.json' with {type:'json'};

const {values} = parseArgs({options: {
  ...Object.fromEntries(['style','subject','aspect','source','orange-focus','text','title'].map(key => [key, {type:'string'}])),
  var:{type:'string',multiple:true}, 'character-reference':{type:'string',multiple:true}, list:{type:'boolean'},
}});
if (values.list) {
  console.log(JSON.stringify(catalog,null,2));
} else {
  const style = normalizeOptions({photo_style:values.style ?? ''}).photo_style;
  const preset = style === 'memory-sketch' || style === 'nordic-memory';
  const entry = catalog.find(item => item.photo_style === style || item.style_id === ({'memory-sketch':'10','nordic-memory':'14'}[style]));
  if (!entry) throw new Error('Choose a hand-drawn style from --list, memory-sketch or nordic-memory');
  if (entry.parameters.includes('主体') && !values.subject?.trim() && !(values.var ?? []).some(item => item.startsWith('主体=') && item.slice(3).trim())) throw new Error('--subject must describe the source subjects, action and essential objects');
  const aspect = values.aspect ?? '2.26:1';
  const parts = aspect.split(':').map(Number);
  if (parts.length !== 2 || parts.some(number => !Number.isFinite(number) || number <= 0)) throw new Error('--aspect must be a positive W:H ratio');
  if (style === 'memory-sketch' && !values['orange-focus']?.trim()) throw new Error('--orange-focus must name one source garment or object');
  const source = values.source ? path.resolve(values.source) : null;
  if (source) accessSync(source);
  const references = [...new Set([...(values['character-reference'] ?? []).map(file => path.resolve(file)), ...(source ? [source] : [])])];
  const provider = fileURLToPath(new URL('../vendor/hand-drawn/scripts/render_prompt.py',import.meta.url));
  const args = ['-B',provider,'--style',entry.style_id,'--aspect',aspect,'--format','json'];
  if (values.subject !== undefined) args.push('--subject',values.subject);
  if (values.text !== undefined) args.push('--text',values.text);
  else if (!values.title && entry.parameters.includes('文字') && !(values.var ?? []).some(item => item.startsWith('文字='))) args.push('--text','不加任何文字');
  if (values.title !== undefined) args.push('--title',values.title);
  if (values['orange-focus']) {
    if (entry.style_id !== '10') throw new Error('--orange-focus is only valid for style 10 / memory-sketch');
    args.push('--var',`橙色关键物=${values['orange-focus']}`);
  }
  if (style === 'nordic-memory') args.push('--var',`构图=${parts[0] >= parts[1] ? 'standing full-body, placed to the right of center' : 'standing full-body, centered in the upper half'}`,'--var','纸底色=warm off-white (≈#F8F7F2)','--var','光影=One single soft pale-blue oval shadow under the feet, no other shading or shadows anywhere.');
  for (const item of values.var ?? []) args.push('--var',item);
  for (const file of references) args.push('--character-reference',file);
  if (entry.references.length) execFileSync('python3',['-B',fileURLToPath(new URL('./cache-hand-drawn-references.py',import.meta.url)),'--style',entry.style_id],{stdio:['ignore','pipe','inherit']});
  const call = JSON.parse(execFileSync('python3',args,{encoding:'utf8'}));
  const contentInstruction = preset && source ? '\n\nThe attached photograph is the content reference. Keep its subject count, recognizable hair and accessories, pose, action and essential objects. Render the whole image in the recipe above; the source does not prescribe the medium or palette. Simplify scenery as the recipe requires. Deliver an upright flat artwork canvas at the requested ratio, without a book mockup, page fold, tabletop or watermark. Any caption is added separately after image review.' : '';
  console.log(JSON.stringify({...call,photo_style:style,prompt:call.prompt + contentInstruction,source_reference:source ? {path:source,role:'content-reference'} : null},null,2));
}
