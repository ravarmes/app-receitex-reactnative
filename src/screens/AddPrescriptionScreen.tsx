import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TextInput, Platform, Keyboard,
  KeyboardAvoidingView, Alert, Image, TouchableOpacity, Modal, PermissionsAndroid,
} from 'react-native';
import { Button, Text, Surface, Chip, Card, Divider } from 'react-native-paper';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
import { useThemeMode } from '../context/ThemeContext';

export default function AddPrescriptionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { addPrescription, updatePrescription, getPrescriptionById } = usePrescriptions();
  const { colors } = useThemeMode();

  const editId = (route.params as any)?.prescriptionId as number | undefined;
  const isEditing = !!editId;
  const existingPrescription = editId ? getPrescriptionById(editId) : undefined;

  const [doctorName, setDoctorName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [symptomCategories, setSymptomCategories] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [photoURI, setPhotoURI] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = new Date();
  const [pickerDay, setPickerDay] = useState(today.getDate());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth() + 1);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { label: 'Janeiro', value: 1 },
    { label: 'Fevereiro', value: 2 },
    { label: 'Março', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Maio', value: 5 },
    { label: 'Junho', value: 6 },
    { label: 'Julho', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Setembro', value: 9 },
    { label: 'Outubro', value: 10 },
    { label: 'Novembro', value: 11 },
    { label: 'Dezembro', value: 12 },
  ];
  const years = Array.from({ length: 20 }, (_, i) => today.getFullYear() - 5 + i);

  useEffect(() => {
    if (existingPrescription) {
      setDoctorName(existingPrescription.doctorName);
      setPatientName(existingPrescription.patientName);
      setSymptomDescription(existingPrescription.symptomDescription);
      setSymptomCategories(existingPrescription.symptomCategories.join(', '));
      setAppointmentDate(existingPrescription.appointmentDate);
      setPhotoURI(existingPrescription.photoURI || '');
    }
  }, [existingPrescription?.id]);

  const handleSubmit = async () => {
    if (!doctorName.trim() || !patientName.trim()) return;

    const categoriesArray = symptomCategories
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat !== '');

    const prescriptionData = {
      doctorName: doctorName.trim(),
      patientName: patientName.trim(),
      symptomDescription: symptomDescription.trim(),
      symptomCategories: categoriesArray,
      appointmentDate: appointmentDate.trim() || new Date().toISOString().split('T')[0],
      photoURI: photoURI.trim() || undefined,
    };

    try {
      if (isEditing && editId) {
        await updatePrescription(editId, prescriptionData);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.goBack();
        }, 1500);
      } else {
        await addPrescription(prescriptionData);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setDoctorName('');
          setPatientName('');
          setSymptomDescription('');
          setSymptomCategories('');
          setAppointmentDate('');
          setPhotoURI('');
          Keyboard.dismiss();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      Alert.alert('Erro', 'Erro ao salvar receita. Por favor, tente novamente.');
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permissão de Câmera',
            message: 'O aplicativo precisa acessar sua câmera para tirar fotos da receita.',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Permitir',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permissão negada', 'Sem permissão de câmera não é possível tirar fotos.');
          return;
        }
      } catch (err) {
        console.warn('Erro ao solicitar permissão de câmera:', err);
        return;
      }
    }

    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: false, includeBase64: false, maxHeight: 2000, maxWidth: 2000 },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Erro ao abrir câmera', response.errorMessage || 'Verifique as permissões.');
          return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri) setPhotoURI(uri);
      },
    );
  };

  const confirmDatePicker = () => {
    const dd = String(pickerDay).padStart(2, '0');
    const mm = String(pickerMonth).padStart(2, '0');
    setAppointmentDate(`${dd}/${mm}/${pickerYear}`);
    setShowDatePicker(false);
  };

  const inputStyle = [
    styles.nativeInput,
    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText },
  ];

  const inputWithIconStyle = [
    styles.inputWithIcon,
    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
        {showSuccess && (
          <Card style={[styles.successCard, { backgroundColor: colors.successBg }]}>
            <Card.Content style={styles.successContent}>
              <MaterialCommunityIcons name="check-circle" size={26} color={colors.success} />
              <Text style={[styles.successText, { color: colors.successText }]}>
                {isEditing ? 'Receita atualizada com sucesso!' : 'Receita adicionada com sucesso!'}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Surface style={[styles.form, { backgroundColor: colors.surface }]} elevation={2}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {isEditing ? 'Editar Receita' : 'Nova Receita'}
          </Text>
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Photo section */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Foto da Receita</Text>
            {photoURI ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoURI }} style={styles.photoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhotoURI('')}>
                  <MaterialCommunityIcons name="close-circle" size={26} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity style={[styles.photoButton, { borderColor: colors.border, backgroundColor: colors.inputBg }]} onPress={handleTakePhoto}>
                <MaterialCommunityIcons name="camera" size={30} color={colors.primary} />
                <Text style={[styles.photoButtonText, { color: colors.primary }]}>Tirar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoButton, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
                onPress={() => {
                  launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response: ImagePickerResponse) => {
                    if (response.didCancel || response.errorCode) return;
                    const uri = response.assets?.[0]?.uri;
                    if (uri) setPhotoURI(uri);
                  });
                }}
              >
                <MaterialCommunityIcons name="image-multiple" size={30} color={colors.primary} />
                <Text style={[styles.photoButtonText, { color: colors.primary }]}>Galeria</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Médico</Text>
            <View style={inputWithIconStyle}>
              <MaterialCommunityIcons name="doctor" size={26} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField, { color: colors.inputText, borderWidth: 0 }]}
                placeholder="Nome do médico"
                placeholderTextColor={colors.inputPlaceholder}
                onChangeText={setDoctorName}
                value={doctorName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Paciente</Text>
            <View style={inputWithIconStyle}>
              <MaterialCommunityIcons name="account" size={26} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField, { color: colors.inputText, borderWidth: 0 }]}
                placeholder="Nome do paciente"
                placeholderTextColor={colors.inputPlaceholder}
                onChangeText={setPatientName}
                value={patientName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Data da Consulta</Text>
            <TouchableOpacity style={inputWithIconStyle} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <MaterialCommunityIcons name="calendar" size={26} color={colors.primary} style={styles.inputIcon} />
              <Text style={[
                styles.datePickerText,
                { color: appointmentDate ? colors.inputText : colors.inputPlaceholder },
              ]}>
                {appointmentDate || 'DD/MM/AAAA'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textTertiary} style={{ paddingRight: 10 }} />
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
            <TouchableOpacity style={styles.dateModalBackdrop} activeOpacity={1} onPress={() => setShowDatePicker(false)} />
            <View style={[styles.dateModalContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.dateModalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.dateModalCancel, { color: colors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[styles.dateModalTitle, { color: colors.text }]}>Selecionar Data</Text>
                <TouchableOpacity onPress={confirmDatePicker}>
                  <Text style={[styles.dateModalConfirm, { color: colors.primary }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerColumns}>
                <View style={styles.datePickerColumn}>
                  <Text style={[styles.datePickerColumnLabel, { color: colors.textTertiary }]}>Dia</Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerScroll}>
                    {days.map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.datePickerItem, pickerDay === d && { backgroundColor: colors.chipBg }]}
                        onPress={() => setPickerDay(d)}
                      >
                        <Text style={[
                          styles.datePickerItemText,
                          { color: colors.text },
                          pickerDay === d && { color: colors.chipText, fontWeight: '700' },
                        ]}>
                          {String(d).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={[styles.datePickerColumn, { flex: 2 }]}>
                  <Text style={[styles.datePickerColumnLabel, { color: colors.textTertiary }]}>Mês</Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerScroll}>
                    {months.map(m => (
                      <TouchableOpacity
                        key={m.value}
                        style={[styles.datePickerItem, pickerMonth === m.value && { backgroundColor: colors.chipBg }]}
                        onPress={() => setPickerMonth(m.value)}
                      >
                        <Text style={[
                          styles.datePickerItemText,
                          { color: colors.text },
                          pickerMonth === m.value && { color: colors.chipText, fontWeight: '700' },
                        ]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.datePickerColumn}>
                  <Text style={[styles.datePickerColumnLabel, { color: colors.textTertiary }]}>Ano</Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerScroll}>
                    {years.map(y => (
                      <TouchableOpacity
                        key={y}
                        style={[styles.datePickerItem, pickerYear === y && { backgroundColor: colors.chipBg }]}
                        onPress={() => setPickerYear(y)}
                      >
                        <Text style={[
                          styles.datePickerItemText,
                          { color: colors.text },
                          pickerYear === y && { color: colors.chipText, fontWeight: '700' },
                        ]}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Descrição dos Sintomas</Text>
            <TextInput
              style={[inputStyle, styles.multilineInput]}
              placeholder="Descreva os sintomas relatados..."
              placeholderTextColor={colors.inputPlaceholder}
              onChangeText={setSymptomDescription}
              value={symptomDescription}
              multiline
              autoCapitalize="sentences"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Categorias de Sintomas</Text>
            <View style={inputWithIconStyle}>
              <MaterialCommunityIcons name="tag-multiple" size={26} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField, { color: colors.inputText, borderWidth: 0, height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Ex: dor de cabeça, febre, alergia (separadas por vírgula)"
                placeholderTextColor={colors.inputPlaceholder}
                onChangeText={setSymptomCategories}
                value={symptomCategories}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
            </View>
          </View>

          {symptomCategories ? (
            <View style={styles.chipContainer}>
              {symptomCategories
                .split(',')
                .map(cat => cat.trim())
                .filter(cat => cat !== '')
                .map((cat, index) => (
                  <Chip key={index} style={[styles.chip, { backgroundColor: colors.chipBg }]} textStyle={{ color: colors.chipText }}>
                    {cat}
                  </Chip>
                ))}
            </View>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            disabled={!doctorName.trim() || !patientName.trim()}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="check" size={size} color={color} />
            )}
          >
            {isEditing ? 'Atualizar Receita' : 'Salvar receita'}
          </Button>
        </Surface>

        {!isEditing && (
          <View style={[styles.tipContainer, { backgroundColor: colors.tipBg, borderColor: colors.tipBorder }]}>
            <MaterialCommunityIcons name="lightbulb-outline" size={22} color={colors.primary} />
            <Text style={[styles.tipText, { color: colors.tipText }]}>
              Dica: Inclua o máximo de detalhes para facilitar a busca futura.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    marginBottom: 20,
    height: 1,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  nativeInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  multilineInput: {
    height: 96,
    textAlignVertical: 'top',
  },
  inputWithIconField: {
    flex: 1,
    padding: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#0E7C78',
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  successCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 15,
  },
  tipContainer: {
    margin: 16,
    marginTop: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  photoPreviewContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 13,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  dateModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dateModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: 420,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dateModalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  dateModalCancel: {
    fontSize: 15,
  },
  dateModalConfirm: {
    fontSize: 15,
    fontWeight: '700',
  },
  datePickerColumns: {
    flexDirection: 'row',
    height: 280,
    paddingHorizontal: 8,
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerColumnLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 8,
  },
  datePickerScroll: {
    width: '100%',
  },
  datePickerItem: {
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  datePickerItemText: {
    fontSize: 15,
  },
});
