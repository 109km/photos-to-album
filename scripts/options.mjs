// Public prompt/JSON aliases. Photo styling remains an upstream agent task.
const text = value => String(value).trim();
const ratios = value => text(value).replaceAll('：', ':').replaceAll('比', ':');
const seconds = value => Number(text(value).replace(/(?:秒|s)$/i, '').trim());
const quality = value => ({'高清':'720p','全高清':'1080p','超高清':'4k'}[text(value)] ?? text(value).toLowerCase());
const style = value => {
  const normalized = text(value).toLowerCase();
  const builtIns = {
    '原图':'origin','原始照片':'origin','不改照片':'origin','origin':'origin',
    'travel-album':'travel-album','旅行相册':'travel-album','墨线水彩':'travel-album',
    'watercolor':'watercolor','水彩':'watercolor',
    'pencil':'pencil','彩色铅笔':'pencil','铅笔':'pencil',
    'illustration':'illustration','趣味插画':'illustration','插画':'illustration',
    'graffiti':'graffiti','街头涂鸦':'graffiti','涂鸦':'graffiti',
    'hand-drawing-story':'hand-drawing-story','手绘故事':'hand-drawing-story',
    'postcard-drawing':'postcard-drawing','明信片手绘':'postcard-drawing','手绘明信片':'postcard-drawing',
  };
  return builtIns[normalized] ?? text(value);
};
const sound = value => {
  if (typeof value === 'boolean') return value;
  const v = text(value).toLowerCase();
  if (['true','yes','on','是','开启','有'].includes(v)) return true;
  if (['false','no','off','否','关闭','无'].includes(v)) return false;
  throw new Error('pageFlipSound must be true or false / 翻页音效必须为开启或关闭');
};
const fields = [
  ['pageFlipSound', ['page_flip_sound','翻页音效'], sound],
  ['images', ['图片','照片'], value => value],
  ['imageRatio', ['image_ratio','图片比例','相册比例'], ratios],
  ['videoRatio', ['video_ratio','视频比例'], ratios],
  ['quality', ['视频画质','画质'], quality],
  ['duration', ['停留时间','每张时长'], seconds],
  ['photo_style', ['照片风格','图片风格'], style],
  ['frameRange', ['帧范围'], value => value],
];
export const normalizeOptions = input => {
  const output = {...input};
  for (const [key, aliases, normalize] of fields) {
    const present = [key,...aliases].filter(name => Object.hasOwn(input,name));
    if (!present.length) continue;
    const values = present.map(name => normalize(input[name]));
    if (values.some(value => JSON.stringify(value) !== JSON.stringify(values[0]))) {
      throw new Error(`Conflicting settings / 参数冲突: ${present.join(', ')}`);
    }
    output[key] = values[0];
    for (const alias of aliases) delete output[alias];
  }
  return output;
};
