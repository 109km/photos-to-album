---
name: photos-to-album
description: Turn supplied photos into consistently styled travel artwork and a page-turning MP4 album, stylizing people and scenery together, with configurable artwork ratio and video resolution.
---

# Photos to Album

Produce styled 4K photos presented as an open book with visible edges, then an MP4 album. Retain a separate flat artwork master internally for animation. Preserve source files and their order. Default style: `travel-album`. Read [the selected style contract](#built-in-photo-styles) before generating or rendering.

## First-use setup

Read [README.md](README.md) for installation. Before production, ensure Node.js 22+ is available and run `npm run setup` from this skill folder when dependencies are missing or the skill was updated. Setup installs pinned packages and verifies a synthetic MP4 and book stills. Use `npm run check` to diagnose an existing installation. Do not report installation success if the check fails. If Node.js or OS browser libraries are missing, explain the prerequisite; do not silently install system packages. The image-generation tool is a separate host capability; setup does not provide it. Use this skill folder as the default rendering runtime.

Before a batch, report local original-photo rendering and AI image-editing availability separately as ready, unavailable or not yet verified, with evidence. Mark AI editing not needed for origin. Setup success establishes rendering only. People may be stylized along with scenery; person masks, pixel locking and source-person compositing are not required. Explain missing required capabilities before generation without silently switching modes.

## Photo order

An explicit user sequence takes priority. Otherwise preserve attachment order; if it is unclear, show the proposed filename sequence before starting. For folder inputs or requested filename order, use natural filename order (2 before 10); only include image files directly in the folder unless subfolders were requested. Record the resolved sequence in the job's images array; the renderer does not sort it. Numbered filenames such as 01-beach.jpg and 02-mountain.jpg are recommended, not required.

## Settings

| Setting | Default | Overrides |
|---|---|---|
| `photo_style` | `travel-album` | A built-in style below, `origin`, or a user-described artistic treatment |
| Artwork/album ratio | 1:2.26 for portrait video; 2.26:1 otherwise | Any positive explicit user ratio takes priority |
| Book still resolution | 3840 pixels on the long edge | Fixed in the bundled renderer; disclose this if higher output is requested |
| Video ratio | 16:9 | Independent of artwork ratio |
| Video quality | 4k | 720p, 1080p, 4k |
| `duration` | 2 seconds | Positive seconds per photo, e.g. `2s`; excludes the 1-second turn |
| Video format | H.264 MP4, opaque, silent by default | Follow explicit user choices |

For custom video ratios, quality means a short edge of 720/1080/2160, with the other edge calculated from the ratio and both rounded to even pixels. Standard landscape outputs are 1280×720, 1920×1080, 3840×2160. Resolve video orientation before image preparation: portrait video (width < height, including 9:16) defaults to a 1:2.26 vertical album with top/bottom pages, a horizontal fold and bottom-to-top turns. Landscape/square video defaults to 2.26:1 and right-to-left turns. An explicit artwork ratio overrides the shape, not the orientation-driven turn direction. Generate/prepare upright artwork at the resolved ratio; never rotate people sideways or distort old artwork to fit. Preserve this orientation in book stills too.

`photo_style: origin` selects the [original-photo workflow](references/origin.md). Read it instead of applying generation, retouching, or enhancement steps 2–4 below. This mode preserves the whole photo, not only people; its fit-without-cropping rule overrides the generated-artwork full-bleed requirement. All book, animation, duration, video ratio and quality settings remain in effect.

For other values, `photo_style` is a generation-prompt parameter, independent of the album/video style. Apply it consistently across the batch. When omitted or empty, use `travel-album`. A built-in style must use its linked contract below. A custom override changes the artistic medium and rendering technique for the whole scene, including all people; preserve recognizable subjects, scene content, book edges, fold, shadows, animation, timing, ratios and quality settings. Record the resolved value with the image prompts. It does not require a new renderer or style template.

## Built-in photo styles

| Style | Chinese aliases | Contract | Character |
|---|---|---|---|
| `travel-album` | 旅行相册、墨线水彩 | [travel-album.md](references/travel-album.md) | Fine ink and translucent watercolor on warm ivory paper |
| `watercolor` | 水彩 | [watercolor.md](references/watercolor.md) | Luminous transparent washes and soft pigment blooms |
| `pencil` | 彩色铅笔、铅笔 | [pencil.md](references/pencil.md) | Tactile colored-pencil marks and paper grain |
| `illustration` | 趣味插画、插画 | [illustration.md](references/illustration.md) | Clean, playful editorial illustration |
| `graffiti` | 街头涂鸦、涂鸦 | [graffiti.md](references/graffiti.md) | High-energy spray paint, collage and bold marks |
| `hand-drawing-story` | 手绘故事 | [hand-drawing-story.md](references/hand-drawing-story.md) | Minimal hand-drawn storytelling with deliberate empty space |
| `postcard-drawing` | 明信片手绘、手绘明信片 | [postcard-drawing.md](references/postcard-drawing.md) | Bright gouache and marker travel illustration with an integrated English title and sentence |

All built-in styles share the same physical book, MP4 timing and page-turn renderer. They change only the flat artwork supplied to that renderer. `origin` remains the unchanged-photo mode.

## Chinese parameters

Accept English, Chinese or mixed-language requests, including Chinese punctuation. Map `照片风格`/`图片风格` → `photo_style`, `停留时间`/`每张时长` → `duration`, `视频画质`/`画质` → `quality`, `视频比例` → `video_ratio`, and `相册比例`/`图片比例` → `image_ratio`. Map `原图`/`原始照片`/`不改照片` to `origin`, and the listed Chinese aliases to their built-in style IDs. Preserve any other custom Chinese style descriptions such as `大师级摄影` as artistic instructions. Map `高清` to `720p`, `全高清` to `1080p`, and `超高清` to `4k`. Accept decimal seconds such as `1.5秒` and ratios such as `16：9` or `16比9`. Interpret natural-language numbers in user prompts before writing numeric JSON. Do not silently resolve contradictory aliases; clarify the conflict. See [README_CN.md](README_CN.md) for examples.

The renderer normalizes documented English/Chinese JSON aliases through scripts/options.mjs. Generation remains an upstream agent step; a `照片风格` JSON field does not generate images.

## Workflow

1. Recommend JPEG/PNG copies and a first batch of 3–5 photos; HEIC/HEIF decoding is environment-dependent and RAW requires export from a photo editor. Check readability before a batch. Honor the requested save folder; otherwise create a new job folder under the current workspace’s `outputs/` and report its absolute path before starting. Inspect every uploaded source; request missing photos rather than substituting old assets. Resolve settings from the user's request and defaults. Retain an original-to-output mapping in the job folder.
2. Generate one flat styled image per source using the image editing tool and the selected style contract. Extend only scenery to reach the requested ratio, filling the canvas without padding or blank bands. For landscape photos in a portrait video, expand the scene above and below before rendering, just as portrait photos are expanded sideways for a landscape album. Apply the selected style to all people as well as scenery. Keep subjects recognizable, retain their poses, clothing and accessories, and avoid unintended cropping.
3. Inspect each styled image against its source for recognizable subjects, consistent style, intact anatomy, poses, clothing, accessories and scene content. People may be fully illustrated or otherwise stylized; no person mask, original-pixel preservation or source-person compositing is required. Correct unintended missing or extra people, malformed limbs and lost details before rendering.
4. Prepare artwork with a 3840-pixel long edge and the resolved ratio (default approximately 3840×1699 landscape or 1699×3840 portrait). Prefer native high-resolution generation; otherwise upscale the styled artwork conservatively. Verify actual dimensions; label upscaled output honestly rather than claiming recovered detail.
5. Export the delivered book-framed still from the exact same shared book component used by the video renderer, following the style reference: visible rounded ivory edges, fine page layers, center fold, and soft shadows. Preserve the artwork and complete person; do not reinterpret them during framing. Both the delivered still canvas and internal flat master use the resolved image ratio and 4K long edge. The scene fills the pages; the narrow physical book edge and surrounding warm surface are intentional presentation, not blank image padding. Inspect all final stills against their originals for subject recognizability, scene recognition, consistent book geometry, and ratio. If the user requests image review, deliver the book stills and stop before rendering the production video; wait for explicit approval, then reuse the approved artwork. Export review stills using Remotion renderStill with the shared component (the bundled CLI currently renders both stills and video). Do not run the full CLI merely to obtain review stills. Without a review request, proceed to video.
6. Book appearance must not be implemented twice. Flat masters are internal textures; both delivered stills and resting video spreads must show the same rounded rim, paper layers, recessed fold, contact shadow and diffuse shadow. Never substitute a simpler video frame for the approved still design. Only canvas framing and output resolution differ. Use [the render instructions](references/render.md) and the selected style's bundled renderer. Map flat artwork into a single shared book; never animate a photograph containing book borders, a baked crease, or tabletop. Keep people fixed in the texture; only the page geometry and lighting animate.
7. Render and inspect the MP4 at each mid-turn, landing, and final hold. Check rounded outer corners on both faces, no duplicate rim, missing wedges, mirrored texture, person cropping, or landing shift. Verify codec, dimensions, duration and playback. Use ffprobe/ffmpeg when available; otherwise use the installed Remotion `getVideoMetadata` API and inspect playback in a browser. Do not require a separate FFmpeg installation just to render. Return the book-framed styled images and playable MP4 with absolute file links and the job folder location; retain flat masters in the job folder with a brief account of what was verified.

## Adding a style

Add `references/<style-id>.md` with image direction, material/animation behavior, defaults, and its renderer entrypoint. Add an `assets/<style-id>/` template only when it needs different rendering. Add its English and Chinese aliases to `scripts/options.mjs`, SKILL.md, README.md and README_CN.md. Select the requested style explicitly; keep `travel-album` as the omitted-style default. Shared settings and subject-quality guidance remain here. No plugin registry or dispatch framework is needed; the renderer accepts the chosen template path.

Example: `$photos-to-album` with attached photos, `quality: 4k`, `video_ratio: 9:16`, `image_ratio: 2.26:1`.

## Optional page-flip sound

Default `pageFlipSound` is `false`. Map `page_flip_sound` or `翻页音效` to this boolean; accept true/false, yes/no, on/off, 开启/关闭. Carry the resolved setting into the renderer job. When enabled, the shared book component plays the bundled `assets/page-flip.wav` at each page-turn start: 2 + hold + index × (hold + 1) seconds. No sound is scheduled for stills or single-page albums. Preserve silent output when omitted. The sound is a CC0 recording of a real page turn; see assets/page-flip-source.md for provenance.
