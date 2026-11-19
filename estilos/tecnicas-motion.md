# Motion techniques from the references (use in any category)
| Technique | Reference | HyperFrames recipe |
|---|---|---|
| Word-by-word kinetic text with horizontal blur | Dbc1KrKh2wV, DQsGV1FjhX3, Da0DayIpsie | per word: filter blur(14px) to 0, x 40 to 0, 250 ms expo.out, stagger 0.07; keyword in a different color or font |
| Speech turning into a diagram (pills, hexagons, circle that grows) | Da0DayIpsie | each concept is a pill that stacks; a circle scales 0 to 30 and swallows the scene |
| 3D camera dive into the phone | DdO63LGPBsn, DfEfhA5xW71 | perspective 1400px, phone scale 1 to 6 plus blur at the peak, 450 ms power2.in, cut at the peak |
| UI with an animated cursor clicking | DWeq9OwE3MM, Daa43CqoE_o | SVG cursor follows a bezier path, click = scale 0.9 plus ripple, button glow |
| Morph between elements (logo to pill to avatar) | Daa43CqoE_o | FLIP: measure both rects, animate width/height/radius/x/y in 500 ms power3.inOut |
| Glass cards with a recreated UI | Dfs0iS_jYnL, Df2yze7NUmc, DfEfhA5xW71 | backdrop-filter blur(20px), 1px border, colored glow, counter with gsap snap |
| Giant keyword behind the person | DcW33C-zyaN, Dfg1iJ_s75u | layers: background, word, speaker cutout (rembg/mask) on top |
| Ball of light as cursor and transition | DaIq2aZTlln | glow circle travels across the text lighting each word, then becomes a horizontal wipe |
| Pixel blocks and halftone dissolve | Dfg1iJ_s75u | grid of divs with random stagger opacity, 300 ms |
| Laptop showreel with 1 s pieces | DeKUZvGsiDk | inner frame inside a laptop mockup, a hard cut on the beat between pieces |

## Style families from @aslaniedits (full recipes in aslaniedits/ESTILOS.md)
| Style | Reference | HyperFrames recipe |
|---|---|---|
| glass-phone-presenter | Dfp71y-s_R-, De9DKKssi7a | seated speaker on a one-color studio, glass iPhone frame behind (2px border rgba(255,255,255,.18), blur 8px, radius 64px); 3-layer keyword: thin sans + italic script in the accent + extra-bold giant word (blur 20 to 0, y 30 to 0, 350 ms expo.out); frame morphs into an app icon (500 ms power3.inOut); whoosh per line, bloop per element, 150 ms of silence before the turn |
| pixel-type-tech | DfZivEts0Fz, DfWvqYMM7uA | Pixelify Sans/Silkscreen, one word every 0.25 to 0.35 s with a hard swap; ScrambleText decode in 600 ms; lime tag rotated -8deg with back.out(2); selector list stepping 300 ms; steps(6) block wipe; keyboard-click SFX per word over an almost silent bed |
| word-behind-person | DeC-xCeMrS6, Dew85IgsLQg | background / giant condensed word (Anton, 80% of the width, blur plus scale 1.2 to 1, 300 ms) / person cutout on top; a contrasting script word; print cards with ±6deg rotation |
| brand-cinematic-lightball | DaIq2aZTlln | black plus one yellow; a 40px glowing ball as cursor and wipe; 4 vertical blinds (stagger .08, power4.out) with vertical text; 1.5 s riser plus a boom on the logo reveal; 0.18 cuts/s |
| raw-vs-edited (format) | DeC-xCeMrS6 | white "Raw"/"Edited" pill at the top, the same take raw and then edited every 2.5 s with a hard cut; highpass on the Raw audio, full music on the Edited |
| showreel-mix (format) | Dew85IgsLQg, DfjpVDUM017 | 2-column split screen, 1 s clips offset by 0.5 s, editor badge in the middle |
| comment-reply-reveal (format) | Dd055P_Mv1P, DdjDl5ksSfD, Dcs61-6Mu81, DdM5y4KMuq4 | white Instagram comment card (objection + short answer) over the RAW take for 1.2 to 1.5 s, then an 80 ms white flash plus a 1 to 1.25 push into the EDITED take, alternating in a loop; whoosh on the flash, pop per card |
| glow-caption-pixel | Dcf4I_dzZHv, Dcs61-6Mu81 | chest caption: a script word in an outlined pill plus a black wide word with a 3-color analogous gradient (e.g. #EB8858 #EDBF1E #FFC000) and a double drop-shadow glow; enters through 10 pixel blocks in steps(3), 300 ms |
| ui-widget-motion | DbPEXWMTa5D, DcZCi4Pzqg4, DZ550QyTO8W | one continuous timeline: app icon to notification to terminal typing to rising chart to "Send", with a FLIP morph (500 ms power3.inOut) and a bezier SVG cursor; or a glass widget with a neon ribbon rotating behind it; 1 accent (lime #c9f84a) |
| noir-ink-kinetic | DLw_JtTzhz0, DKj2cIHT6m9 | B&W with paper texture plus one red/yellow accent; condensed caps title plus a script word rotated -6deg; ink-mask reveal; on narration, cut to a 1.5 to 2.5 s B&W insert exactly on the concept word |
| athlete-neon-intro | DcTsz-DTDL_, DaQyebBTsx- | person mask, background blur 12px and brightness .5, 2 neon SVG ribbons in a V behind the person (stroke-dashoffset 600 ms), name in wide italic below, one color per person; optional 4-copy echo trail |
| saas-explainer-minimal | DcigZUDzKhj | 1.5 to 2 s scenes on solid color, a light-beam triangle clip-path as the transition, 3D glass objects with motion blur, a giant number (+6M), orbiting cartoon avatars |
| mascot-logo-reveal | Dax55qVzyAv | SVG mascot with glowing eyes that blink (scaleY .1, 80 ms), look around and morph shape, while the name scrambles in; one blip per blink |
| particle-dark-promo / cinematic-broll / process-breakdown | Db1BsQYz6Fi / DdBhL7zMSSC / DbqpG6tTXQ4 | canvas particles morphing between PNG shapes / 16:9 beat-cut b-roll with speed ramps and a film grade / phone mockups with a timeline pill naming each build layer |
