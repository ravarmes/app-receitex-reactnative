/**
 * App.tsx - Receitex - Organizador de Receitas Médicas
 */

import React, { useEffect, useState } from 'react';
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

import { PrescriptionProvider } from './src/context/PrescriptionContext';
import HomeScreen from './src/screens/HomeScreen';
import AddPrescriptionScreen from './src/screens/AddPrescriptionScreen';
import PrescriptionsListScreen from './src/screens/PrescriptionsListScreen';
import PrescriptionDetailScreen from './src/screens/PrescriptionDetailScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SplashScreen from './src/screens/SplashScreen';
import adConfig from './src/utils/adConfig';
import { IapProvider, useIap } from './src/contexts/IapContext';

const AppBannerAd = () => {
  const { isAdFree } = useIap();
  if (isAdFree) return null;

  const adUnitId = adConfig.getBannerAdId();
  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob SDK inicializado com sucesso');
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E7C78" />

      <PaperProvider>
        <PrescriptionProvider>
          <IapProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#0E7C78',
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
                  options={{ headerShown: false }}
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

            <AppBannerAd />

            {/* Splash screen sobreposta até animação terminar */}
            {splashVisible && (
              <SplashScreen onFinish={() => setSplashVisible(false)} />
            )}
          </IapProvider>
        </PrescriptionProvider>
      </PaperProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E7C78',
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F5F7F7',
    paddingVertical: 5,
  },
});

export default App;
