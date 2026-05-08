import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Platform, Keyboard, KeyboardAvoidingView, Alert, Image, TouchableOpacity, Modal, PermissionsAndroid } from 'react-native';
import { Button, Text, Surface, Chip, Card, Divider } from 'react-native-paper';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';

export default function AddPrescriptionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { addPrescription, updatePrescription, getPrescriptionById } = usePrescriptions();

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

  // Date picker state – default to today
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

  // Populate fields when editing
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

  const handleDoctorNameChange = (value: string) => {
    setDoctorName(value);
  };

  const handlePatientNameChange = (value: string) => {
    setPatientName(value);
  };

  const handleSymptomDescriptionChange = (value: string) => {
    setSymptomDescription(value);
  };

  const handleCategoriesChange = (value: string) => {
    setSymptomCategories(value);
  };

  const handleSubmit = async () => {
    if (!doctorName.trim() || !patientName.trim()) {
      return;
    }

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
        await addPrescription({
          ...prescriptionData,
        });
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
          Alert.alert(
            'Permissão negada',
            'Sem permissão de câmera não é possível tirar fotos. Habilite nas configurações do dispositivo.',
          );
          return;
        }
      } catch (err) {
        console.warn('Erro ao solicitar permissão de câmera:', err);
        return;
      }
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(
            'Erro ao abrir câmera',
            response.errorMessage ||
              'Não foi possível abrir a câmera. Verifique as permissões nas configurações do dispositivo.',
          );
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

  const renderCategoryChips = () => {
    if (!symptomCategories) return null;

    return (
      <View style={styles.chipContainer}>
        {symptomCategories
          .split(',')
          .map(cat => cat.trim())
          .filter(cat => cat !== '')
          .map((cat, index) => (
            <Chip
              key={index}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {cat}
            </Chip>
          ))}
      </View>
    );
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
              <Text style={styles.successText}>
                {isEditing ? 'Receita atualizada com sucesso!' : 'Receita adicionada com sucesso!'}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Surface style={styles.form} elevation={2}>
          <Text style={styles.formTitle}>{isEditing ? 'Editar Receita' : 'Nova Receita'}</Text>
          <Divider style={styles.divider} />

          {/* Photo section */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Foto da Receita</Text>
            {photoURI ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoURI }} style={styles.photoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhotoURI('')}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleTakePhoto}
              >
                <MaterialCommunityIcons name="camera" size={28} color="#0E7C78" />
                <Text style={styles.photoButtonText}>Tirar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => {
                  launchImageLibrary(
                    { mediaType: 'photo', quality: 0.8 },
                    (response: ImagePickerResponse) => {
                      if (response.didCancel || response.errorCode) return;
                      const uri = response.assets?.[0]?.uri;
                      if (uri) setPhotoURI(uri);
                    },
                  );
                }}
              >
                <MaterialCommunityIcons name="image-multiple" size={28} color="#0E7C78" />
                <Text style={styles.photoButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Médico</Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons name="doctor" size={24} color="#0E7C78" style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField]}
                placeholder="Nome do médico"
                onChangeText={handleDoctorNameChange}
                value={doctorName}
                autoCapitalize="words"
                keyboardType="default"
                textContentType="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Paciente</Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons name="account" size={24} color="#0E7C78" style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField]}
                placeholder="Nome do paciente"
                onChangeText={handlePatientNameChange}
                value={patientName}
                autoCapitalize="words"
                keyboardType="default"
                textContentType="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Data da Consulta</Text>
            <TouchableOpacity
              style={styles.inputWithIcon}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="calendar" size={24} color="#0E7C78" style={styles.inputIcon} />
              <Text style={[
                styles.datePickerText,
                !appointmentDate && styles.datePickerPlaceholder,
              ]}>
                {appointmentDate || 'DD/MM/AAAA'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#94a3b8" style={{ paddingRight: 10 }} />
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.dateModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.dateModalContainer}>
              <View style={styles.dateModalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.dateModalCancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.dateModalTitle}>Selecionar Data</Text>
                <TouchableOpacity onPress={confirmDatePicker}>
                  <Text style={styles.dateModalConfirm}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerColumns}>
                {/* Day column */}
                <View style={styles.datePickerColumn}>
                  <Text style={styles.datePickerColumnLabel}>Dia</Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerScroll}>
                    {days.map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.datePickerItem,
                          pickerDay === d && styles.datePickerItemSelected,
                        ]}
                        onPress={() => setPickerDay(d)}
                      >
                        <Text style={[
                          styles.datePickerItemText,
                          pickerDay === d && styles.datePickerItemTextSelected,
                        ]}>
                          {String(d).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {/* Month column */}
                <View style={[styles.datePickerColumn, { flex: 2 }]}>
                  <Text style={styles.datePickerColumnLabel}>Mês</Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerScroll}>
                    {months.map(m => (
                      <TouchableOpacity
                        key={m.value}
                        style={[
                          styles.datePickerItem,
                          pickerMonth === m.value && styles.datePickerItemSelected,
                        ]}
                        onPress={() => setPickerMonth(m.value)}
                      >
                        <Text style={[
                          styles.datePickerItemText,
                          pickerMonth === m.value && styles.datePickerItemTextSelected,
                        ]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {/* Year column */}
                <View style={styles.datePickerColumn}>
                  <Text style={styles.datePickerColumnLabel}>Ano</Text>
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerScroll}>
                    {years.map(y => (
                      <TouchableOpacity
                        key={y}
                        style={[
                          styles.datePickerItem,
                          pickerYear === y && styles.datePickerItemSelected,
                        ]}
                        onPress={() => setPickerYear(y)}
                      >
                        <Text style={[
                          styles.datePickerItemText,
                          pickerYear === y && styles.datePickerItemTextSelected,
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
            <Text style={styles.inputLabel}>Descrição dos Sintomas</Text>
            <TextInput
              style={[styles.nativeInput, styles.multilineInput]}
              placeholder="Descreva os sintomas relatados..."
              onChangeText={handleSymptomDescriptionChange}
              value={symptomDescription}
              multiline={true}
              autoCapitalize="sentences"
              keyboardType="default"
              textContentType="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Categorias de Sintomas</Text>
            <View style={styles.inputWithIcon}>
              <MaterialCommunityIcons name="tag-multiple" size={24} color="#0E7C78" style={styles.inputIcon} />
              <TextInput
                style={[styles.nativeInput, styles.inputWithIconField, { height: 90, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Ex: dor de cabeça, febre, alergia (separadas por vírgula)"
                onChangeText={handleCategoriesChange}
                value={symptomCategories}
                autoCapitalize="none"
                keyboardType="default"
                textContentType="none"
                autoCorrect={false}
                multiline={true}
              />
            </View>
          </View>

          {renderCategoryChips()}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.buttonLabel}
            disabled={!doctorName.trim() || !patientName.trim()}
            icon={({size, color}) => (
              <MaterialCommunityIcons name="check" size={size} color={color} />
            )}
          >
            {isEditing ? 'Atualizar Receita' : 'Salvar receita'}
          </Button>
        </Surface>

        {!isEditing && (
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#0E7C78" />
            <Text style={styles.tipText}>
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
    backgroundColor: '#F5F7F7',
  },
  form: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e293b',
    textAlign: 'center',
  },
  divider: {
    marginBottom: 20,
    backgroundColor: '#e2e8f0',
    height: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  nativeInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#DDEEED',
  },
  chipText: {
    color: '#075454',
  },
  submitButton: {
    marginTop: 12,
    paddingVertical: 4,
    backgroundColor: '#0E7C78',
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
    paddingVertical: 2,
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
    marginTop: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDEEED',
  },
  tipText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#075454',
    flex: 1,
    lineHeight: 18,
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
    backgroundColor: '#e2e8f0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
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
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginTop: 6,
    fontSize: 13,
    color: '#0E7C78',
    fontWeight: '600',
  },
  // Date picker styles
  datePickerText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  datePickerPlaceholder: {
    color: '#94a3b8',
  },
  dateModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dateModalContainer: {
    backgroundColor: 'white',
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
    borderBottomColor: '#e2e8f0',
  },
  dateModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateModalCancel: {
    fontSize: 15,
    color: '#64748b',
  },
  dateModalConfirm: {
    fontSize: 15,
    color: '#0E7C78',
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
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 8,
  },
  datePickerScroll: {
    width: '100%',
  },
  datePickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  datePickerItemSelected: {
    backgroundColor: '#DDEEED',
  },
  datePickerItemText: {
    fontSize: 15,
    color: '#374151',
  },
  datePickerItemTextSelected: {
    color: '#075454',
    fontWeight: '700',
  },
});
