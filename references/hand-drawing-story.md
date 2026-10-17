# Hand-drawing Story

Use `photo_style: hand-drawing-story` for a playful editorial poster that keeps the source's real visual anchor and rereads it with black-line doodle people.

## Flat-master prompt contract

Use this prompt for every source image in the batch:

> 首先理解了原图的真正**视觉核心和意义**：判断图像中最重要的不是“存在什么”，而是“最值得记住的东西”——它可以是一个主题、一个动作、一组关系、一个对比、一个情感时刻，或某种象征性的氛围。从中提取最具辨识度的**主题、轮廓、姿势、空间关系和叙事线索**，重构成一幅充满趣味的编辑海报，主题是“真实主题+黑线涂鸦小人物”。不要机械地裁剪原作中最大的物体，而是保留最能代表照片精神和故事的视觉锚点，这样下半部分既能一眼清晰呼应原作，又像是巧妙的二次阅读。保留真实主体的材质和身份特征，你可以适度优化角度、比例、光线和颜色，使核心特征更清晰；舍弃与原意无关的信息，但必须保留支持主题的关键关系。在主体周围，添加几个极简的黑线涂鸦小人物，他们的动作、姿势和互动完全由原作的形式、语境和潜在意义自然生成——让他们感觉自己是在回应、放大或颠覆照片的原始故事，而不仅仅是随意摆姿势。色彩调色板从上方照片中最独特、最鲜艳的色调中提取，你可以适度净化、提亮并重新整理。背景主要是米白色、浅色调，或是原作中最舒服的浅色调，保留大量白色空间；真实的主体带有主要色彩，小人物和文字以黑色或深灰色细线对比，整体干净、明亮、克制。文本同样自然地从原文的**核心意义、情感和视觉关系**发展而来，无需直接说明物品名称或使用固定文体。将照片中最令人印象深刻的层次转化为超短、轻松、巧妙的文字，并带有一点幽默或文字游戏，比如小人物留下的一张纸条、一个转瞬即逝的念头，或是画外的旁白。文字可以自由地沿着主体轮廓、人物动作或空白节奏排列，配合小人物和主体来完成叙事，而不是像附加的标题那样简单贴上去。
>
> 不要修改人物脸部。

## Rendering invariants

- Output one flat, full-bleed canvas at the resolved album ratio; extend scenery only to fill the canvas.
- Keep the real subject's material, identity, recognizable pose, clothing, accessories and key relationships intact.
- Do not add book geometry, page frame, fold, rim, tabletop, border, watermark or unrelated extra objects.
- The shared travel-album book renderer remains unchanged; this contract changes only the flat artwork prompt.
