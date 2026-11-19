---
name: storieslab-connect-rate
description: Owner targets ~99% Meta connect rate on the sales page; the Meta PageView must fire before anything else loads
metadata:
  node_type: memory
  type: project
  originSessionId: b1f6af71-1c20-44f9-842c-c8e63bdc38ee
  modified: 2026-11-16T09:23:56.444Z
---

On 2026-11-16 the owner set the goal "conect rate de 99%" (Meta landing page views / link clicks) for storieslab.app while paid traffic runs.

The Meta pixel comes through Utmify as a chain: Utmify pixel.js, then an ipify IP lookup (up to 5 s timeout), then the Utmify API, then fbevents.js and its ~157 KB config, then the PageView. On throttled 4G the old page fired the PageView at ~12 s. After the 16/11 changes it fires at ~5 s.

The fix lives in vendas/site/index.html <head>:
- preconnects to the Utmify, ipify and Meta hosts
- preloads of fbevents.js and the Utmify pixel.js
- a `slAfterPixel(fn)` gate that holds GA, Clarity, the hero reel, the story wall, the bonus covers, the mosaic and the Experimente tray until the pixel config arrives (max 6 s)

**Why:** visitors who leave before the PageView are lost as landing page views, which lowers the connect rate. The owner ranks the connect rate above the Lighthouse score.

**How to apply:** never add early-loading weight (images, videos, third-party scripts) above or around the hero without routing it through `slAfterPixel`. Never add a second direct Meta pixel, because Utmify already fires it and a second one would duplicate PageView. Measure with Lighthouse `--throttling-method=devtools` and read the time of the `facebook.com/tr ... ev=PageView` request. Related: [[storieslab-hosting-migration]], [[storieslab-sales-page-brief]].
