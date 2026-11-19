---
name: photo-style-aspirational
description: "Photos in creatives must be ORGANIC phone photos pulled from Pinterest (POV, real iPhone snaps of an aspirational life); never AI, never polished stock"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-16T10:14:41.008Z
---

Every photo in creatives, ads and videos must look like **a real person took it on their iPhone**, in the Pinterest "that girl / soft luxury" style:
- POV coffee in bed with the hand in frame, legs on a yacht deck, an iced coffee in the car's cup holder, a golden retriever smiling at the phone, a gym mirror selfie, a luxury bedroom with the city at night, coffee in pink pajamas.
- Imperfect framing, phone lens, natural light, real mess (wrinkled sheets, a TV remote on the bed).

**Why (2026-11-16):** the user rejected the AI-generated photos ("muito artificial"), then rejected Unsplash photos too ("parecendo muito profissional, tem que ser mais orgânico"). They sent a Pinterest board as the reference. They explicitly authorized taking images from Pinterest ("pode pesquisar no Pinterest, não tem problema"), and they own the copyright risk for their paid ads. I mentioned the risk once; I don't raise it again.

**How to apply:**
- Search Pinterest in the user's logged-in Chrome (`br.pinterest.com/search/pins/?q=…`; the built-in browser hits a login wall). Read `div[data-grid-item] img` srcs and download originals from `i.pinimg.com/originals/<aa>/<bb>/<cc>/<hash>.jpg`, falling back to `/736x/`. English queries with "pov … aesthetic" work best. "… selfie girl" queries can return nothing, so use "academia aesthetic foto espelho" instead.
- Build a contact sheet per slot, pick the most organic one, center-crop it to 1080×1920 and keep the source hashes.
- White text stickers disappear on light photos (sheets, curtains). Swap in a dark top sticker (`bomdia-126`).
- AI generation is only a last resort, for an object that cannot be found.

Related: [[storieslab-sales-arguments]], [[motion-reel-premium-style]].
