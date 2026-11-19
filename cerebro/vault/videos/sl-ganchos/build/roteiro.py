"""Copy of the 5 hook creatives (Reel @faelsc_ hook formulas -> Stories Lab).
Each line: (text spoken, caption text shown, mood, gap before in s).
Caption text uses the Stories Lab story voice (lowercase, 'cê', emoji); the spoken text is what the voice reads."""

C = {
    # 5. QUEBRA DE CRENCA - format: iPhone Notes (belief typed, struck through, truth rewritten)
    1: {
        "name": "SL-G01-QUEBRA-DE-CRENCA",
        "lines": [
            ("O motivo de ninguém responder seus stories não tem nada a ver com postar mais.", "authority", 0.25),
            ("Eu postava dez stories por dia. Quarenta visualizações. Zero resposta.", "pain", 0.45),
            ("O problema nunca foi a quantidade. Era a cara do story. Foto solta, sem nada, igual à de todo mundo.", "secret", 0.55),
            ("Aí eu achei um app com mais de vinte e quatro mil figurinhas prontas. É só copiar e colar.", "excited", 0.45),
            ("No mesmo dia chegou resposta: onde você fez esse story?", "triumph", 0.35),
            ("Toca em saiba mais e vê todos os temas.", "warm", 0.45),
        ],
    },
    # 4. EXPLICACAO DO PROBLEMA - format: search bar with autocomplete + answer card
    2: {
        "name": "SL-G02-EXPLICACAO-DO-PROBLEMA",
        "lines": [
            ("A maioria das mulheres posta story e ninguém responde. Sabe por quê?", "curious", 0.25),
            ("Eu pesquisei. E olha quanta gente pergunta a mesma coisa.", "curious", 0.45),
            ("A resposta é simples: story sem graça, o dedo pula em menos de um segundo.", "authority", 0.6),
            ("E story bonito segura. Quem para, responde.", "hope", 0.45),
            ("O Stories Lab tem mais de vinte e quatro mil figurinhas e sessenta temas, pra copiar e colar.", "excited", 0.4),
            ("Mais de vinte mil mulheres já usam. Toca em saiba mais.", "warm", 0.45),
        ],
    },
    # 3. IDENTIFICACAO - format: Instagram story insights (views vs replies)
    3: {
        "name": "SL-G03-IDENTIFICACAO",
        "lines": [
            ("Se você posta story todo dia e tem passado pela vergonha de abrir isso aqui…", "pain", 0.25),
            ("e ver todo mundo olhando, e ninguém falando nada.", "melancholy", 0.35),
            ("Não é você. É que o seu story tá igual ao de todo mundo.", "intimate", 0.8),
            ("Eu comecei a usar as figurinhas prontas do Stories Lab. Bom dia, treino, café. Tudo pronto.", "hope", 0.5),
            ("Agora olha a diferença.", "triumph", 0.4),
            ("Toca em saiba mais e testa hoje.", "warm", 0.6),
        ],
    },
    # 2. EXPERIENCIA E APRENDIZADO - format: 7-day diary (calendar flips day by day)
    4: {
        "name": "SL-G04-EXPERIENCIA",
        "lines": [
            ("Eu testei sete dias postando story com figurinha pronta. E essa foi a maior lição que eu aprendi.", "secret", 0.25),
            ("Dia um. Três respostas. Eu nunca tinha recebido nenhuma.", "excited", 0.5),
            ("Dia três. Uma cliente me chamou só por causa do story.", "excited", 0.35),
            ("Dia sete. Eu já nem pensava no que postar.", "hope", 0.35),
            ("A lição? Ninguém ignora você. Ignoram story sem graça.", "intimate", 0.8),
            ("As figurinhas são do Stories Lab. Toca em saiba mais.", "warm", 0.45),
        ],
    },
    # 1. CHAMADA DIRETA AO PUBLICO - format: full-screen kinetic type + wall of professions
    5: {
        "name": "SL-G05-CHAMADA-DIRETA",
        "lines": [
            ("Se você vende pelo Instagram, para tudo.", "urgent", 0.2),
            ("Manicure. Confeiteira. Lojista. Esteticista.", "urgent", 0.35),
            ("O seu story é a sua vitrine. E vitrine sem graça não vende.", "authority", 0.5),
            ("Com o Stories Lab, cada story ganha cara de marca grande, em segundos.", "excited", 0.45),
            ("Mais de vinte e quatro mil figurinhas e sessenta temas, prontos pra copiar e colar.", "excited", 0.3),
            ("Toca em saiba mais.", "warm", 0.45),
        ],
    },
}

# mood -> edge-tts prosody (provisional voice; ElevenLabs v4 tags replace this when the connector is back)
PROSODY = {
    "authority": ("+0%", "-2Hz"), "pain": ("-6%", "-4Hz"), "secret": ("-8%", "-3Hz"), "excited": ("+10%", "+4Hz"),
    "triumph": ("+6%", "+6Hz"), "warm": ("-2%", "+0Hz"), "curious": ("+2%", "+3Hz"), "hope": ("+0%", "+2Hz"),
    "melancholy": ("-12%", "-5Hz"), "intimate": ("-10%", "-3Hz"), "urgent": ("+12%", "+2Hz"),
}
