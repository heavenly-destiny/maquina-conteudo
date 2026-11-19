      // ===== shared helpers for the UGC + motion creatives =====
      const showScene = (id, t) => tl.set(id, { opacity: 1 }, t);
      const hideScene = (id, t) => tl.set(id, { opacity: 0 }, t);
      const flashAt = (t, o = 0.6) => { tl.fromTo("#flash", { opacity: 0 }, { opacity: o, duration: 0.05, immediateRender: false }, t); tl.to("#flash", { opacity: 0, duration: 0.3 }, t + 0.05); };
      tl.fromTo("#flash", { opacity: 0.7 }, { opacity: 0, duration: 0.35, ease: "power2.out" }, 0);
      const SITE = ["comida-1","comida-2","comida-3","comida-4","comida-5","comida-6","comida-7","comida-8","treino-1","treino-2","treino-3","treino-4","treino-5","treino-6","treino-7","rotina-1","rotina-2","rotina-3","rotina-4","rotina-5","rotina-6","rotina-7","beleza-1","beleza-2","beleza-3","beleza-4","beleza-5","fe-1","fe-2","fe-3","fe-4","fe-5"];
      const buildWall = (id, off = 0) => { const w = document.getElementById(id); const rows = [];
        for (let r = 0; r < 4; r++) { const row = document.createElement("div"); row.className = "wrow";
          for (let i = 0; i < 22; i++) { const im = document.createElement("img"); im.src = "assets/site/" + SITE[(r * 9 + i + off) % SITE.length] + ".webp"; im.alt = ""; row.appendChild(im); }
          w.appendChild(row); rows.push(row); }
        return rows; };
      const rollWall = (rows, t, d) => rows.forEach((r, i) => tl.fromTo(r, { x: i % 2 ? 0 : -1700 }, { x: i % 2 ? -1700 : 0, duration: d, ease: "none" }, t));
      // her video as a rounded card on top; motion plays underneath
      const pip = (t0, t1, inFrom, exit = "expand", fxSel = null) => {
        tl.set("#pb", { opacity: 1, y: 0 }, t0 - 0.1);
        if (fxSel) tl.set(fxSel, { y: 0, opacity: 1 }, t0 - 0.1);
        tl.fromTo("#cam", { scale: 0.5, x: 0, y: inFrom, transformOrigin: "50% 50%", clipPath: "inset(0% round 90px)" },
          { scale: 0.5, y: -370, duration: 0.4, ease: "expo.out", immediateRender: false }, t0);
        tl.fromTo("#cam", { scale: 0.5 }, { scale: 0.52, y: -360, duration: Math.max(0.1, t1 - t0 - 0.4), ease: "none", immediateRender: false }, t0 + 0.4);
        tl.fromTo("#gpb", { x: -100 }, { x: 200, y: 200, duration: t1 - t0, ease: "sine.inOut" }, t0);
        if (exit === "expand") { tl.to("#cam", { scale: 1, y: 0, clipPath: "inset(0% round 0px)", duration: 0.32, ease: "power3.inOut" }, t1);
          tl.set("#pb", { opacity: 0 }, t1 + 0.32); if (fxSel) tl.to(fxSel, { opacity: 0, y: 200, duration: 0.2, ease: "power2.in" }, t1 - 0.1); }
        else if (exit === "up") { tl.to(["#pb", fxSel].filter(Boolean), { y: -1920, duration: 0.32, ease: "power3.in" }, t1 - 0.12);
          tl.to("#cam", { y: -2400, duration: 0.32, ease: "power3.in" }, t1 - 0.12);
          tl.set(["#pb"], { opacity: 0, y: 0 }, t1 + 0.3); tl.set("#cam", { clipPath: "inset(0% round 0px)", scale: 1, y: 0 }, t1 + 0.3); }
        else { tl.set("#pb", { opacity: 0 }, t1 + 0.3); tl.set("#cam", { clipPath: "inset(0% round 0px)", scale: 1, y: 0 }, t1 + 0.3); }
      };
      // scene in/out transitions
      const zoomIn = (sel, inner, t) => { showScene(sel, t); tl.fromTo(inner, { scale: 1.35, filter: "blur(18px)" }, { scale: 1, filter: "blur(0px)", duration: 0.32, ease: "expo.out" }, t); flashAt(t); };
      const irisIn = (sel, t, at = "50% 49%") => { showScene(sel, t); tl.fromTo(sel, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(140% at ${at})`, duration: 0.55, ease: "expo.inOut" }, t);
        tl.fromTo("#rays", { opacity: 0, rotation: 0, scale: 0.6 }, { opacity: 0.8, rotation: 25, scale: 1.1, duration: 0.4, ease: "power2.out" }, t); tl.to("#rays", { opacity: 0, rotation: 40, duration: 0.5, ease: "power2.in" }, t + 0.4); };
      const whipUpTo = (outSel, inSel, t) => { tl.to(outSel, { y: -1920, duration: 0.32, ease: "power3.in" }, t - 0.12); showScene(inSel, t - 0.02);
        tl.fromTo(inSel, { y: 1920 }, { y: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, t - 0.02); hideScene(outSel, t + 0.3); tl.set(outSel, { y: 0 }, t + 0.32); };
      const whipLeftTo = (outSel, inSel, t) => { tl.to(outSel, { x: -1080, filter: "blur(10px)", duration: 0.3, ease: "power3.in" }, t - 0.1); showScene(inSel, t);
        tl.fromTo(inSel, { x: 1080, filter: "blur(10px)" }, { x: 0, filter: "blur(0px)", duration: 0.3, ease: "power3.out", immediateRender: false }, t); hideScene(outSel, t + 0.3); tl.set(outSel, { x: 0, filter: "none" }, t + 0.32); };
      const backToHer = (outSel, t) => { tl.to(outSel, { y: -1920, duration: 0.32, ease: "power3.in" }, t - 0.14); hideScene(outSel, t + 0.2); tl.set(outSel, { y: 0 }, t + 0.25);
        tl.fromTo("#cam", { y: 1920 }, { y: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, t - 0.06); };
      const fadeOutScene = (outSel, t) => { tl.to(outSel, { opacity: 0, scale: 1.12, filter: "blur(12px)", duration: 0.25, ease: "power2.in" }, t - 0.1); tl.set(outSel, { scale: 1, filter: "none" }, t + 0.2); };
      // red X stamp + shake + grey on a target ("nunca mais")
      const xErr = (x, target, t) => { tl.fromTo(x, { opacity: 0, scale: 2.4, rotation: -20 }, { opacity: 1, scale: 1.25, rotation: 0, duration: 0.22, ease: "expo.out" }, t);
        tl.fromTo(target, { x: -26 }, { x: 0, duration: 0.45, ease: "elastic.out(1,0.25)", immediateRender: false }, t + 0.03);
        tl.fromTo(target, { filter: "grayscale(0) brightness(1)" }, { filter: "grayscale(1) brightness(0.8)", duration: 0.25, immediateRender: false }, t + 0.03); flashAt(t, 0.25); };
      const rise = (sel, t, rot = 0) => tl.fromTo(sel, { opacity: 0, y: 260, scale: 0.55, rotation: rot - 14, rotationY: rot >= 0 ? 55 : -55, rotationX: 30, transformPerspective: 1200 }, { opacity: 1, y: 0, scale: 1, rotation: rot, rotationY: 0, rotationX: 0, duration: 0.55, ease: "back.out(1.5)" }, t);
      // the CTA: pink ink opens the end card over the moving wall of real stories
      const endCard = (T) => { (window.MW = window.MW || []).push([T + 0.15, TOTAL + 1]); const rows = buildWall("wallE", 5); showScene("#mEnd", T);
        tl.fromTo("#mEnd", { clipPath: "circle(0% at 50% 55%)" }, { clipPath: "circle(130% at 50% 55%)", duration: 0.6, ease: "expo.inOut" }, T);
        rollWall(rows, T, TOTAL - T + 0.5);
        tl.fromTo("#mEnd .endcard", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, T + 0.1);
        tl.fromTo("#eLogo", { opacity: 0, scale: 0.8, y: 40, filter: "blur(14px)" }, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, T + 0.2);
        tl.fromTo("#eTag", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, T + 0.4);
        tl.fromTo("#eCta", { opacity: 0, scale: 0.6, y: 60 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, T + 0.55);
        tl.to("#eCta", { scale: 1.06, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 3 }, T + 1.1);
        sweep("#eG", T + 1.0, 0.8);
        tl.fromTo("#eUrl", { opacity: 0 }, { opacity: 1, duration: 0.4 }, T + 0.7);
        tl.fromTo("#eArr", { opacity: 0, y: -20 }, { opacity: 1, y: 30, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 3 }, T + 0.8);
        sparks("ePt", T + 0.3, TOTAL, 14); };
