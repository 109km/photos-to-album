# Postcard drawing

Use `photo_style: postcard-drawing` (明信片手绘／手绘明信片) for a light, bright, youthful independent travel-magazine illustration.

## Artwork direction

Extract 3–5 of the source photo's most recognizable subjects, silhouettes, poses and narrative relationships. Simplify selectively while retaining the scene's identity and emotional meaning. Preserve the principal people's recognizable poses, clothing and relationships; remove unrelated crowds, cluttered backgrounds, advertising signs and secondary objects. This selective removal of incidental people is intentional for this style.

Use fine, slightly irregular dark hand-drawn lines, opaque gouache, marker fills and a little paper grain. Keep edges clear and sharp, with no blurry brushwork, obvious oil-paint texture or large noisy areas. Leave generous breathing room within the illustrated scene.

Derive the palette from the source photo: one bright but soft dominant background color, 2–3 supporting colors and a small accent. Aim for cheerful, fresh color, approximately 10% less saturated than a vivid treatment. Avoid fluorescent or harsh colors, gray or washed-out results, excessive vintage grading and large areas of pure black.

Generate a scene-specific handwritten English title of 2–4 words and one short English sentence. Integrate both directly into the colored illustration; do not add a fixed white title bar. Keep all lettering fully visible, legible and away from the center fold and outer corners. No other text or watermark. Source signs may be omitted rather than reproduced as extra lettering.

## Flat-master prompt anchor

“Transform this supplied photo into a light, bright, youthful independent travel-magazine hand-drawn illustration. Extract 3–5 recognizable subjects, silhouettes, poses and narrative relationships. Use fine slightly irregular dark lines, opaque gouache, marker fills and subtle paper grain. Simplify incidental detail and remove unrelated crowds, clutter and advertising. Preserve the principal subjects and their relationships. Use a source-derived bright but soft background color, 2–3 supporting colors and a small accent, about 10% less saturated than a vivid palette. Avoid neon, washed-out color, excessive vintage grading and large black areas. Integrate a scene-specific 2–4-word handwritten English title and one brief English sentence into the colored scene, with complete readable lettering clear of the center fold and rounded corners. No fixed white title bar, extra text or watermark. Output one sharp, flat, full-bleed {image_ratio} artwork, with scenery extended as needed. No physical book, frame, baked crease or tabletop.”

## Book and video

Use the shared renderer at `assets/travel-album/index.tsx` unchanged for both book stills and video. The illustration is a flat page texture; the renderer supplies ivory edges, paper layers, center fold, shadows and page turns. Inherit the shared ratio, resolution and timing defaults from SKILL.md. This style changes the artwork, not the book-edge design.

Before rendering, inspect source recognizability, palette consistency, sharpness, the 2–4-word title, the single short sentence, complete lettering and safe placement around the fold and corners.
