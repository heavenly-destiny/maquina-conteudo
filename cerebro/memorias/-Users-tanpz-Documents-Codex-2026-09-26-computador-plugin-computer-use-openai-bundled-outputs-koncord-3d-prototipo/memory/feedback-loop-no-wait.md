---
name: feedback-loop-no-wait
description: KONCORD backlog /loop should run continuously — no 20-minute waits between items
metadata:
  node_type: memory
  type: feedback
  originSessionId: f3219c15-9f10-48ec-a85d-4f0861501ba0
  modified: 2026-09-28T00:27:53.358Z
---

When running the KONCORD backlog loop, go straight from one item to the next; if a wakeup is needed, use the minimum delay (60 s), never 20 minutes.

**Why:** the owner said "esse loop pode ser infinito, não precisa esperar 20 minutos".

**How to apply:** after shipping an item, pick the next one in the same turn; only schedule a wakeup at 60 s when the turn must end.
