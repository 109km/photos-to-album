---
name: photos-to-album
description: Turn supplied photos into consistently styled travel artwork and a page-turning MP4 album, preserving people photographically, with configurable artwork ratio and video resolution.
---

# Photos to Album

Produce styled 4K photos presented as an open book with visible edges, then an MP4 album. Retain a separate flat artwork master internally for animation. Preserve source files and their order. Default style: `travel-album`. Read [the style contract](references/travel-album.md) before generating or rendering.

## First-use setup

Read [README.md](README.md) for installation. Before production, ensure Node.js 22+ is available and run `npm run setup` from this skill folder when dependencies are missing or the skill was updated. Setup installs pinned packages and verifies a synthetic MP4 and book stills. Use `npm run check` to diagnose an existing installation. Do not report installation success if the check fails. If Node.js or OS browser libraries are missing, explain the prerequisite; do not silently install system packages. The image-generation tool is a separate host capability; setup does not provide it. Use this skill folder as the default rendering runtime.

Before a batch, report local original-photo rendering, AI image-editing availability, and person-preservation capability separately as ready, unavailable or not yet verified, with evidence. Mark unused capabilities not needed for origin or people-free inputs. Setup success establishes rendering only. For AI photos with people, validate the protection/compositing workflow on the first image before processing the rest; tool availability alone does not establish preservation. Explain missing required capabilities before generation without silently switching modes.

## Photo order

An explicit user sequence takes priority. Otherwise preserve attachment order; if it is unclear, show the proposed filename sequence before starting. For folder inputs or requested filename order, use natural filename order (2 before 10); only include image files directly in the folder unless subfolders were requested. Record the resolved sequence in the job's images array; the renderer does not sort it. Numbered filenames such as 01-beach.jpg and 02-mountain.jpg are recommended, not required.

## Settings

| Setting | Default | Overrides |
|---|---|---|
| `photo_style` | Fine ink outlines and translucent watercolor scenery | User-described artistic treatment of non-human scenery only; `origin` uses unchanged source photos |
| Artwork/album ratio | 1:2.26 for portrait video; 2.26:1 otherwise | Any positive explicit user ratio takes priority |
| Book still resolution | 3840 pixels on the long edge | Fixed in the bundled renderer; disclose this if higher output is requested |
| Video ratio | 16:9 | Independent of artwork ratio |
| Video quality | 4k | 720p, 1080p, 4k |
| `duration` | 2 seconds | Positive seconds per photo, e.g. `2s`; excludes the 1-second turn |
| Video format | H.264 MP4, opaque, silent | Follow explicit user choices |

For custom video ratios, quality means a short edge of 720/1080/2160, with the other edge calculated from the ratio and both rounded to even pixels. Standard landscape outputs are 1280×720, 1920×1080, 3840×2160. Resolve video orientation before image preparation: portrait video (width < height, including 9:16) defaults to a 1:2.26 vertical album with top/bottom pages, a horizontal fold and bottom-to-top turns. Landscape/square video defaults to 2.26:1 and right-to-left turns. An explicit artwork ratio overrides the shape, not the orientation-driven turn direction. Generate/prepare upright artwork at the resolved ratio; never rotate people sideways or distort old artwork to fit. Preserve this orientation in book stills too.

`photo_style: origin` selects the [original-photo workflow](references/origin.md). Read it instead of applying generation, retouching, or enhancement steps 2–4 below. This mode preserves the whole photo, not only people; its fit-without-cropping rule overrides the generated-artwork full-bleed requirement. All book, animation, duration, video ratio and quality settings remain in effect.

For other values, `photo_style` is a generation-prompt parameter, independent of the album/video style. Apply it consistently across the batch. When omitted or empty, retain the existing ink-and-watercolor treatment. An override changes only the scenery's artistic medium and rendering technique; preserve the warm ivory paper, source-based colors, people, scene content, book edges, fold, shadows, animation, timing, ratios and quality settings. Record the resolved value with the image prompts. It does not require a new renderer or style template.

Example: `photo_style: colored-pencil illustration` changes only the non-human scenery treatment.

## Built-in photo styles

| Style | Chinese aliases | Contract | Character |
|---|---|---|---|
| `travel-album` | — | [travel-album.md](references/travel-album.md) | Default ink-and-watercolor scenery treatment |
| `postcard-drawing` | 明信片手绘、手绘明信片 | [postcard-drawing.md](references/postcard-drawing.md) | Bright travel illustration in gouache and marker with integrated English lettering |

For `photo_style: postcard-drawing`, read its contract before preparing images. This style intentionally illustrates the whole scene, including the principal people, and removes incidental crowds. Its whole-scene illustration rules override the photographic-person preservation and scenery-only rules elsewhere in this skill. Keep principal subjects recognizable and verify poses, clothing, anatomy and relationships. Do not require source-person compositing for this style. Preserve the existing shared book renderer, ratios, timing and output workflow.

## Chinese parameters

