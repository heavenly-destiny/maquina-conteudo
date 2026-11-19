"""Edit decision lists for the 5 UGC creatives (creator footage + Stories Lab copy).
Each segment: (source clip, start, end[, speaker]). Words inside a segment are re-cut automatically
at gaps > GAP so there is no dead air. Overlays are anchored to spoken words: ("word", occurrence)."""

# Whisper mistakes -> what she actually says. Keyed by clip and the word's start time ("" drops the word).
FIX = {
    "IMG_4142": {1.18: "Viu,", 2.5: "seus Stories?", 7.12: "fico", 7.8: "Canva,", 12.56: "treino,", 18.08: "seu Story."},
    "IMG_4149": {4.4: "essas", 4.68: "figurinhas?", 7.66: "figurinhas,"},
    "IMG_4164": {5.8: "Stories", 8.74: "100", 20.38: "", 20.46: "saiba", 20.6: "", 20.72: "mais."},
    "IMG_4176": {6.54: "", 6.64: "nail designer,"},
    "IMG_4178": {4.34: "separadas"},
    "IMG_4181": {0.68: "Quer", 1.14: "seus"},
}

SFX_POP, SFX_DING, SFX_SWISH, SFX_WHOOSH = "pop", "ding", "swish", "whoosh"

U = {
    # 1 · "VIU, COMO VOCÊ EDITA?"  (sofa, yellow top)
    "u1": {
        "title": "COMO-VOCE-EDITA",
        "tail": 2.4,
        "music": "m1",
        "segs": [
            ("IMG_4142", 1.80, 5.20),            # Como você edita seus Stories? Geral pergunta daquelas figurinhas, edições
            ("IMG_4142", 6.10, 9.45),            # Todo mundo acha que fico horas no Canva, mas é esse aplicativo aqui
            ("IMG_4142", 9.80, 14.35),           # tem mais de 24 mil figurinhas de todos os tipos. Treino, rotina,
            ("IMG_4142", 15.00, 18.62),          # do dia a dia, você só clica na figurinha, copia e cola nos seus Stories
            ("IMG_4144", 1.05, 2.26, "amiga"),   # Ah, mas é só isso?
            ("IMG_4144", 2.68, 6.30),            # Sim, é só isso. Por isso todos os meus stories ficam com essa carinha de Pinterest.
        ],
        "hook": ["como ela deixa os", "*stories assim?* 👀"],
        "ov": [
            ("dms", ("pergunta", 0), 2.6, {}),
            ("app", ("aplicativo", 0), 2.6, {"img": "home.png"}),
            ("count", ("mil", 0), 2.2, {"to": 24000, "label": "figurinhas"}),
            ("stk", ("treino,", 0), 1.4, {"src": "academia-e-treino-190.webp", "x": 640, "y": 560, "rot": 8}),
            ("stk", ("rotina,", 0), 1.4, {"src": "frases-22.webp", "x": 120, "y": 600, "rot": -8}),
            ("stk", ("dia,", 0), 1.4, {"src": "bom-dia-272.webp", "x": 600, "y": 820, "rot": 5}),
            ("broll", ("clica", 0), 1.25, {"src": "IMG_4143", "ss": 2.0}),
            ("toast", ("copia", 0), 1.0, {"text": "Figurinha copiada!"}),
            ("broll", ("cola", 0), 1.6, {"src": "IMG_4143", "ss": 9.4}),
            ("chip", ("Pinterest.", 0), 2.0, {"text": "carinha de Pinterest ✨", "y": 520}),
            ("hearts", ("Pinterest.", 0), 0, {}),
        ],
        "cta": "Toca em Saiba mais 👇",
    },
    # 2 · "ONDE VOCÊ ACHA ESSAS FIGURINHAS?"  (sofa, yellow top)
    "u2": {
        "title": "ONDE-ACHA-FIGURINHAS",
        "tail": 2.4,
        "music": "m4",
        "segs": [
            ("IMG_4149", 3.20, 4.98),            # Espera, mas onde você encontra essas figurinhas?
            ("IMG_4149", 5.80, 10.25),           # antes eu baixava no drive, né, packs de figurinhas, e acabava ocupando toda a memória
            ("IMG_4149", 10.33, 13.30),          # Agora eu achei um aplicativo chamado Stories Lab,
            ("IMG_4149", 13.38, 17.68),          # e tem várias figurinhas de Natal, de Ano Novo, de Bom Dia, de Treino,
            ("IMG_4150", 0.55, 3.72),            # É só clicar, copiar e colar no seu story.
            ("IMG_4153", 1.80, 4.96),            # Eu não perco mais tempo para criar os meus stories.
        ],
        "hook": ["onde ela acha", "*essas figurinhas?* 🤔"],
        "ov": [
            ("dms", ("figurinhas?", 0), 1.25, {"msgs": ["onde vc acha essas figurinhas?", "me passa o pack 🙏", "que figurinha linda!! 😍"]}),
            ("notif", ("drive,", 0), 2.4, {"app": "Google Drive", "title": "pack-figurinhas-2024.zip", "body": "Download concluído · 1,2 GB", "icon": "drive"}),
            ("notif", ("memória", 0), 2.2, {"app": "Ajustes", "title": "Armazenamento quase cheio", "body": "Seu iPhone não tem espaço suficiente.", "icon": "gear", "y2": 1}),
            ("logo", ("Stories", 0), 1.3, {}),
            ("chip", ("Natal,", 0), 1.2, {"text": "Natal 🎄", "x": 90, "y": 520, "rot": -5}),
            ("chip", ("Ano", 0), 1.2, {"text": "Ano Novo 🥂", "x": 560, "y": 640, "rot": 4}),
            ("chip", ("Bom", 0), 1.2, {"text": "Bom dia ☀️", "x": 120, "y": 780, "rot": -3}),
            ("chip", ("Treino,", 0), 1.0, {"text": "Treino 💪", "x": 600, "y": 900, "rot": 6}),
            ("broll", ("clicar,", 0), 1.0, {"src": "IMG_4143", "ss": 2.2}),
            ("toast", ("copiar", 0), 0.9, {"text": "Figurinha copiada!"}),
            ("broll", ("colar", 0), 1.4, {"src": "IMG_4143", "ss": 9.5}),
            ("clock", ("perco", 0), 1.9, {}),
        ],
        "cta": "Toca em Saiba mais 👇",
    },
    # 3 · "VOCÊ PAGA ALGUÉM PRA EDITAR?"  (white tee)
    "u3": {
        "title": "PAGA-ALGUEM",
        "music": "m6",
        "segs": [
            ("IMG_4164", 0.36, 2.86),            # Mas fala a verdade, você paga alguém para editar o seu Story, né?
            ("IMG_4164", 3.04, 3.50),            # Não,
            ("IMG_4164", 3.78, 6.70),            # é esse aplicativo aqui que eu uso chamado Stories Lab.
            ("IMG_4164", 6.88, 11.58),           # Tem mais de 24 mil figurinhas, 100 filtros e até roteiros para Stories.
            ("IMG_4164", 11.64, 15.78),          # Você só clica na figurinha, copia, vai lá no seu Story e cola.
            ("IMG_4164", 16.20, 18.04, "amiga"), # E é tudo isso num aplicativo só? E como eu consigo?
            ("IMG_4164", 18.18, 20.98),          # Isso mesmo. Eu vou deixar o link, você clica aqui embaixo e saiba mais.
        ],
        "hook": ["ela paga alguém", "*pra editar?* 💸"],
        "ov": [
            ("nope", ("Não,", 0), 0.9, {}),
            ("logo", ("Stories", 0), 0.95, {}),
            ("count", ("mil", 0), 1.4, {"to": 24000, "label": "figurinhas", "y": 380}),
            ("chip", ("filtros", 0), 1.6, {"text": "+100 filtros 🎨", "x": 110, "y": 640, "rot": -4}),
            ("chip", ("roteiros", 0), 1.4, {"text": "roteiros prontos 📝", "x": 460, "y": 800, "rot": 4}),
            ("app", ("clica", 0), 3.6, {"img": "modal-legday.png", "taps": [[345, 1250, 0.5]], "toast": "Copiada!"}),
            ("arrow", ("embaixo", 0), 2.0, {}),
        ],
        "cta_at": ("link", 0),
        "cta": "Toca em Saiba mais 👇",
    },
    # 4 · "PROFISSIONAL SEM TEMPO"  (office, blazer)
    "u4": {
        "title": "PROFISSIONAL-SEM-TEMPO",
        "music": "m1",
        "segs": [
            ("IMG_4165", 0.68, 5.32),            # Se você é profissional e não tem tempo de ficar no Canva, esse vídeo é para você.
            ("IMG_4166", 0.42, 7.32),            # Eu sou arquiteta e passo o dia entre obras e reuniões. Eu não posso perder meia hora...
            ("IMG_4170", 0.55, 3.00),            # Olha aqui esse Story que eu acabei de fazer.
            ("IMG_4170", 3.22, 9.52),            # É um aplicativo que tem mais de 24 mil figurinhas de todos os estilos e para qualquer profissão.
            ("IMG_4170", 9.60, 12.08),           # Mais de 100 filtros e até roteiros para Stories.
            ("IMG_4170", 12.18, 16.20),          # Você só clica na figurinha, copia, vai no seu Story e cola.
            ("IMG_4172", 0.48, 5.05),            # Eu tenho certeza que esse aplicativo também será útil para você. Clique aqui e saiba mais.
        ],
        "hook": ["sem tempo pra", "*montar story?* ⏳"],
        "ov": [
            ("x", ("Canva,", 0), 1.4, {"text": "Canva"}),
            ("chip", ("arquiteta", 0), 1.6, {"text": "arquiteta 📐", "x": 110, "y": 560, "rot": -4}),
            ("clock", ("meia", 0), 1.9, {"to": 30}),
            ("app", ("Story", 0), 2.2, {"img": "home.png"}),
            ("count", ("mil", 0), 1.6, {"to": 24000, "label": "figurinhas", "y": 380}),
            ("prof", ("profissão.", 0), 1.4, {}),
            ("chip", ("filtros", 0), 1.4, {"text": "+100 filtros 🎨", "x": 110, "y": 640, "rot": -4}),
            ("chip", ("roteiros", 0), 1.3, {"text": "roteiros prontos 📝", "x": 460, "y": 800, "rot": 4}),
            ("app", ("clica", 0), 3.6, {"img": "modal-boanoite.png", "taps": [[345, 1250, 0.5]], "toast": "Copiada!"}),
            ("arrow", ("Clique", 0), 1.6, {}),
        ],
        "cta_at": ("Clique", 0),
        "cta": "Toca em Saiba mais 👇",
    },
    # 5 · "JÁ INDIQUEI PRA TODAS AS AMIGAS"  (office, blazer)
    "u5": {
        "title": "INDIQUEI-AMIGAS",
        "music": "m6",
        "segs": [
            ("IMG_4176", 1.68, 5.36),            # Amiga, eu já indiquei esse aplicativo aqui para todas as minhas amigas.
            ("IMG_4176", 5.42, 12.22),           # Eu sou arquiteta, tenho amigas nail designer, dentista, que tem loja, e elas sempre me perguntavam...
            ("IMG_4178", 0.66, 6.58),            # É esse aplicativo aqui, são mais de 24 mil figurinhas separadas por temas e profissões.
            ("IMG_4178", 6.76, 9.88),            # É só você encontrar a sua figurinha, copiar e colar no Story.
            ("IMG_4179", 0.58, 5.60),            # E se não tiver o tema ou a figurinha da sua área, você pede que eles criam. Tem novidade todo mês.
            ("IMG_4181", 0.60, 3.74),            # Quer que seus stories chamem a atenção? Clique aqui em Saiba mais.
        ],
        "hook": ["o app que ela", "*indicou pra todas* 💌"],
        "ov": [
            ("share", ("amigas.", 0), 1.8, {}),
            ("chip", ("arquiteta,", 0), 1.0, {"text": "arquiteta 📐", "x": 100, "y": 520, "rot": -4}),
            ("chip", ("nail designer,", 0), 1.6, {"text": "nail designer 💅", "x": 470, "y": 620, "rot": 4}),
            ("chip", ("dentista,", 0), 1.3, {"text": "dentista 🦷", "x": 120, "y": 740, "rot": -3}),
            ("chip", ("loja,", 0), 1.1, {"text": "loja 🛍️", "x": 600, "y": 860, "rot": 5}),
            ("dms", ("perguntavam", 0), 1.6, {"msgs": ["amiga, como vc deixa seus stories assim? 😍", "me ensina a editar!!", "que estética linda 🤍"]}),
            ("count", ("mil", 0), 1.6, {"to": 24000, "label": "figurinhas", "y": 380}),
            ("app", ("encontrar", 0), 3.0, {"img": "maisusados.png", "taps": [[200, 700, 0.7]], "toast": "Copiada!"}),
            ("dmreq", ("pede", 0), 1.9, {}),
            ("chip", ("novidade", 0), 0.9, {"text": "novidade todo mês ✨", "x": 230, "y": 640, "rot": -2}),
            ("arrow", ("Clique", 0), 1.6, {}),
        ],
        "cta_at": ("Quer", 0),
        "cta": "Toca em Saiba mais 👇",
    },
}
