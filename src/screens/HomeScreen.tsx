import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Button, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePhrases } from '../context/PhraseContext';
import { useNavigation } from '@react-navigation/native';

const FeatureCard = ({ title, icon, description, onPress, color }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Surface style={[styles.featureCard, { borderLeftColor: color }]} elevation={2}>
        <View style={styles.featureIconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
      </Surface>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { phrases } = usePhrases();
  const theme = useTheme();
  const navigation = useNavigation();

  // Get random motivational phrase if available
  const randomPhrase = phrases && phrases.length > 0 
    ? phrases[Math.floor(Math.random() * phrases.length)]
    : null;

  // Get phrase stats
  const totalPhrases = phrases ? phrases.length : 0;
  const totalFavorites = phrases ? phrases.filter(p => p.favorite).length : 0;
  
  // Calculate average rating
  const avgRating = phrases && phrases.length > 0
    ? (phrases.reduce((sum, phrase) => sum + phrase.rating, 0) / phrases.length).toFixed(1)
    : '0.0';

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <Text style={styles.headerTitle}>Frases Inspiradoras</Text>
        <Text style={styles.headerSubtitle}>Seu acervo pessoal de motivação</Text>
      </Surface>

      {randomPhrase && (
        <Card style={styles.quoteCard}>
          <Card.Content>
            <Text style={styles.quoteText}>"{randomPhrase.text}"</Text>
            <Text style={styles.quoteAuthor}>— {randomPhrase.author}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="text-box-multiple" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{totalPhrases}</Text>
          <Text style={styles.statLabel}>Frases</Text>
        </Surface>
        
        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="heart" size={24} color="#f43f5e" />
          <Text style={styles.statValue}>{totalFavorites}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </Surface>
        
        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="star" size={24} color="#eab308" />
          <Text style={styles.statValue}>{avgRating}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </Surface>
      </View>

      <Text style={styles.sectionTitle}>O que você deseja fazer?</Text>
      
      <FeatureCard
        title="Adicionar Nova Frase" 
        icon="plus-circle"
        description="Cadastre uma nova frase ou citação inspiradora"
        onPress={() => navigation.navigate('Adicionar')}
        color="#6366f1"
      />
      
      <FeatureCard
        title="Ver Frases Salvas" 
        icon="text"
        description="Acesse seu acervo pessoal de frases motivacionais"
        onPress={() => navigation.navigate('Frases')}
        color="#0ea5e9"
      />
      
      <FeatureCard
        title="Consultar Relatórios" 
        icon="chart-bar"
        description="Visualize estatísticas e acompanhe suas coleções"
        onPress={() => navigation.navigate('Relatórios')}
        color="#10b981"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 24,
    backgroundColor: '#6366f1',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  quoteCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#6366f1',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 16,
    textAlign: 'right',
    marginTop: 12,
    color: '#555',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    color: '#333',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderLeftWidth: 4,
  },
  featureIconContainer: {
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
  },
}); 