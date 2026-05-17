import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Alert, Image, Modal,
  TouchableOpacity, StatusBar, Share, Platform,
} from 'react-native';
import { Text, Surface, Divider, Chip, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import adConfig from '../utils/adConfig';
import { useIap } from '../contexts/IapContext';
import { useThemeMode } from '../context/ThemeContext';

const buildShareText = (prescription: {
  doctorName: string;
  patientName: string;
  appointmentDate: string;
  symptomDescription: string;
  symptomCategories: string[];
}) => {
  const categories = prescription.symptomCategories.join(', ') || '—';
  const description = prescription.symptomDescription || '—';
  return [
    '🏥 Receita Médica — Receitex',
    '',
    `Médico:       Dr(a). ${prescription.doctorName}`,
    `Paciente:     ${prescription.patientName}`,
    `Consulta:     ${prescription.appointmentDate}`,
    `Sintomas:     ${description}`,
    `Categorias:   ${categories}`,
    '',
    '— Exportado pelo app Receitex',
  ].join('\n');
};

const buildPDFHtml = (prescription: {
  doctorName: string;
  patientName: string;
  appointmentDate: string;
  symptomDescription: string;
  symptomCategories: string[];
  createdAt: string;
}) => {
  const categories = prescription.symptomCategories
    .map(c => `<span style="background:#DDEEED;color:#075454;padding:2px 8px;border-radius:4px;margin-right:6px;font-size:13px;">${c}</span>`)
    .join('');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #1e293b; }
    h1 { color: #0E7C78; font-size: 22px; border-bottom: 2px solid #0E7C78; padding-bottom: 8px; }
    .label { font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 16px; }
    .value { font-size: 16px; color: #1e293b; margin-top: 4px; }
    .categories { margin-top: 4px; }
    footer { margin-top: 48px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>🏥 Receita Médica</h1>
  <div class="label">Médico</div>
  <div class="value">Dr(a). ${prescription.doctorName}</div>
  <div class="label">Paciente</div>
  <div class="value">${prescription.patientName}</div>
  <div class="label">Data da Consulta</div>
  <div class="value">${prescription.appointmentDate}</div>
  <div class="label">Sintomas</div>
  <div class="value">${prescription.symptomDescription || '—'}</div>
  <div class="label">Categorias</div>
  <div class="categories">${categories || '—'}</div>
  <footer>Exportado pelo app Receitex em ${new Date(prescription.createdAt).toLocaleDateString('pt-BR')}</footer>
</body>
</html>`;
};

export default function PrescriptionDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { getPrescriptionById, deletePrescription } = usePrescriptions();
  const { isAdFree } = useIap();
  const { isDark, toggleTheme, colors } = useThemeMode();
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [shareMenuVisible, setShareMenuVisible] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

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

  const handleShareText = async () => {
    if (!prescription) return;
    setShareMenuVisible(false);
    try {
      await Share.share({
        message: buildShareText(prescription),
        title: 'Receita Médica',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!prescription) return;
    setShareMenuVisible(false);
    setExportingPDF(true);
    try {
      // Dynamic import to avoid issues if package is not installed
      const RNHTMLtoPDF = require('react-native-html-to-pdf').default;
      const html = buildPDFHtml(prescription);
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: `receita_${prescription.id}`,
        directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
      });
      if (file.filePath) {
        await Share.share({
          url: Platform.OS === 'ios' ? file.filePath : `file://${file.filePath}`,
          title: 'Receita em PDF',
        });
      }
    } catch (error) {
      Alert.alert(
        'Exportar PDF',
        'Não foi possível gerar o PDF. Use "Compartilhar como texto" como alternativa.',
      );
    } finally {
      setExportingPDF(false);
    }
  };

  useLayoutEffect(() => {
    if (!prescription) return;
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightRow}>
          <TouchableOpacity onPress={() => setShareMenuVisible(true)} style={styles.headerBtn}>
            <MaterialCommunityIcons name="share-variant" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerBtn}>
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={22}
              color="white"
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, prescription, isDark, toggleTheme]);

  if (!prescription) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.iconMuted} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Receita não encontrada</Text>
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Share menu modal */}
      <Modal
        visible={shareMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareMenuVisible(false)}
      >
        <TouchableOpacity
          style={[styles.shareOverlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setShareMenuVisible(false)}
        />
        <View style={[styles.shareSheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.shareTitle, { color: colors.text }]}>Exportar receita</Text>
          <Divider style={{ backgroundColor: colors.border, marginBottom: 8 }} />

          <TouchableOpacity style={styles.shareOption} onPress={handleShareText}>
            <View style={[styles.shareOptionIcon, { backgroundColor: colors.primaryBg }]}>
              <MaterialCommunityIcons name="text-box-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.shareOptionContent}>
              <Text style={[styles.shareOptionTitle, { color: colors.text }]}>Compartilhar como texto</Text>
              <Text style={[styles.shareOptionDesc, { color: colors.textSecondary }]}>
                Envie os dados via WhatsApp, e-mail ou outros apps
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareOption} onPress={handleExportPDF} disabled={exportingPDF}>
            <View style={[styles.shareOptionIcon, { backgroundColor: '#FFF0F0' }]}>
              <MaterialCommunityIcons name="file-pdf-box" size={24} color="#E53E3E" />
            </View>
            <View style={styles.shareOptionContent}>
              <Text style={[styles.shareOptionTitle, { color: colors.text }]}>
                {exportingPDF ? 'Gerando PDF...' : 'Exportar como PDF'}
              </Text>
              <Text style={[styles.shareOptionDesc, { color: colors.textSecondary }]}>
                Gera um arquivo PDF da receita para salvar ou compartilhar
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => setShareMenuVisible(false)}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Photo section */}
      {prescription.photoURI ? (
        <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.9}>
          <Image source={{ uri: prescription.photoURI }} style={styles.photo} resizeMode="cover" />
          <View style={styles.photoHint}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={18} color="white" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.noPhotoContainer, { backgroundColor: colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="image-outline" size={32} color={colors.iconMuted} />
          <Text style={[styles.noPhotoText, { color: colors.textTertiary }]}>Nenhuma foto anexada</Text>
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
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setImageModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: prescription.photoURI! }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* Main info card */}
      <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="prescription" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Detalhes da Receita</Text>
          </View>
        </View>
        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.fieldRow}>
          <MaterialCommunityIcons name="doctor" size={22} color={colors.primary} />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Médico</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>Dr(a). {prescription.doctorName}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <MaterialCommunityIcons name="account" size={22} color={colors.primary} />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Paciente</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{prescription.patientName}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <MaterialCommunityIcons name="calendar" size={22} color={colors.primary} />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Data da Consulta</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{prescription.appointmentDate || '—'}</Text>
          </View>
        </View>
      </Surface>

      {/* Symptoms card */}
      <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="stethoscope" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sintomas</Text>
          </View>
        </View>
        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

        {prescription.symptomDescription ? (
          <Text style={[styles.descriptionText, { color: colors.text }]}>{prescription.symptomDescription}</Text>
        ) : (
          <Text style={[styles.emptyFieldText, { color: colors.textTertiary }]}>Nenhuma descrição informada</Text>
        )}

        {prescription.symptomCategories.length > 0 && (
          <View style={styles.categoriesContainer}>
            {prescription.symptomCategories.map((category, index) => (
              <Chip
                key={index}
                style={[styles.categoryChip, { backgroundColor: colors.chipBg }]}
                textStyle={[styles.categoryChipText, { color: colors.chipText }]}
              >
                {category}
              </Chip>
            ))}
          </View>
        )}
      </Surface>

      {/* Metadata */}
      <Surface style={[styles.metaCard, { backgroundColor: colors.surfaceVariant }]} elevation={0}>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            Criado em: {new Date(prescription.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        {prescription.updatedAt && prescription.updatedAt !== prescription.createdAt && (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="update" size={14} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              Atualizado em: {new Date(prescription.updatedAt).toLocaleDateString('pt-BR')}
            </Text>
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
          contentStyle={styles.buttonContent}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="pencil" size={size} color={color} />
          )}
        >
          Editar Receita
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={[styles.deleteButton, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerBg }]}
          labelStyle={[styles.deleteButtonLabel, { color: colors.danger }]}
          contentStyle={styles.buttonContent}
          icon={({ size }) => (
            <MaterialCommunityIcons name="delete-outline" size={size} color={colors.danger} />
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
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 6,
    marginRight: 4,
  },
  // Share modal
  shareOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shareSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    elevation: 8,
  },
  shareTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  shareOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOptionContent: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareOptionDesc: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Photo
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  noPhotoText: {
    fontSize: 13,
  },
  // Cards
  card: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
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
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 17,
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 25,
  },
  emptyFieldText: {
    fontSize: 15,
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
  },
  categoryChipText: {
    fontSize: 13,
  },
  metaCard: {
    marginHorizontal: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  editButton: {
    flex: 2,
    backgroundColor: '#0E7C78',
    borderRadius: 10,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 10,
  },
  deleteButtonLabel: {
    fontSize: 14,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 15,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0E7C78',
  },
});
