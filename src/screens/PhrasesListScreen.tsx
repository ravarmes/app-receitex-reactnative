import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, ScrollView, Platform, Alert } from 'react-native';
import { Card, Searchbar, Chip, Text, Surface, Divider, Menu, Button, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// Para funcionalidade de áudio, usar react-native-sound (opcional, mas não incluindo aqui)
import { Rating } from 'react-native-ratings';
import { usePhrases } from '../context/PhraseContext';

export default function PhrasesListScreen() {
  const { phrases, toggleFavorite, updateRating, deletePhrase } = usePhrases();
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'tags'
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  
  // Extract all unique tags from phrases
  const allTags = Array.from(
    new Set(phrases.flatMap(phrase => phrase.tags))
  ).sort();

  // Filter phrases based on search query and filters
  const filteredPhrases = phrases.filter(phrase => {
    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      phrase.text.toLowerCase().includes(searchLower) ||
      phrase.author.toLowerCase().includes(searchLower) ||
      phrase.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
    // Category filters
    if (!matchesSearch) return false;
    if (filter === 'favorites' && !phrase.favorite) return false;
    if (filter === 'tags' && selectedTag && !phrase.tags.includes(selectedTag)) return false;
    
    return true;
  });

  // Função para simular reprodução de áudio (versão simplificada)
  function playSound(audioUrl: string, phraseId: number) {
    console.log('Simulando reprodução de áudio para URL:', audioUrl);
    // Em uma implementação real, você usaria react-native-sound aqui
    setPlayingId(phraseId);
    
    // Simular finalização da reprodução
    setTimeout(() => {
      setPlayingId(null);
    }, 3000);
  }

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const renderFilterChips = () => (
    <View style={styles.filterChipsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip 
          selected={filter === 'all'} 
          onPress={() => { setFilter('all'); setSelectedTag(null); }}
          style={[styles.filterChip, filter === 'all' ? styles.selectedChip : null]}
          textStyle={filter === 'all' ? styles.selectedChipText : styles.chipText}
        >
          Todas
        </Chip>
        <Chip 
          selected={filter === 'favorites'} 
          onPress={() => { setFilter('favorites'); setSelectedTag(null); }}
          style={[styles.filterChip, filter === 'favorites' ? styles.selectedChip : null]}
          textStyle={filter === 'favorites' ? styles.selectedChipText : styles.chipText}
          icon={({size, color}) => (
            <MaterialCommunityIcons name="star" size={size} color={color} />
          )}
        >
          Favoritas
        </Chip>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Chip 
              selected={filter === 'tags'}
              onPress={() => setMenuVisible(true)}
              style={[styles.filterChip, filter === 'tags' ? styles.selectedChip : null]}
              textStyle={filter === 'tags' ? styles.selectedChipText : styles.chipText}
              icon={({size, color}) => (
                <MaterialCommunityIcons name="tag-multiple" size={size} color={color} />
              )}
            >
              {selectedTag || 'Categorias'}
            </Chip>
          }
          style={styles.tagMenu}
        >
          {allTags.map(tag => (
            <Menu.Item
              key={tag}
              title={tag}
              onPress={() => {
                setSelectedTag(tag);
                setFilter('tags');
                setMenuVisible(false);
              }}
              style={selectedTag === tag ? styles.selectedMenuItem : null}
              titleStyle={selectedTag === tag ? styles.selectedMenuItemText : null}
            />
          ))}
        </Menu>
      </ScrollView>
    </View>
  );

  const renderListHeader = () => (
    <View>
      <Surface style={styles.searchBarContainer} elevation={4}>
        <Searchbar
          placeholder="Buscar frases..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon={() => <MaterialCommunityIcons name="magnify" size={24} color="#666" />}
        />
      </Surface>
      
      {renderFilterChips()}
      
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {filteredPhrases.length} {filteredPhrases.length === 1 ? 'frase encontrada' : 'frases encontradas'}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item: phrase }) => {
    const isExpanded = expandedCardId === phrase.id;
    
    return (
      <Card 
        style={[styles.card, phrase.favorite ? styles.favoriteCard : null]} 
        onPress={() => toggleExpand(phrase.id)}
      >
        <Card.Content>
          <Text variant="bodyLarge" style={styles.phraseText}>
            {phrase.text}
          </Text>
          <Text variant="bodyMedium" style={styles.author}>
            — {phrase.author}
          </Text>
          
          <View style={styles.ratingContainer}>
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Rating
                type="star"
                startingValue={phrase.rating}
                imageSize={20}
                readonly={false}
                style={styles.rating}
                onFinishRating={(rating) => {
                  updateRating(phrase.id, rating);
                }}
              />
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.tagsContainer}>
                {phrase.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    style={styles.tag} 
                    textStyle={styles.tagText}
                    onPress={() => {
                      setFilter('tags');
                      setSelectedTag(tag);
                    }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </>
          )}
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(phrase.id);
            }}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name={phrase.favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={phrase.favorite ? '#f43f5e' : '#666'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                "Confirmar exclusão",
                "Tem certeza que deseja excluir esta frase?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  { 
                    text: "Excluir", 
                    onPress: () => deletePhrase(phrase.id),
                    style: "destructive"
                  }
                ]
              );
            }}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color="#666"
            />
          </TouchableOpacity>
          
          <View style={styles.expandIndicator}>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </View>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPhrases}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="text-box-search-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma frase encontrada</Text>
            <Text style={styles.emptySubText}>Experimente outros termos de busca ou filtros</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchBarContainer: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: 'white',
  },
  filterChipsContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: '#6366f1',
  },
  chipText: {
    color: '#4b5563',
  },
  selectedChipText: {
    color: 'white',
  },
  tagMenu: {
    marginTop: 48,
  },
  selectedMenuItem: {
    backgroundColor: '#e0e7ff',
  },
  selectedMenuItemText: {
    color: '#4338ca',
    fontWeight: 'bold',
  },
  resultCount: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultCountText: {
    color: '#64748b',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: 'white',
    borderLeftWidth: 0,
  },
  favoriteCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
  },
  phraseText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#1e293b',
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
    marginBottom: 8,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e2e8f0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e7ff',
  },
  tagText: {
    color: '#4338ca',
  },
  actions: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  actionButton: {
    padding: 8,
  },
  expandIndicator: {
    flex: 1,
    alignItems: 'flex-end',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
}); 