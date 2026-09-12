# Render prepared images

[Back to README](../README.md)

This guide is for developers and agents. The CLI renders **prepared, flat canvases** into book stills and a video. It does not generate images, interpret `photo_style`, mask people or prepare arbitrary original photos.

## A minimal job

Run `npm run setup` in the skill folder first. Put two prepared images beside a `job.json` file:

```text
my-album/
  job.json
  first.png
  second.png
```

```json
{
  "images": ["first.png", "second.png"],
  "imageRatio": 2.26,
  "videoRatio": "16:9",
  "quality": "4k",
  "duration": "2s"
}
```

Both input images must have the specified artwork ratio, within 0.2%. Paths are relative to job.json; absolute paths also work. Array order is album order. Resolve videoRatio first: without imageRatio, portrait video uses 1:2.26 and other video uses 2.26:1. Inputs must already match that resolved ratio; this CLI does not expand or rotate photos.

From the skill folder, run:

```sh
node scripts/render.mjs /path/to/my-album/job.json /path/to/my-album/album.mp4
```

Replace `/path/to/my-album` with your folder. For a complete executable example with synthetic inputs, run `npm run demo`.

## Agent settings versus JSON settings

The agent translates user-friendly settings into a prepared job. These are not interchangeable command-line flags.

| User prompt | Renderer JSON | Meaning |
|---|---|---|
| `image_ratio` | `imageRatio` | Ratio of the prepared canvas/open book |
| `video_ratio` | `videoRatio` | Ratio of the video frame |
| `quality` | `quality` | `720p`, `1080p` or `4k` (default) |
| `duration` | `duration` | Positive hold seconds: number or string such as `2s` |
| `photo_style` | None | Applied upstream; not read by the renderer |
| Attached photos | `images` | Paths to prepared flat canvases, not book mockups |

Chinese JSON keys are also supported: `图片`/`照片` → images, `图片比例`/`相册比例` → imageRatio, `视频比例` → videoRatio, `视频画质`/`画质` → quality, `停留时间`/`每张时长` → duration, and `帧范围` → frameRange. English snake_case ratio keys are accepted too. `2秒`, `16：9`, `16比9`, and quality values `高清`/`全高清`/`超高清` normalize to their English equivalents. Contradictory aliases are rejected. JSON itself still requires standard quotes and punctuation:

```json
{"图片":["first.png","second.png"],"相册比例":"2.26:1","视频比例":"16：9","画质":"全高清","停留时间":"2秒"}
```

`照片风格`/`图片风格` normalize to photo_style but remain upstream-only metadata; the renderer does not apply that style.

Only documented JSON fields are supported. Unknown fields do not implement new behavior.

For `origin`, follow [origin.md](origin.md) to prepare proportionally fitted canvases. For AI styles, follow [SKILL.md](../SKILL.md) and [travel-album.md](travel-album.md). Do not pass book-edged PNGs back into the renderer: it adds its own book geometry.

## Outputs

```text
album.mp4                 H.264, silent, opaque background, 60 fps
album.mp4.stills/
  01-book.png             First supplied image, with book presentation
  02-book.png
album.mp4.json            Resolved settings and absolute input paths
```

Existing output or companion artifacts are refused. Choose a new filename rather than overwriting an earlier run. A failed render can leave partial output; inspect it before removing it. Temporary rendering workspaces are cleaned up.

Book stills always use a 3840-pixel long edge in the bundled renderer, independently of video quality. Their canvas follows imageRatio. At the default ratio this is 3840×1699 for landscape video or 1699×3840 for portrait video. Source quality limits actual detail. Higher-resolution still exports are not currently a CLI setting.

Keep output metadata private unless sanitized: it includes absolute source paths.

## Timing and dimensions

The hold defaults to 2 seconds and is rounded to a 60 fps frame. Turns take 1 second; opening and closing each take 2 seconds.

```text
total seconds = photo count × hold + (photo count − 1) + 4
```

Ten photos with a 2-second hold produce 33 seconds. One photo with the default hold produces 6 seconds and no turn.

Quality sets the video's short edge to 720, 1080 or 2160 pixels. The other edge follows videoRatio; both are rounded to even pixels. At 16:9, `4k` is 3840×2160. Portrait videos use bottom-to-top turns across a horizontal fold; landscape/square videos use right-to-left turns. Explicit imageRatio overrides the album shape but not turn direction. The album is centered within 80% of frame width/height at rest, preserving its own ratio. Unusual ratios need visual verification; the turn can extend beyond the frame.

## Validate without rendering

```sh
node scripts/render.mjs /path/to/job.json /path/to/album.mp4 --plan
```

This checks inputs, ratios and timing and prints the resolved plan. It does not launch the browser or verify export, destination collisions or visual correctness.

For a short render test, add `"frameRange": [185, 190]` to a job with enough frames. The range is inclusive and must lie inside the composition. Omit it for delivery. A range export is shorter than the complete timeline printed in the plan/metadata.

## Alternate renderers

```sh
node scripts/render.mjs /path/to/job.json /path/to/album.mp4 /path/to/runtime /path/to/template
```

The default runtime is the installed skill folder; the default template is `assets/travel-album`. A separate runtime must be writable and provide the pinned dependencies from package.json. Templates are trusted local code, not untrusted uploaded content.

The template directory contains an `index.tsx` exporting a registered Remotion composition named `Album`. It consumes:

- `images`: staged filenames resolved with Remotion's staticFile.
- `imageRatio`, `width`, `height`, `fps` and `durationInFrames`.
- `duration`: per-image hold in seconds.
- `verticalTurn`: resolved from videoRatio < 1; retain it for stills even when their canvas ratio differs from the video.
- `stillIndex`: when supplied, render that resting spread through the same book component.

Use calculateMetadata to honor video and still dimensions. Keep imagery fixed in its texture; animate page geometry and lighting. See [CONTRIBUTING.md](../CONTRIBUTING.md) for adding styles.
