import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useWasmModule, initWasmModule } from './wasmLoader';

/**
 * Exemplo de componente que simula uso de WASM no React Native CLI
 * 
 * Nota: Implementação completa de WASM no React Native CLI sem Expo
 * exigiria abordagens nativas específicas por plataforma
 */
export function WasmExample() {
  // Estado para armazenar o resultado do módulo WASM
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Versão simplificada que simula carregamento
  const { modulePath, isLoading } = useWasmModule(null);

  useEffect(() => {
    // Versão simulada para demonstração
    setTimeout(() => {
      setResult('Soma simulada WASM: 12 (5+7)');
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo WebAssembly (WASM)</Text>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Simulando carregamento WASM...</Text>
        </View>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {result && (
        <Text style={styles.resultText}>{result}</Text>
      )}
      
      <Text style={styles.note}>
        Nota: Implementação WASM completa no React Native CLI:
      </Text>
      <Text style={styles.noteItem}>
        1. Requer implementação nativa para Android e iOS
      </Text>
      <Text style={styles.noteItem}>
        2. É mais complexa que a versão Expo
      </Text>
      <Text style={styles.noteItem}>
        3. Esta é uma versão simulada para demonstração
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginVertical: 10,
  },
  note: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  noteItem: {
    marginLeft: 10,
    marginTop: 5,
    color: '#666',
  },
}); 