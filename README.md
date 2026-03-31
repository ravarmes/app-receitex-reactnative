# 📱 Receitex

[![React Native](https://img.shields.io/badge/React%20Native-0.79.1-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Android](https://img.shields.io/badge/Platform-Android-3DDC84?style=flat-square&logo=android)](https://developer.android.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> Organize e armazene suas receitas médicas com facilidade

Receitex é um aplicativo React Native para organizar e armazenar receitas médicas usando fotos e metadados estruturados. Cadastre receitas, associe médicos, pacientes, categorias de sintomas e consulte tudo rapidamente.

## ✨ Funcionalidades

- 📝 **Adicionar e excluir** receitas médicas
- 🏷️ **Categorizar sintomas** para melhor organização
- 👨‍⚕️ **Registrar médicos** e pacientes
- 📅 **Data da consulta** para cada receita
- ❤️ **Marcar receitas como favoritas**
- 📊 **Estatísticas de uso** e relatórios
- 🔍 **Busca e filtros** por médico, paciente ou categoria
- 🎨 **Interface moderna** e intuitiva
- 📱 **Totalmente responsivo**

## 🛠️ Tecnologias Utilizadas

- **React Native** 0.79.1
- **React** 19.0.0
- **React Navigation** 7.1.6
- **React Native Paper** 5.13.3 (Material Design)
- **React Native Google Mobile Ads** 15.1.0
- **AsyncStorage** para persistência local
- **TypeScript** para tipagem estática

## 🚀 Configuração do Projeto

### Pré-requisitos

- Node.js (>= 18)
- React Native CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS - macOS apenas)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/receitex.git
cd receitex

# Instale as dependências
npm install

# Para Android
npx react-native run-android

# Para iOS (macOS apenas)
cd ios && pod install && cd ..
npx react-native run-ios
```

### Configuração do AdMob

1. Crie uma conta no [Google AdMob](https://admob.google.com/)
2. Configure seu aplicativo e obtenha os IDs necessários
3. Atualize os IDs nos arquivos de configuração:
   - `app.json`
   - `src/utils/adConfig.js`
   - `android/app/src/main/AndroidManifest.xml`

## 📦 Build para Produção

### Gerar Chave de Assinatura

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore receitex-key.keystore -alias receitex-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Configurar Gradle Properties

Crie um arquivo `android/gradle.properties` com suas credenciais:

```properties
MYAPP_UPLOAD_STORE_FILE=receitex-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=receitex-alias
MYAPP_UPLOAD_STORE_PASSWORD=sua-senha-aqui
MYAPP_UPLOAD_KEY_PASSWORD=sua-senha-aqui
```

### Gerar APK/AAB de Release

```bash
# APK
cd android && ./gradlew assembleRelease

# AAB (recomendado para Play Store)
cd android && ./gradlew bundleRelease
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── context/         # Context API (gerenciamento de estado)
│   ├── screens/         # Telas do aplicativo
│   ├── utils/          # Utilitários e configurações
│   └── mocks/          # Mocks para testes
├── android/            # Configurações Android
├── ios/               # Configurações iOS
├── assets/            # Imagens e recursos
└── __tests__/         # Testes unitários
```

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Executar testes com cobertura
npm run test:coverage
```

## 📄 Documentação Adicional

- [📋 Instruções de Release](RELEASE_INSTRUCTIONS.md)
- [📊 Resumo de Preparação](PREPARATION_SUMMARY.md)
- [🔒 Política de Privacidade](PRIVACY_POLICY.md)

## 🔐 Segurança

- ⚠️ **Nunca commite** chaves de assinatura ou senhas
- 🔑 **Configure variáveis de ambiente** para informações sensíveis
- 🛡️ **Use IDs de teste** durante o desenvolvimento

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: [Seu Nome]
- **Email**: [seu.email@exemplo.com]
- **GitHub**: [https://github.com/seu-usuario]

---

<div align="center">
  <p>Feito com ❤️ usando React Native</p>
</div>
