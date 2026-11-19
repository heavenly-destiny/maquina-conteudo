---
name: skill-evolution-loop
description: The motion-reel-premium skill is a living skill — every lesson goes into it and it is re-uploaded to the claude.ai account
metadata:
  node_type: memory
  type: feedback
  originSessionId: 316620ff-5b28-4aa1-8d82-28058e82c7e6
  modified: 2026-11-16T08:54:05.603Z
---

The user said "SEMPRE VAMOS IR APRIMORANDO ELA" (we will always keep improving it) about the `motion-reel-premium` skill. Treat it as a living skill:
1. Whenever a video round teaches something (feedback from the user, a bug found, a better technique), write the rule into `~/.claude/skills/motion-reel-premium/` right away: the relevant section of SKILL.md or `emotional-direction.md`, and copy the improved project files into `examples/`.
2. Then re-upload it to the claude.ai account: claude.ai → Personalização → Skills → motion-reel-premium (skill id `skill_017HLzzy3Bb16xY1BHzrhzoJ`; v1 16/11/2026, v2 16/11/2026 with stories-ads.md + examples/sl-stories; v10 17/11/2026 with UGC v4–v8 rules + cost rule + examples/sl-ugc code). Use the skill page menu "…" > Substituir to upload a new version. Zip the folder (`zip -qr -X motion-reel-premium.zip motion-reel-premium -x "*/.DS_Store"`) and upload it as a new version. Tell the user which version is now live.

**Why:** the user wants every video to come out better than the last, and the skill must also be available on their other computer through the account.

**How to apply:**
- Memory files exist only on this Mac; the skill syncs to every computer on the account. Put any rule that must work everywhere in the skill, not only in memory.
- Several Chrome browsers can be connected. If so, use switch_browser and let the user pick.
- File names inside the zip must contain only letters, digits, `.`, `_`, `-` and `/`. Brackets like `Outfit[wght].ttf` make the upload fail with "Zip file contains path with invalid characters".
- Keep the history of what changed in each version in the skill's own sections ("Level 3", "Level 4" and so on).

Related: [[motion-reel-premium-style]], [[voice-emotion-arc]], [[sound-design-sync]].