Accept English, Chinese or mixed-language requests, including Chinese punctuation. Map `照片风格`/`图片风格` → `photo_style`, `停留时间`/`每张时长` → `duration`, `视频画质`/`画质` → `quality`, `视频比例` → `video_ratio`, and `相册比例`/`图片比例` → `image_ratio`. Map `原图`/`原始照片`/`不改照片` to `origin`; preserve custom Chinese style descriptions such as `水彩` or `大师级摄影` as artistic instructions. Map `高清` to `720p`, `全高清` to `1080p`, and `超高清` to `4k`. Accept decimal seconds such as `1.5秒` and ratios such as `16：9` or `16比9`. Interpret natural-language numbers in user prompts before writing numeric JSON. Do not silently resolve contradictory aliases; clarify the conflict. See [README_CN.md](README_CN.md) for examples.

The renderer normalizes documented English/Chinese JSON aliases through scripts/options.mjs. Generation remains an upstream agent step; a `照片风格` JSON field does not generate images.

## Workflow

1. Recommend JPEG/PNG copies and a first batch of 3–5 photos; HEIC/HEIF decoding is environment-dependent and RAW requires export from a photo editor. Check readability before a batch. Honor the requested save folder; otherwise create a new job folder under the current workspace’s `outputs/` and report its absolute path before starting. Inspect every uploaded source; request missing photos rather than substituting old assets. Resolve settings from the user's request and defaults. Retain an original-to-output mapping in the job folder.
2. Generate one flat styled image per source using the image editing tool and the selected style. Extend only scenery to reach the requested ratio, filling the canvas without padding or blank bands. For landscape photos in a portrait video, expand the scene above and below before rendering, just as portrait photos are expanded sideways for a landscape album. Preserve the entire human, including hair, face, skin, pose, hands, clothes, and accessories. Do not stylize, beautify, reconstruct, replace, or crop any human part.
3. Human preservation is an acceptance gate, not just a prompt. Use a protected mask covering the full person; retain/composite the original human pixels under only uniform scale and translation. With a tool that cannot lock pixels, its edited human is not authoritative: composite the source person back using a reviewed mask. For small or thin-limbed subjects, segment a padded person crop at high resolution and map its mask back to the source. Inspect a source/mask overlay and a magnified source/composite comparison for every person: hair, both arms and hands, legs, clothing and accessories. Repair omitted regions manually; dilation alone cannot recover a missing limb. Keep protected interiors opaque and feather only outside the person. Verify mask coverage separately from RGB equality: equality inside an incomplete mask does not prove full-person preservation. Do not claim pixel identity from visual similarity. If reliable masking/compositing is unavailable, report the limitation and do not silently accept a changed person. The user's request authorizes this source-preserving compositing; use an appropriate image workflow.
4. Prepare artwork with a 3840-pixel long edge and the resolved ratio (default approximately 3840×1699 landscape or 1699×3840 portrait). Prefer native high-resolution generation; otherwise upscale scenery conservatively and composite the person from the original high-resolution photo at final size. Avoid generative face enhancement. Verify actual dimensions; label upscaled output honestly rather than claiming recovered detail. Do not upscale a completed person with a generative enhancer.
5. Export the delivered book-framed still from the exact same shared book component used by the video renderer, following the style reference: visible rounded ivory edges, fine page layers, center fold, and soft shadows. Preserve the artwork and complete person; do not reinterpret them during framing. Both the delivered still canvas and internal flat master use the resolved image ratio and 4K long edge. The scene fills the pages; the narrow physical book edge and surrounding warm surface are intentional presentation, not blank image padding. Inspect all final stills against their originals for human preservation, scene recognition, consistent book geometry, and ratio. If the user requests image review, deliver the book stills and stop before rendering the production video; wait for explicit approval, then reuse the approved artwork. Export review stills using Remotion renderStill with the shared component (the bundled CLI currently renders both stills and video). Do not run the full CLI merely to obtain review stills. Without a review request, proceed to video.
6. Book appearance must not be implemented twice. Flat masters are internal textures; both delivered stills and resting video spreads must show the same rounded rim, paper layers, recessed fold, contact shadow and diffuse shadow. Never substitute a simpler video frame for the approved still design. Only canvas framing and output resolution differ. Use [the render instructions](references/render.md) and the selected style's bundled renderer. Map flat artwork into a single shared book; never animate a photograph containing book borders, a baked crease, or tabletop. Keep people fixed in the texture; only the page geometry and lighting animate.
7. Render and inspect the MP4 at each mid-turn, landing, and final hold. Check rounded outer corners on both faces, no duplicate rim, missing wedges, mirrored texture, person cropping, or landing shift. Verify codec, dimensions, duration and playback. Use ffprobe/ffmpeg when available; otherwise use the installed Remotion `getVideoMetadata` API and inspect playback in a browser. Do not require a separate FFmpeg installation just to render. Return the book-framed styled images and playable MP4 with absolute file links and the job folder location; retain flat masters in the job folder with a brief account of what was verified.

## Adding a style

Add `references/<style-id>.md` with image direction, material/animation behavior, defaults, and its renderer entrypoint. Add an `assets/<style-id>/` template only when it needs different rendering. Select the requested style explicitly; keep `travel-album` as the omitted-style default. Shared settings and human preservation remain here. No plugin registry or dispatch framework is needed; the renderer accepts the chosen template path.

Example: `$photos-to-album` with attached photos, `quality: 4k`, `video_ratio: 9:16`, `image_ratio: 2.26:1`.
