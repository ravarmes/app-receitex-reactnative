/**
 * App.tsx - Receitex - Organizador de Receitas Médicas
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { PrescriptionProvider } from './src/context/PrescriptionContext';
import { ThemeProvider, useThemeMode } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import AddPrescriptionScreen from './src/screens/AddPrescriptionScreen';
import PrescriptionsListScreen from './src/screens/PrescriptionsListScreen';
import PrescriptionDetailScreen from './src/screens/PrescriptionDetailScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SplashScreen from './src/screens/SplashScreen';
import adConfig from './src/utils/adConfig';
import { IapProvider, useIap } from './src/contexts/IapContext';

const Stack = createNativeStackNavigator();

const AppBannerAd = () => {
  const { isAdFree } = useIap();
  if (isAdFree) return null;

  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adConfig.getBannerAdId()}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

function ThemedApp(): React.JSX.Element {
  const [splashVisible, setSplashVisible] = useState(true);
  const { isDark, toggleTheme, colors, paperTheme } = useThemeMode();

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob SDK inicializado com sucesso');
      });
  }, []);

  const ThemeToggleButton = () => (
    <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
      <MaterialCommunityIcons
        name={isDark ? 'weather-sunny' : 'weather-night'}
        size={22}
        color="white"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.headerBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.statusBar} />

      <PaperProvider theme={paperTheme}>
        <PrescriptionProvider>
          <IapProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: colors.headerBg,
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerRight: () => <ThemeToggleButton />,
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

            {splashVisible && (
              <SplashScreen onFinish={() => setSplashVisible(false)} />
            )}
          </IapProvider>
        </PrescriptionProvider>
      </PaperProvider>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 5,
  },
  themeToggle: {
    marginRight: 12,
    padding: 4,
  },
});

export default App;
