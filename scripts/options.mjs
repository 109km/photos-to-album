// Public prompt/JSON aliases. Photo styling remains an upstream agent task.
const text = value => String(value).trim();
const ratios = value => text(value).replaceAll('：', ':').replaceAll('比', ':');
const seconds = value => Number(text(value).replace(/(?:秒|s)$/i, '').trim());
const quality = value => ({'高清':'720p','全高清':'1080p','超高清':'4k'}[text(value)] ?? text(value).toLowerCase());
const style = value => {
  const normalized = text(value).toLowerCase();
  if (['原图','原始照片','不改照片','origin'].includes(normalized)) return 'origin';
  if (['postcard-drawing','明信片手绘','手绘明信片'].includes(normalized)) return 'postcard-drawing';
  return text(value);
};
const fields = [
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
