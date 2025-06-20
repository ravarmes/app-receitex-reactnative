import { TestIds } from 'react-native-google-mobile-ads';

// Configuração dos IDs do AdMob
// IMPORTANTE: Este é um arquivo de exemplo
// Copie este arquivo como 'adConfig.js' e configure com seus IDs reais do AdMob

const adConfig = {
  // IDs de produção - SUBSTITUA pelos seus IDs reais
  production: {
    androidAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // Seu App ID do Android
    iosAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',     // Seu App ID do iOS
    bannerAdId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',   // Seu Banner Ad ID
  },
  
  // IDs de teste (não altere)
  test: {
    androidAppId: TestIds.APP,
    iosAppId: TestIds.APP,
    bannerAdId: TestIds.BANNER,
  },
  
  // Retorna o ID apropriado com base no ambiente (dev ou prod)
  getBannerAdId: () => {
    return __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
  }
};

export default adConfig; 