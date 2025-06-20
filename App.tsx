/**
 * App.tsx - Integração Hello World com Frases + AdMob
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

// Importar componentes do app de frases
import { PhraseProvider } from './src/context/PhraseContext';
import HomeScreen from './src/screens/HomeScreen';
import AddPhraseScreen from './src/screens/AddPhraseScreen';
import PhrasesListScreen from './src/screens/PhrasesListScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import adConfig from './src/utils/adConfig';

// Configurar o navegador
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  // Inicializar o SDK do Google Mobile Ads
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        // Inicialização bem-sucedida
        console.log('AdMob SDK inicializado com sucesso');
      });
  }, []);

  // ID do banner do adConfig
  const adUnitId = adConfig.getBannerAdId();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <PaperProvider>
        <PhraseProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#6366f1',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ title: 'Frases Inspiradoras' }} 
              />
              <Stack.Screen 
                name="Adicionar" 
                component={AddPhraseScreen} 
                options={{ title: 'Nova Frase' }} 
              />
              <Stack.Screen 
                name="Frases" 
                component={PhrasesListScreen} 
                options={{ title: 'Suas Frases' }} 
              />
              <Stack.Screen 
                name="Relatórios" 
                component={ReportsScreen} 
                options={{ title: 'Relatórios' }} 
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PhraseProvider>
      </PaperProvider>
      
      {/* Banner de anúncio fixo na parte inferior */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    paddingVertical: 5,
  },
});

export default App;
