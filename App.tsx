/**
 * App.tsx - Receitex - Organizador de Receitas Médicas
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

// Importar componentes do app Receitex
import { PrescriptionProvider } from './src/context/PrescriptionContext';
import HomeScreen from './src/screens/HomeScreen';
import AddPrescriptionScreen from './src/screens/AddPrescriptionScreen';
import PrescriptionsListScreen from './src/screens/PrescriptionsListScreen';
import PrescriptionDetailScreen from './src/screens/PrescriptionDetailScreen';
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
        <PrescriptionProvider>
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
                options={{ title: 'Receitex' }} 
              />
              <Stack.Screen 
                name="Adicionar" 
                component={AddPrescriptionScreen} 
                options={{ title: 'Nova Receita' }} 
              />
              <Stack.Screen 
                name="Receitas" 
                component={PrescriptionsListScreen} 
                options={{ title: 'Suas Receitas' }} 
              />
              <Stack.Screen 
                name="DetalheReceita" 
                component={PrescriptionDetailScreen} 
                options={{ title: 'Detalhes da Receita' }} 
              />
              <Stack.Screen 
                name="EditarReceita" 
                component={AddPrescriptionScreen} 
                options={{ title: 'Editar Receita' }} 
              />
              <Stack.Screen 
                name="Relatórios" 
                component={ReportsScreen} 
                options={{ title: 'Relatórios' }} 
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PrescriptionProvider>
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
