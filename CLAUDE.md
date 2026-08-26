# Receitex — CLAUDE.md

App Android de **receitas**: cadastro, organização e relatórios das próprias receitas.

Nasceu do **`app-template-reactnative`**. As regras gerais — acoplamento AdMob↔IAP, os 4
lugares do `applicationId`, `versionCode`, bug de build do Ninja/CMake no Windows, fluxo de
release — estão no [CLAUDE.md do template](../app-template-reactnative/CLAUDE.md). Aqui fica
só o que é diferente.

## Identidade

- **Pacote**: `br.com.vargascode.receitex` · **versão atual**: `versionCode 15` / `1.0.15`
- **IAP**: `remove_ads` em `src/contexts/IapContext.tsx`
- **AdMob**: `src/utils/adConfig.js` (gerado do `.example`, fora do git)
- **NDK em uso**: `27.1.12297006` em `android/build.gradle`

## Específico deste app

- **Duas pastas de contexto, e isso é armadilha**: `src/contexts/` (plural) tem só o
  `IapContext.tsx`; `src/context/` (singular) tem `PrescriptionContext.tsx` e
  `ThemeContext.tsx`. Conferir o caminho antes de importar — o erro é silencioso no editor.
- As respostas já enviadas ao Google sobre acesso à produção estão em
  `_docs/play-console-respostas.md` (skill `harness:geracao-respostas-play-console`).

## Preferência de trabalho

Aplicar as alterações completas direto no código e, em seguida, gerar o build
(`.\deploy.ps1`) — em vez de entregar trechos para colar.

## Comandos

```bash
npm run android
npm run lint && npm test
.\deploy.ps1
cd android && ./gradlew bundleRelease
```
