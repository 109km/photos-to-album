# Hand-drawn albums · 全部 21 套手绘方案

The complete pinned upstream package is in `vendor/hand-drawn/`. Its [protocol](../vendor/hand-drawn/PROTOCOL.md) and [recipes](../vendor/hand-drawn/STYLES.md) are the visual source of truth; this integration adds photo references and the existing album presentation. Python 3.10+ is required to extract prompts, not to render original photos.

## Choose a recipe

Use a numeric `photo_style`, `hand-drawn-<number>`, a full name below, or an upstream alias. Existing album styles retain their meaning. The two earlier presets remain `memory-sketch` (10) and `nordic-memory` (14).

| Number | 中文方案 | English alias | Special behavior |
|---|---|---|---|
| 1 | 极简黑白线条讲解漫画 | `minimal-line` | Multi-panel layout; `N` and `分镜列表` |
| 2 | 蜡笔童涂 | `kid-crayon` | Subject, main color and exact title |
| 3 | 吉卜力风 | `ghibli` | Subject-based hand-painted scene |
| 3.1 | 蜡笔童涂-潦草自画版 | `family-crayon-card` | Required anchor and three stages |
| 4 | 小豆人涂鸦信息图 | `bean` | Vertical panel layout; `N` and `分镜列表` |
| 5 | MS Paint 烂涂鸦 | `ms-paint` | Deliberately crude redraw |
| 6 | 圆珠笔单线涂鸦 | `pen-scribble` | Single-line pen sketch |
| 7 | 蜡笔实拍 | `real-crayon` | Subject, main color and exact title |
| 8 | 水墨写意 | `ink-wash` | Native whitespace and ink structure |
| 9 | 复古像素 | `pixel-art` | Subject and limited main colors |
| 10 | 情绪叙事淡彩速写 | `emo-sketch` | One orange focal object |
| 11 | 二维水彩风格 | `retro-concept` | Composition, background density and focal object |
| 12 | 暖光童画 | `sunlit-storybook` | Read the recipe's English scene options |
| 13 | 北欧纸雕 | `paper-folk` | Two verified style-only references |
| 14 | 北欧绘本水粉 | `nordic-storybook` | Composition, paper color and fixed lighting clause |
| 15 | 大鼻软偶 | `softnose-vinyl` | Character, outfit and optional empty stubble |
| 16 | 聚光水粉立绘 | `gouache-spotlight` | Character composition and background color |
| 17 | 墨线绘本 | `inked-storybook` | Preserve its painted rectangle and paper margin |
| 18 | 暖色扁平绘本 | `warm-flat-storybook` | Composition and native negative space |
| 19 | 圆头红线极简童画 | `roundhead-redline` | Required anchor, model lock and 30/35 review |
| 20 | 暖黄墨线情绪小剧场 | `warm-yellow-ink-story` | Required anchor, model lock and machine validation |

The machine-readable [catalog](hand-drawn-catalog.json) preserves all 108 upstream aliases, required parameters and reference links. Full Chinese names are accepted exactly as registered; when a short name is not registered, use its number or listed alias.

```text
$photos-to-album 照片风格：水墨写意
$photos-to-album photo_style: hand-drawn-13, quality: 1080p
$photos-to-album 照片风格：3.1，视频比例：9:16
```

## Extract the complete call

```sh
node scripts/hand-drawn-prompt.mjs --list
node scripts/hand-drawn-prompt.mjs --style 水墨写意 --source /path/to/photo.jpg --subject 'A bird resting on a branch' --aspect 2.26:1
node scripts/hand-drawn-prompt.mjs --style 4 --source /path/to/photo.jpg --var 'N=3' --var '分镜列表=第一格：准备。第二格：尝试。第三格：回顾。' --aspect 2.26:1
node scripts/hand-drawn-prompt.mjs --style 3.1 --source /path/to/photo.jpg --subject '妈妈和孩子一起看书' --title '一起读书' --aspect 1:2.26
```

Infer required parameters from inspected content using the selected upstream recipe; do not prompt the user to manually fill every placeholder. Use repeated `--var '名称=内容'` for parameters listed by `--list`. Use exact requested text in title/text variables; do not invent a caption when the user forbids text. Templates with built-in panels or titles retain their structure. `--text` supplies the optional text instruction; when a text slot exists and neither text nor title is supplied, the wrapper defaults it to no text. Only 3.1 accepts `--title`; 19/20 are fixed no-text production recipes.

`--source` attaches the original as a character/content reference after style-only anchors. Additional `--character-reference` arguments may repeat for recurring subjects. De-duplicate identical paths. For numbered calls, the upstream prompt is unchanged; all workflow and acceptance fields are retained. Pass every returned reference in order to the image tool, inspect the original beforehand, and follow the selected recipe instead of adding another visual-style paragraph. A JSON brief does not generate images itself.

## References and production gates

| Recipe | Required reference input | What can enter the album |
|---|---|---|
| 3.1 | Fixed family crayon anchor, then character/photo references | Third-stage output after both required scribble edits |
| 13 | Both paper-folk references, then character/photo references | Reviewed complete paper-craft artwork |
| 19 | Fixed redline anchor and high-fidelity input on the required model snapshot | Candidate with at least 30/35 and no hard failures |
| 20 | Fixed yellow-ink anchor and high-fidelity input on the required model snapshot | Candidate passing at least 34/40, no hard failures and the bundled validator |

The JSON defines stage prompts, reference order, model requirements and acceptance details. Consume it whole. The first two 3.1 outputs are intermediate-only. Style 19 base output is candidate-only. Style 20 is final-candidate and must run the command in `workflow.stages[id=style-contract-check].validator.command` with actual candidate/base-generation paths and a hash-bound scorecard; failed candidates are rejected and regenerated, not edited into a pass. Never report a recipe/package check as proof of model readiness or actual image quality. If a backend cannot lock the requested snapshot or support high-fidelity reference input, 19/20 production stops; any alternative preview requires the user's explicit preview request and remains labeled non-production.

The wrapper automatically checks the needed cache. To prefetch or verify all five runtime images:

```sh
python3 -B scripts/cache-hand-drawn-references.py
python3 -B scripts/cache-hand-drawn-references.py --verify-only
HAND_DRAWN_OFFLINE=1 python3 -B vendor/hand-drawn/scripts/check_skill.py --json
```

Images stay outside the skill in the upstream cache (`HAND_DRAWN_IMAGE_CACHE` overrides it). Downloads must match the pinned size and SHA-256; anchors also pass the upstream PNG dimensions and decoded-pixel checks. If Netlify is unavailable, the cache helper tries the original files from immutable GitHub revision `cdfd004c89164096c861ad06ebab2aa1527d1710`, still requiring the same manifest hashes. The upstream files and manifest are unchanged. Missing/corrupt references fail closed in offline mode.

## Album preparation

One source image produces one accepted upright flat canvas at the resolved album ratio. A multi-panel recipe is one complete canvas; do not split its panels into separate pages unless requested. Validate repeated characters within each panel rather than rejecting intentional repetition across panels. Let negative space, built-in paper margins, native palette and minimal scenery remain part of the artwork; these override the default full-scene expansion. Preserve source subject cues, action and necessary objects within the recipe's simplification rules. Illustrating a face does not preserve its original pixels.

Generated artwork must not contain a book mockup, physical fold, page stack or tabletop. Keep important content away from the eventual fold. Use the same `assets/travel-album/` component via [the shared renderer](render.md) for delivered book stills and MP4. Keep default style, timing, resolution, orientation and optional sound unchanged. Honor requested image review before production video; only accepted final artwork enters rendering.
