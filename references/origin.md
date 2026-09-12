# Origin photo style

Select with `photo_style: origin` (case-insensitive), or `照片风格: 原图`. `原始照片` and `不改照片` are also aliases for origin. Use the supplied original photos in their supplied order. This is a photo treatment, not a new video animation style.

- Skip image generation, outpainting, background replacement, masks, retouching, color grading, sharpening and generative upscaling. Preserve the complete original composition, people and scenery. Never substitute previous styled outputs.
- Keep source files untouched. Honor EXIF orientation and use only uniform resampling for presentation; do not crop or stretch. Do not claim resized pixels are byte-identical to source pixels.
- Prepare internal canvases at the resolved artwork ratio and long-edge resolution (default 1:2.26 for portrait video, 2.26:1 otherwise, with a 3840-pixel long edge). Center each whole photo using contain fitting on warm ivory `#fbf5e8`, inside a safe inset of 2% of the canvas short edge on all sides so the rounded book corners cannot clip photo pixels. Space around mismatched ratios is intentional in this mode; never fill it with generated, blurred, mirrored or repeated imagery. A user's explicit alternative fit or ratio takes precedence.
- Use a deterministic image library such as the renderer runtime's Sharp: auto-orient, resize with `fit: 'contain'` and the ivory background, then save a separate PNG canvas. This is presentation sizing, not image enhancement. Record original dimensions and placement, and describe any upsampling honestly.
- Pass those prepared canvases to the existing renderer following [render.md](render.md). Export the matching book stills and MP4 through the shared book component. Book edges, fold shading and shadows remain presentation overlays; they do not modify the source files.
- Verify every original appears once in supplied order, all photo edges remain visible inside the book, proportions are intact, and no generated artwork was used.

Example: `$photos-to-album photo_style: origin, duration: 2s, quality: 4k` with attached photos.
