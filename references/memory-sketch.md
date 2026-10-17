# Memory Sketch · 淡彩回忆册

Use `photo_style: memory-sketch` for a quiet memory album with loose indigo lines, one orange focal object and large areas of white paper. The visual recipe is upstream hand-drawn style 10, combined with our shared book presentation and page turns.

## Prepare the artwork

Inspect the source and describe its people, action, relationships and essential objects. Choose exactly one existing garment or object as the orange focus. Use the bundled prompt renderer instead of rewriting or mixing the recipe:

```sh
node scripts/hand-drawn-prompt.mjs --style memory-sketch --source /path/to/photo.jpg --subject 'A source-based description of the people, action and essential objects' --orange-focus 'the outdoor jacket' --aspect 2.26:1
```

Pass `prompt` unchanged and attach `source_reference.path` to the image editing tool. The JSON is a generation brief, not an automatic image-generation command. Python 3.10+ is needed to extract the pinned recipe; it uses only the standard library. Read [the bundled protocol](../vendor/hand-drawn/PROTOCOL.md) when extending the integration. The upstream package is pinned and retains its license; do not maintain another copy of its visual rules here.

The white paper is intentional artwork, not padding. This mode overrides the default requirement to expand scenery across every pixel: simplify backgrounds and keep roughly 60–70% quiet white space as the upstream recipe specifies. Fit the whole flat canvas proportionally to the resolved ratio without cropping subjects or stretching the artwork. Keep the important action away from the book fold. Portrait video retains upright people and the usual vertical page turn.

Generate without captions. If the user requests a short sentence, place the approved literal text in the available whitespace after image review, keeping it clear of the fold. Do not bake book edges, a crease or tabletop into the artwork.

## Review and render

Check the original subject count, pose and necessary objects; loose indigo contours; one orange focus; sparse coloring and generous whitespace. Recognizable appearance is expected, not original face pixels. Reject dense hatching, fully painted scenery, extra accent colors and malformed anatomy.

Reuse `assets/travel-album/` through [render.mjs](render.md) for both book stills and MP4. The default ratios, quality, duration and sound settings remain shared. Record the native generated dimensions and any resizing. Image review requests still stop before production video; a requested implementation demo may include a short validation video. Do not count recipe/package tests as visual acceptance.
