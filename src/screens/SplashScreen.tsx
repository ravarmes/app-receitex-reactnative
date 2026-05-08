import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Entrada: escala + fade do logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 55,
        friction: 7,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => {
      // Após logo aparecer, animar o texto
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    });

    // Fade out da tela inteira após 2.2 segundos
    const exitTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => {
        onFinish();
      });
    }, 2200);

    return () => clearTimeout(exitTimer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Círculo decorativo de fundo */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/icon2-512-512.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Texto */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>RECEITEX</Text>
          <Text style={styles.tagline}>Suas receitas, organizadas</Text>
        </Animated.View>
      </View>

      {/* Rodapé */}
      <Animated.Text style={[styles.footer, { opacity: textOpacity }]}>
        v1.0.6
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0E7C78',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  circleTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 22,
  },
  textWrapper: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: 'rgba(255,255,255,0.40)',
    letterSpacing: 0.5,
  },
});
