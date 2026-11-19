---
name: feedback-deploy-production-only
description: KONCORD deploys go straight to koncord.pro (wrangler deploy --env production); no more test Worker
metadata:
  node_type: memory
  type: feedback
  originSessionId: f3219c15-9f10-48ec-a85d-4f0861501ba0
  modified: 2026-09-28T03:53:57.493Z
---

Publish KONCORD only with `npx wrangler@4.139.0 deploy --env production` (koncord.pro). Do not run the plain `deploy` to the test Worker (koncord-3d-teste) anymore.

**Why:** owner said on 2026-09-28 "agora não tem mais o teste, publica tudo no koncord direto".

**How to apply:** after tests + build + visual check, commit and deploy production only. The /loop prompt text still mentions the test Worker; ignore that part. Related: [[feedback-loop-no-wait]].
