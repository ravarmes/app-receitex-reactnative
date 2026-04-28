---
name: "rn-admob-iap-setup"
description: "Configura e valida a estrutura de app React Native com AdMob e In-App Purchases (remove_ads). Invoque quando o usuário pedir para gerar um novo app baseado nessa estrutura."
---

# Configuração Padrão: React Native + AdMob + Google Play Billing (remove_ads)

Esta skill orienta e automatiza a configuração de um novo aplicativo que segue a estrutura base:
- **Anúncios**: Google AdMob (Banners e Interstitials).
- **In-App Purchases (IAP)**: Compra única (produto `remove_ads`) no Google Play Console para remover anúncios.
- **Identificador Base**: `br.com.vargascode.*`
- **Validação**: Geração de `.aab` (Release) e validação via Teste Interno no Google Play Console.

Siga rigorosamente as etapas abaixo ao iniciar um novo projeto com essa estrutura.

---

## 1. Configurações Iniciais do Código

### 1.1 Atualizar IDs e Pacotes
- Verifique e garanta que o pacote do app esteja configurado no padrão da organização (ex: `br.com.vargascode.nomedoapp`).
- Verifique os arquivos: `android/app/build.gradle` (`namespace` e `applicationId`), `android/app/src/main/AndroidManifest.xml`, `MainActivity.kt` e `MainApplication.kt`.

### 1.2 Configurar o IAP (In-App Purchase)
- No arquivo de contexto do IAP (geralmente `IapContext.tsx` ou similar), certifique-se de que a constante do SKU está estritamente definida como:
  ```javascript
  export const REMOVE_ADS_SKU = 'remove_ads';
  ```
- Certifique-se de que a lógica oculta os anúncios caso `isAdFree` (ou equivalente) seja `true`.

### 1.3 Configurar o AdMob
- Crie o arquivo `adConfig.js` a partir do `adConfig.example.js`.
- Instrua o usuário a colar os **IDs Reais do AdMob** (App ID, Banner ID, Interstitial ID) nesse arquivo.
- O App ID também deve ser inserido no `AndroidManifest.xml` (na tag `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" ... />`) e no `app.json`.

### 1.4 Resolução de Problemas Conhecidos (Build Android no Windows)
- **Problema**: Ao compilar o projeto no Windows (ex: ao rodar `:app:installDebug` ou gerar o AAB), pode ocorrer um erro fatal de C++ relacionado ao `Ninja` ou `CMake` (`GetOverlappedResult`), frequentemente associado ao pacote `react-native-screens` e caminhos muito longos.
- **Solução**: Forçar o uso da versão do Android NDK `26.1.10909125` (que é estável para esse cenário). 
- **Como aplicar**: No arquivo `android/build.gradle`, dentro do bloco `ext`, defina a variável:
  ```gradle
  ndkVersion = "26.1.10909125"
  ```
- Após a alteração, sempre limpe o cache do gradle (`./gradlew clean`).

---

## 2. Ações Externas: AdMob e Google Play Console

### 2.1 No AdMob
O usuário precisa:
1. Criar o aplicativo na plataforma do Google AdMob.
2. Criar os blocos de anúncio:
   - **Banner**
   - **Interstitial**
3. Copiar os IDs gerados para atualizar o código fonte do aplicativo (conforme item 1.3).

### 2.2 No Google Play Console
O usuário precisa:
1. Criar o app no Google Play Console.
2. **Criar Produto Único**: Vá em Produtos > Produtos Únicos e crie um item com a ID exata: `remove_ads`.
3. **Teste de Licença**: Vá na tela inicial do Console da conta desenvolvedora > Configurações > Teste de Licença.
   - Adicione o email do testador (ex: `brinabrug@gmail.com`) para que ele possa testar a compra com um cartão simulado do Google sem ser cobrado.

---

## 3. Versionamento e Geração de Pacotes (AAB)

Antes de gerar qualquer pacote, é crucial seguir o padrão correto no arquivo `android/app/build.gradle`:

### 3.1 Padrão de Versionamento (Play Console)
- **`versionName`**: Versão pública (ex: `1.0.0`). Só altera quando há novas funcionalidades visíveis.
- **`versionCode`**: Número inteiro da build (ex: `1`, `2`, `3`). **Obrigatório incrementar** a cada novo `.aab` gerado.

**Diretrizes por fase:**
- **Teste Interno**: Mantenha o `versionName` atual (ex: `0.1.0`) e incremente o `versionCode`. O nome da versão no Console deve ser descritivo para você (ex: `0.1.0 - Teste IAP e AdMob`).
- **Teste Fechado**: Quando estável, atualize o `versionName` (ex: `1.0.0-rc` ou `1.0.0`) e incremente o `versionCode`.
- **Produção**: O `versionName` deve ser a versão final limpa (ex: `1.0.0`). Nome da versão no console: `1.0.0 - Lançamento Oficial`.

### 3.2 Gerando a Versão de Teste Interno

Para validar a compra de `remove_ads`, é **obrigatório** gerar um pacote assinado (AAB) e disponibilizá-lo via Teste Interno na Play Store.

1. **Geração do AAB:**
   No terminal, limpe o cache e gere o pacote de lançamento:
   ```bash
   cd android
   ./gradlew clean buildCache cleanBuildCache
   ./gradlew bundleRelease
   ```
   *Nota: Lembre-se de sempre atualizar o `versionCode` no `build.gradle` ao gerar novos pacotes para a loja.*

2. **Upload e Teste Interno:**
   - Faça o upload do arquivo gerado (`android/app/build/outputs/bundle/release/app-release.aab`) na seção **Teste Interno** do Google Play Console.
   - Inclua a lista de testadores (que contenha `brinabrug@gmail.com`).
   - Salve, revise e libere o lançamento.

---

## 4. Teste Final (Validação no Emulador ou Dispositivo Físico)

1. Pegue o "Link de participação na Web" gerado na aba Testadores do Console.
2. Abra esse link no Emulador Android ou celular físico (logado com a conta do testador, ex: `brinabrug@gmail.com`).
3. Aceite o convite de teste e clique no link para baixar o app diretamente pela Google Play Store.
4. Abra o app, vá até o botão de "Remover Anúncios" e inicie a compra.
5. Confirme se a forma de pagamento aparece como "Test Card, always approves". Se a compra der sucesso e os anúncios sumirem, o fluxo de IAP está 100% validado.
