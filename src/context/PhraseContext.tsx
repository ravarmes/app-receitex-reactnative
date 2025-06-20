import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Phrase {
  id: number;
  text: string;
  author: string;
  tags: string[];
  favorite: boolean;
  audioURL?: string;
  rating: number;
  createdAt: string;
}

interface PhraseContextData {
  phrases: Phrase[];
  addPhrase: (phrase: Omit<Phrase, 'id' | 'createdAt'>) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  updateRating: (id: number, rating: number) => Promise<void>;
  deletePhrase: (id: number) => Promise<void>;
  getPhrasesByAuthor: (author: string) => Phrase[];
  getPhrasesByTag: (tag: string) => Phrase[];
  getFavoritePhrases: () => Phrase[];
  getTopRatedPhrases: () => Phrase[];
}

const PhraseContext = createContext<PhraseContextData>({} as PhraseContextData);

export const PhraseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);

  React.useEffect(() => {
    loadPhrases();
    
    return () => {
      if (phrases.length > 0) {
        savePhrases(phrases).catch(err => 
          console.error('Error during cleanup save:', err)
        );
      }
    };
  }, []);

  const loadPhrases = async () => {
    try {
      const storedPhrases = await AsyncStorage.getItem('@phrases');
      if (storedPhrases) {
        setPhrases(JSON.parse(storedPhrases));
      }
    } catch (error) {
      console.error('Error loading phrases:', error);
    }
  };

  const savePhrases = async (newPhrases: Phrase[]) => {
    try {
      const jsonValue = JSON.stringify(newPhrases, (key, value) => {
        if (typeof value === 'string') {
          return value;
        }
        return value;
      });
      await AsyncStorage.setItem('@phrases', jsonValue);
    } catch (error) {
      console.error('Error saving phrases:', error);
    }
  };

  const addPhrase = async (phrase: Omit<Phrase, 'id' | 'createdAt'>) => {
    try {
      const newPhrase: Phrase = {
        ...phrase,
        id: Date.now(),
        rating: phrase.rating || 0,
        createdAt: new Date().toISOString(),
      };
      const updatedPhrases = [newPhrase, ...phrases];
      setPhrases(updatedPhrases);
      await savePhrases(updatedPhrases);
    } catch (error) {
      console.error('Error adding phrase:', error);
    }
  };

  const toggleFavorite = async (id: number) => {
    try {
      const updatedPhrases = phrases.map(phrase =>
        phrase.id === id ? { ...phrase, favorite: !phrase.favorite } : phrase
      );
      setPhrases(updatedPhrases);
      await savePhrases(updatedPhrases);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const updateRating = async (id: number, rating: number) => {
    try {
      const updatedPhrases = phrases.map(phrase =>
        phrase.id === id ? { ...phrase, rating } : phrase
      );
      setPhrases(updatedPhrases);
      await savePhrases(updatedPhrases);
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const deletePhrase = async (id: number) => {
    try {
      const updatedPhrases = phrases.filter(phrase => phrase.id !== id);
      setPhrases(updatedPhrases);
      await savePhrases(updatedPhrases);
    } catch (error) {
      console.error('Error deleting phrase:', error);
    }
  };

  const getPhrasesByAuthor = (author: string) => {
    return phrases.filter(phrase => 
      phrase.author.toLowerCase().includes(author.toLowerCase())
    );
  };

  const getPhrasesByTag = (tag: string) => {
    return phrases.filter(phrase => 
      phrase.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  };

  const getFavoritePhrases = () => {
    return phrases.filter(phrase => phrase.favorite);
  };

  const getTopRatedPhrases = () => {
    return [...phrases].sort((a, b) => b.rating - a.rating);
  };

  return (
    <PhraseContext.Provider
      value={{
        phrases,
        addPhrase,
        toggleFavorite,
        updateRating,
        deletePhrase,
        getPhrasesByAuthor,
        getPhrasesByTag,
        getFavoritePhrases,
        getTopRatedPhrases,
      }}
    >
      {children}
    </PhraseContext.Provider>
  );
};

export const usePhrases = () => {
  const context = useContext(PhraseContext);
  if (!context) {
    throw new Error('usePhrases must be used within a PhraseProvider');
  }
  return context;
}; 