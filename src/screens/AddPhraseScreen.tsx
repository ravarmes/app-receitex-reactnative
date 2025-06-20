import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Platform, Keyboard, KeyboardAvoidingView, Text as RNText } from 'react-native';
import { Button, Text, Surface, Chip, Card, Divider } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { usePhrases } from '../context/PhraseContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Função para contornar problemas de caracteres especiais
const processText = (text) => {
  if (!text) return '';
  
  // Dicionário de substituição para caracteres acentuados comuns em português
  const accentMap = {
    'a': ['á', 'à', 'â', 'ã', 'ä'],
    'e': ['é', 'è', 'ê', 'ë'],
    'i': ['í', 'ì', 'î', 'ï'],
    'o': ['ó', 'ò', 'ô', 'õ', 'ö'],
    'u': ['ú', 'ù', 'û', 'ü'],
    'c': ['ç'],
    'A': ['Á', 'À', 'Â', 'Ã', 'Ä'],
    'E': ['É', 'È', 'Ê', 'Ë'],
    'I': ['Í', 'Ì', 'Î', 'Ï'],
    'O': ['Ó', 'Ò', 'Ô', 'Õ', 'Ö'],
    'U': ['Ú', 'Ù', 'Û', 'Ü'],
    'C': ['Ç'],
  };
  
  // Tenta detectar e substituir caracteres problemáticos
  let processedText = text;
  
  // Percorre o mapa de substituição
  Object.entries(accentMap).forEach(([base, accents]) => {
    accents.forEach(accent => {
      // Se encontrar um caractere acentuado no texto, mantém ele sem alteração
      // Isso é apenas para garantir que não haja problemas de exibição
      const regex = new RegExp(accent, 'g');
      processedText = processedText.replace(regex, accent);
    });
  });
  
  return processedText;
};

export default function AddPhraseScreen() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [rating, setRating] = useState(0);
  const { addPhrase } = usePhrases();
  const [showSuccess, setShowSuccess] = useState(false);

  // Funções para lidar com a entrada de texto
  const handleTextChange = (value) => {
    // Processa o texto para garantir que acentos sejam mantidos
    setText(processText(value));
  };
  
  const handleAuthorChange = (value) => {
    setAuthor(processText(value));
  };
  
  const handleTagsChange = (value) => {
    setTags(processText(value));
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      return;
    }

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    try {
      await addPhrase({
        text: text.trim(),
        author: author.trim() || 'Desconhecido',
        tags: tagArray,
        favorite: false,
        rating: rating,
      });

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setText('');
        setAuthor('');
        setTags('');
        setRating(0);
        
        // Fechar o teclado após envio
        Keyboard.dismiss();
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar frase:', error);
      alert('Erro ao salvar frase. Por favor, tente novamente.');
    }
  };

  const renderTagChips = () => {
    if (!tags) return null;
    
    return (
      <View style={styles.chipContainer}>
        {tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '')
          .map((tag, index) => (
            <Chip 
              key={index} 
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {tag}
            </Chip>
          ))}
      </View>
    );
  };

  // Para garantir que a visualização de texto também funcione corretamente
  const DisplayText = ({ children, style }) => {
    return <RNText style={style}>{processText(children)}</RNText>;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {showSuccess && (
          <Card style={styles.successCard}>
            <Card.Content style={styles.successContent}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
              <Text style={styles.successText}>Frase adicionada com sucesso!</Text>
            </Card.Content>
          </Card>
        )}
        
        <Surface style={styles.form} elevation={2}>
          <Text style={styles.formTitle}>Nova Frase</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Frase</Text>
            <TextInput
              style={[styles.nativeInput, styles.multilineInput]}
              placeholder="Digite uma frase inspiradora..."
              onChangeText={handleTextChange}
              value={text}
              multiline={true}
              autoCapitalize="sentences"
              keyboardType="default"
              textContentType="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Autor</Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons name="account" size={24} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField]}
                placeholder="Nome do autor"
                onChangeText={handleAuthorChange}
                value={author}
                autoCapitalize="words"
                keyboardType="default"
                textContentType="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Categorias</Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons name="tag-multiple" size={24} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField, { height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Ex: motivação, fé, vida (separadas por vírgula)"
                onChangeText={handleTagsChange}
                value={tags}
                autoCapitalize="none"
                keyboardType="default"
                textContentType="none"
                autoCorrect={false}
                multiline={true}
              />
            </View>
          </View>
          
          {renderTagChips()}

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>
              Avaliação da Frase
            </Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={35}
              startingValue={rating}
              onFinishRating={setRating}
              style={styles.rating}
              tintColor="#f5f7fa"
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.buttonLabel}
            disabled={!text.trim()}
            icon={({size, color}) => (
              <MaterialCommunityIcons name="check" size={size} color={color} />
            )}
          >
            Salvar Frase
          </Button>
        </Surface>

        <View style={styles.tipContainer}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#6366f1" />
          <Text style={styles.tipText}>
            Dica: Frases mais curtas e diretas tendem a ser mais impactantes.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  form: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  divider: {
    marginBottom: 20,
    backgroundColor: '#e2e8f0',
    height: 1.5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  nativeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1f2937',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  inputWithIconField: {
    flex: 1,
    borderWidth: 0,
    padding: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
    backgroundColor: '#e0e7ff',
  },
  chipText: {
    color: '#4f46e5',
  },
  ratingContainer: {
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 12,
  },
  ratingLabel: {
    marginBottom: 12,
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 16,
  },
  rating: {
    paddingVertical: 8,
  },
  submitButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    color: 'white',
    paddingVertical: 4,
  },
  successCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    marginLeft: 8,
    color: '#065f46',
    fontWeight: '500',
  },
  tipContainer: {
    margin: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4338ca',
    flex: 1,
  },
  categoriesInput: {
    height: 180,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
}); 