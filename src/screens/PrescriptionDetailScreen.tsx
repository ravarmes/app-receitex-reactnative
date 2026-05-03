import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Modal, TouchableOpacity, StatusBar } from 'react-native';
import { Text, Surface, Divider, Chip, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import adConfig from '../utils/adConfig';
import { useIap } from '../contexts/IapContext';

export default function PrescriptionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { getPrescriptionById, deletePrescription } = usePrescriptions();
  const { isAdFree } = useIap();
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const interstitial = useMemo(() => {
    if (isAdFree) return null;
    return InterstitialAd.createForAdRequest(adConfig.getInterstitialAdId(), {
      requestNonPersonalizedAdsOnly: true,
    });
  }, [isAdFree]);

  useEffect(() => {
    if (!interstitial) {
      setInterstitialLoaded(false);
      return;
    }
    const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });
    const unsubClose = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      interstitial.load();
    });
    interstitial.load();
    return () => {
      unsubLoad();
      unsubClose();
    };
  }, [interstitial]);

  const { prescriptionId } = route.params as { prescriptionId: number };
  const prescription = getPrescriptionById(prescriptionId);

  if (!prescription) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyText}>Receita não encontrada</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Voltar
        </Button>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deletePrescription(prescription.id);
            if (!isAdFree && interstitial && interstitialLoaded) {
              interstitial.show();
            }
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditarReceita', { prescriptionId: prescription.id });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return dateString;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Photo section */}
      {prescription.photoURI ? (
        <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
          <Image source={{ uri: prescription.photoURI }} style={styles.photo} resizeMode="cover" />
          <View style={styles.photoHint}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={18} color="white" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noPhotoContainer}>
          <MaterialCommunityIcons name="image-outline" size={32} color="#cbd5e1" />
          <Text style={styles.noPhotoText}>Nenhuma foto anexada</Text>
        </View>
      )}

      {/* Full-screen image modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: prescription.photoURI! }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Main info card */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="prescription" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Detalhes da Receita</Text>
          </View>
        </View>
        <Divider style={styles.divider} />

        <View style={styles.fieldRow}>
          <MaterialCommunityIcons name="doctor" size={20} color="#6366f1" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Médico</Text>
            <Text style={styles.fieldValue}>Dr(a). {prescription.doctorName}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <MaterialCommunityIcons name="account" size={20} color="#6366f1" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Paciente</Text>
            <Text style={styles.fieldValue}>{prescription.patientName}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#6366f1" />
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Data da Consulta</Text>
            <Text style={styles.fieldValue}>{formatDate(prescription.appointmentDate)}</Text>
          </View>
        </View>
      </Surface>

      {/* Symptoms card */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="stethoscope" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Sintomas</Text>
          </View>
        </View>
        <Divider style={styles.divider} />

        {prescription.symptomDescription ? (
          <Text style={styles.descriptionText}>{prescription.symptomDescription}</Text>
        ) : (
          <Text style={styles.emptyFieldText}>Nenhuma descrição informada</Text>
        )}

        {prescription.symptomCategories.length > 0 && (
          <View style={styles.categoriesContainer}>
            {prescription.symptomCategories.map((category, index) => (
              <Chip key={index} style={styles.categoryChip} textStyle={styles.categoryChipText}>
                {category}
              </Chip>
            ))}
          </View>
        )}
      </Surface>

      {/* Metadata card */}
      <Surface style={styles.metaCard} elevation={0}>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
          <Text style={styles.metaText}>Criado em: {new Date(prescription.createdAt).toLocaleDateString('pt-BR')}</Text>
        </View>
        {prescription.updatedAt && prescription.updatedAt !== prescription.createdAt && (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="update" size={14} color="#94a3b8" />
            <Text style={styles.metaText}>Atualizado em: {new Date(prescription.updatedAt).toLocaleDateString('pt-BR')}</Text>
          </View>
        )}
      </Surface>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={styles.editButton}
          labelStyle={styles.buttonLabel}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="pencil" size={size} color={color} />
          )}
        >
          Editar Receita
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.deleteButton}
          labelStyle={styles.deleteButtonLabel}
          icon={({ size }) => (
            <MaterialCommunityIcons name="delete-outline" size={size} color="#ef4444" />
          )}
        >
          Excluir
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  photo: {
    width: '100%',
    height: 220,
    backgroundColor: '#e2e8f0',
  },
  photoHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 6,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  noPhotoContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  noPhotoText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  card: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e2e8f0',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldContent: {
    marginLeft: 12,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1e293b',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  emptyFieldText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e7ff',
  },
  categoryChipText: {
    color: '#4338ca',
  },
  metaCard: {
    marginHorizontal: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  editButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    borderRadius: 10,
  },
  deleteButton: {
    flex: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    backgroundColor: '#fff5f5',
  },
  deleteButtonLabel: {
    color: '#ef4444',
  },
  buttonLabel: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#6366f1',
  },
});
