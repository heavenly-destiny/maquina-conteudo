---
name: gotcha-threejs-bone-names
description: three.js GLTFLoader strips dots from node names — Quaternius bones are "FootL"/"UpperArmR", not "Foot.L"
metadata:
  type: project
---

GLTFLoader sanitizes node names (PropertyBinding.sanitizeNodeName): "Foot.L" becomes "FootL", "UpperArm.R" becomes "UpperArmR", and animation track names follow ("UpperArmR.quaternion").

**Why:** on 2026-09-29 every bone lookup in src/leve/people.js used the dotted names from the .glb JSON, so the stride measurement, footstep detection (ambient-audio.js), procedural poses and the gun hand all silently found nothing. The owner saw it as "animação travada, som de passos bugado".

**How to apply:** when a pose, a clip filter or a sound hook "does nothing", check names with `getObjectByName` in the running page, not the file. Measured values then: Quaternius walk 1.2 m/s, run 2.4 m/s natural; game speeds walk 1.9, run 4.4. Related: [[decision-web-stylized-light]].

Second trap, same day: `gltf-transform optimize` resamples animations by default and left 6–31 keys per channel on the Quaternius clips — the people moved in straight segments and the owner said "parece que o boneco está a 5 fps". Pack animated characters with `gltf-transform meshopt` (or `optimize --resample false --simplify false`); static props can keep `optimize`.
