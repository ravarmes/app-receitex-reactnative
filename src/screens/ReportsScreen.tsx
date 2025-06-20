import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, List, Surface, Divider, Avatar, Button, IconButton } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { usePhrases } from '../context/PhraseContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Componente para representar um gráfico de barras simples
const BarChart = ({ data, maxValue }) => {
  // Obter largura da tela
  const screenWidth = Dimensions.get('window').width;
  // Reservar espaço para o número (50 para o rótulo à esquerda + 40 para o valor à direita)
  const barMaxWidth = screenWidth - 140;
  // Reduzir o tamanho máximo das barras em 25%
  const barWidthMultiplier = 0.75; // 75% do tamanho original

  return (
    <View style={styles.chartContainer}>
      {data.map(([label, value], index) => (
        <View key={index} style={styles.barContainer}>
          <Text style={styles.barLabel}>{label}</Text>
          <View style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${Math.min(100, (value / maxValue) * 100 * barWidthMultiplier)}%`,
                  backgroundColor: getColorForIndex(index)
                }
              ]} 
            />
            <Text style={styles.barValue}>{value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Função para gerar cores diferentes para as barras
const getColorForIndex = (index) => {
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];
  return colors[index % colors.length];
};

export default function ReportsScreen() {
  const { phrases } = usePhrases();

  // Estatísticas gerais
  const totalPhrases = phrases.length;
  const favoritePhrases = phrases.filter(phrase => phrase.favorite).length;
  const averageRating = totalPhrases > 0 
    ? phrases.reduce((sum, phrase) => sum + phrase.rating, 0) / totalPhrases 
    : 0;

  // Top frases por avaliação
  const topRatedPhrases = [...phrases]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Distribuição por avaliação
  const ratingDistribution = [0, 0, 0, 0, 0, 0]; // índice 0 não usado, 1-5 para ratings
  phrases.forEach(phrase => {
    const rating = Math.round(phrase.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating]++;
    }
  });

  // Remover o elemento de índice 0
  ratingDistribution.shift();
  
  // Contagem por autor
  const authorCounts = phrases.reduce((acc, phrase) => {
    acc[phrase.author] = (acc[phrase.author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Contagem por tag
  const tagCounts = phrases.reduce((acc, phrase) => {
    phrase.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Ordenar autores e tags por contagem
  const sortedAuthors = Object.entries(authorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Preparar dados para gráficos
  const ratingData = Array.from({ length: 5 }, (_, i) => [
    `${i + 1} ★`, 
    ratingDistribution[i]
  ]);
  
  const maxRatingCount = Math.max(...ratingDistribution);
  const maxAuthorCount = sortedAuthors.length > 0 ? sortedAuthors[0][1] : 0;
  const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Cartão de visão geral */}
      <Surface style={styles.overviewCard} elevation={3}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="chart-areaspline" size={28} color="#6366f1" />
          <Text variant="headlineSmall" style={styles.cardTitle}>
            Visão Geral
          </Text>
        </View>
        <Divider style={styles.divider} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <MaterialCommunityIcons name="text-box-multiple" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>{totalPhrases}</Text>
            <Text style={styles.statLabel}>Total de Frases</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
              <MaterialCommunityIcons name="heart" size={24} color="#f43f5e" />
            </View>
            <Text style={styles.statValue}>{favoritePhrases}</Text>
            <Text style={styles.statLabel}>Favoritas</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="star" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avaliação Média</Text>
          </View>
        </View>
      </Surface>

      {/* Gráfico de distribuição por avaliação */}
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="star-half-full" size={24} color="#6366f1" />
          <Text variant="titleMedium" style={styles.cardTitle}>
            Distribuição por Avaliação
          </Text>
        </View>
        <Divider style={styles.divider} />
        
        <BarChart data={ratingData} maxValue={maxRatingCount} />
      </Surface>

      {/* Top frases */}
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="format-quote-open" size={24} color="#6366f1" />
          <Text variant="titleMedium" style={styles.cardTitle}>
            Frases Mais Bem Avaliadas
          </Text>
        </View>
        <Divider style={styles.divider} />
        
        {topRatedPhrases.length > 0 ? (
          topRatedPhrases.map((phrase, index) => (
            <Card key={phrase.id} style={styles.phraseCard}>
              <Card.Content>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text variant="bodyLarge" style={styles.phraseText}>
                  {phrase.text}
                </Text>
                <Text variant="bodyMedium" style={styles.author}>
                  — {phrase.author}
                </Text>
                <View style={styles.ratingContainer}>
                  <Rating
                    type="star"
                    startingValue={phrase.rating}
                    imageSize={20}
                    readonly={true}
                    style={styles.rating}
                  />
                  <Text variant="bodyMedium" style={styles.ratingValue}>
                    {phrase.rating.toFixed(1)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma frase adicionada ainda</Text>
          </View>
        )}
      </Surface>

      {/* Top autores */}
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="account-group" size={24} color="#6366f1" />
          <Text variant="titleMedium" style={styles.cardTitle}>
            Autores Mais Frequentes
          </Text>
        </View>
        <Divider style={styles.divider} />
        
        {sortedAuthors.length > 0 ? (
          <BarChart data={sortedAuthors} maxValue={maxAuthorCount} />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sem dados suficientes</Text>
          </View>
        )}
      </Surface>

      {/* Top categorias */}
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="tag-multiple" size={24} color="#6366f1" />
          <Text variant="titleMedium" style={styles.cardTitle}>
            Categorias Mais Populares
          </Text>
        </View>
        <Divider style={styles.divider} />
        
        {sortedTags.length > 0 ? (
          <BarChart data={sortedTags} maxValue={maxTagCount} />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sem categorias adicionadas</Text>
          </View>
        )}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  overviewCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    marginLeft: 8,
    color: '#1e293b',
    fontWeight: '600',
  },
  divider: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  chartContainer: {
    padding: 16,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 80,
    marginRight: 8,
    fontSize: 14,
    textAlign: 'right',
    color: '#64748b',
  },
  barWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 25, // Garantir espaço mínimo para o valor
  },
  phraseCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    position: 'relative',
  },
  phraseText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingRight: 16,
  },
  author: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginRight: 8,
  },
  ratingValue: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  rankBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
}); 