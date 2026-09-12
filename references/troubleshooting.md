# Troubleshooting

[Back to README](../README.md)

Run commands from the skill folder. Start with `npm run check`; it verifies package versions, browser availability, a short video and two book stills. If it fails, keep the terminal error when asking for help.

| Symptom | Next step |
|---|---|
| `node` or `npm` is not found | Install [Node.js](https://nodejs.org/en/download), reopen the terminal, then run `node --version`. Version 22 or newer is required. |
| `package.json` cannot be found | Open a terminal in the folder containing this skill's `package.json`, then retry. |
| Codex cannot find the skill | Check that `SKILL.md` is directly inside your installed `photos-to-album` folder, rather than an extra nested archive folder. |
| Missing package or wrong version | Run `npm run setup`. It uses `npm ci` and the bundled lockfile. Do not manually mix Remotion versions. |
| Package/browser download stalls | Check internet access and your proxy. The first browser download is roughly 100 MB. Retry setup after connectivity is restored. |
| Permission denied | Use a skill folder writable by your user. Setup does not need global npm installation or sudo. |
| Linux cannot launch Chrome | Install the libraries for your distribution in [Remotion's Linux guide](https://www.remotion.dev/docs/miscellaneous/linux-dependencies), then retry. Setup does not install OS packages; not every Linux distribution is supported. |
| No image-editing tool | `origin` works without one. AI styles require a supported tool in the session; setup cannot provide account access. |
| Person changed in a styled image | Reject that result. Review the source mask and restore the original person before rendering. |
| Ivory space around a photo | Expected in `origin` when photo and album ratios differ. Filling that space requires cropping or generating content, which origin avoids. |
| “Image ratio differs from album ratio” | The CLI expects prepared canvases, not arbitrary original photos. See [the rendering guide](render.md). |
| “Output artifacts exist” | Choose a new output filename. A previous MP4, stills folder or metadata file is protected, including partial output from a failed run. |
| Render runs out of memory | Try 720p or fewer photos. Close other memory-heavy applications. |
| 4K still looks soft | Check the original/generated image size. Upscaling increases dimensions, not native detail. |

## What a passing check means

The installed packages can prepare a synthetic image, launch the browser, render a short MP4, read its metadata and export book stills. It does not certify image-generation access, mask quality, arbitrary aspect ratios or every operating system.

## What to include in a bug report

Include OS/architecture, `node --version`, the command, settings, expected result and complete error. Use synthetic or consented sample images. Remove credentials and personal file paths from logs before sharing. Do not attach your private photo collection by default.
