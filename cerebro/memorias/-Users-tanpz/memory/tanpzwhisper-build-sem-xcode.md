---
name: tanpzwhisper-build-sem-xcode
description: TanpzWhisper (app de ditado em ~/Developer/TanpzWhisper) compila só com Command Line Tools; @State do SwiftUI não funciona sem Xcode.
metadata: 
  node_type: memory
  type: project
  originSessionId: df0699ee-ea2d-4b06-ad02-9fc6390df3fa
  modified: 2026-08-13T15:21:57.577Z
---

O TanpzWhisper é um app de ditado estilo Superwhisper para o Mac do tanpz, criado em 2026-08-13, em `~/Developer/TanpzWhisper` (SwiftPM, sem projeto Xcode). Ele roda instalado em `/Applications/TanpzWhisper.app` via `./build.sh install`.

A máquina tem apenas as Command Line Tools, sem Xcode.app. Consequência: `@State` do SwiftUI é uma macro cuja implementação (`libSwiftUIMacros.dylib`) só vem no Xcode, então qualquer uso de `@State` falha a compilação com "plugin for module 'SwiftUIMacros' not found". `@ObservedObject`, `@StateObject`, `@Environment` e `@Published` funcionam normalmente — estado de view fica em `ObservableObject` em vez de `@State`.

Outro detalhe do SwiftPM novo: o binário de release não fica em `.build/<triple>/release/`, e sim no caminho retornado por `swift build --show-bin-path` (`.build/out/Products/Release`).

Transcrição usa `SpeechAnalyzer`/`SpeechTranscriber` (Speech.framework, on-device) e os modos de reescrita usam `FoundationModels` — o Apple Intelligence está disponível e ativo nesta máquina.

Assinatura: em 2026-08-13 foi criado um certificado auto-assinado "Tanpz Local Code Signing" no keychain de login (confiável só para `codeSign`), e o `build.sh` assina com ele. Isso existe porque assinatura ad-hoc faz o TCC fixar o `cdhash` do binário: cada rebuild invalidava silenciosamente a permissão de Acessibilidade e o `Cmd+V` sintético parava de colar sem erro nenhum. Com o certificado, o requisito passa a ser identificador + certificado e sobrevive a rebuilds. O certificado só existe no keychain desta máquina, não no repositório — se ele sumir, o `build.sh` avisa e cai para ad-hoc, e aí é preciso recriar o certificado e reconceder a Acessibilidade uma vez.

Decisão de 2026-08-13, com os números na mesa: o ditado fica no modelo local, priorizando velocidade sobre precisão. Existe um `CloudEnhancer` que chama o CLI `claude -p` usando a assinatura, e um toggle "Usar o Claude em vez do modelo local" nos Ajustes, mas ele nasce desligado e o tanpz decidiu deixar assim — ele quer o texto colado logo que solta a tecla. Os números que sustentaram isso: o caminho que funciona com assinatura leva 8,8s contra 1-2s do local, gasta da cota Pro que ele usa para programar, e nos testes corrigiu os termos de forma inconsistente. A flag `--bare` do CLI (que pula hooks e plugins e cai para 0,8s) **não aceita OAuth** — exige `ANTHROPIC_API_KEY` e responde "Not logged in". Não reabrir esse assunto sem um motivo novo.

Detalhe do modelo local: o `SystemLanguageModel` do FoundationModels obedece mal instruções longas. O modo "clean" só passou a pontuar de verdade depois que a instrução foi cortada para poucas frases com um exemplo entrada/saída em português falado; com uma lista de oito regras ele devolvia o texto quase intacto.

Relacionado: [[instalar-skills-sempre-global]], [[mac-diagnostico-2026-08]]
