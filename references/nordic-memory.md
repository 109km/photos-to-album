# Nordic Memory · 北欧人物纪念册

Use `photo_style: nordic-memory` for a Scandinavian character album with matte gouache, fine paper grain and a restrained blue/yellow palette. The visual recipe is upstream hand-drawn style 14, combined with our shared book presentation and page turns.

## Prepare the artwork

Inspect the source and describe its people or animals, hair, accessories, pose and essential objects in English. Avoid adding a second set of medium, palette or facial rules. Use the bundled renderer:

```sh
node scripts/hand-drawn-prompt.mjs --style nordic-memory --source /path/to/photo.jpg --subject 'One source-based character with their hair, accessories and action' --aspect 2.26:1
```

Pass `prompt` unchanged and attach `source_reference.path` to the image editing tool. The JSON does not generate an image itself. Python 3.10+ is needed; no Python packages are required. The bundled [upstream protocol](../vendor/hand-drawn/PROTOCOL.md) and recipe remain the visual source of truth.

The whole canvas has light paper texture and deliberate negative space. This mode overrides full-scene expansion: it is a character interpretation, not a reconstruction of a detailed landscape. Clothing and scenery colors are reassigned to the recipe's palette. Retain recognizable subject cues and required objects while simplifying background detail. Fit the flat canvas proportionally to the resolved ratio without cropping or stretching. Keep the character away from the central fold; portrait layouts remain upright with top/bottom pages.

Generate without text, book edges, a crease or tabletop. If a caption is requested, add the approved literal text in whitespace after image review.

## Review and render

Check subject count, pose, hair, accessories and necessary objects; airy paper grain across the entire image; denim blue, mustard yellow and cream palette; small expressive eyes and elongated proportions; flat matte shading. Faces are illustrated and are not pixel-preserved. Reject glossy shading, thick outlines, dense scenery, extra saturated colors and generic round cartoon faces.

Reuse `assets/travel-album/` through [render.mjs](render.md) for both book stills and MP4. Shared timing, ratios, quality and optional sound are unchanged. Record native dimensions and any resizing. Honor image-review requests before production video; a requested implementation demo may include a short validation video. Validate actual images independently of the recipe/package checks.
