import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Card, Searchbar, Chip, Text, Surface, Divider, Menu } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePrescriptions, Prescription } from '../context/PrescriptionContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import adConfig from '../utils/adConfig';
import { useIap } from '../contexts/IapContext';

export default function PrescriptionsListScreen() {
  const { prescriptions, deletePrescription } = usePrescriptions();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isAdFree } = useIap();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [doctorMenuVisible, setDoctorMenuVisible] = useState(false);
  const [patientMenuVisible, setPatientMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  // Extract unique values for filter dropdowns
  const allDoctors = useMemo(() =>
    Array.from(new Set(prescriptions.map(p => p.doctorName))).sort(),
    [prescriptions]
  );
  const allPatients = useMemo(() =>
    Array.from(new Set(prescriptions.map(p => p.patientName))).sort(),
    [prescriptions]
  );
  const allCategories = useMemo(() =>
    Array.from(new Set(prescriptions.flatMap(p => p.symptomCategories))).sort(),
    [prescriptions]
  );

  const hasActiveFilters = !!selectedDoctor || !!selectedPatient || !!selectedCategory || !!dateFilter;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDoctor(null);
    setSelectedPatient(null);
    setSelectedCategory(null);
    setDateFilter('');
  };

  // Filter prescriptions — all filters are combinable
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      // Text search across all relevant fields
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          prescription.doctorName.toLowerCase().includes(q) ||
          prescription.patientName.toLowerCase().includes(q) ||
          prescription.symptomDescription.toLowerCase().includes(q) ||
          prescription.appointmentDate.toLowerCase().includes(q) ||
          prescription.symptomCategories.some(cat => cat.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (selectedDoctor && prescription.doctorName !== selectedDoctor) return false;
      if (selectedPatient && prescription.patientName !== selectedPatient) return false;
      if (selectedCategory && !prescription.symptomCategories.includes(selectedCategory)) return false;
      if (dateFilter && !prescription.appointmentDate.toLowerCase().includes(dateFilter.toLowerCase())) return false;

      return true;
    });
  }, [prescriptions, searchQuery, selectedDoctor, selectedPatient, selectedCategory, dateFilter]);

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const renderFilterDropdown = (
    label: string,
    icon: string,
    visible: boolean,
    setVisible: (v: boolean) => void,
    selected: string | null,
    setSelected: (v: string | null) => void,
    options: string[],
  ) => (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Chip
          selected={!!selected}
          onPress={() => setVisible(true)}
          style={[styles.filterChip, selected ? styles.selectedChip : null]}
          textStyle={selected ? styles.selectedChipText : styles.chipText}
          icon={({size, color}) => (
            <MaterialCommunityIcons name={icon} size={size} color={color} />
          )}
        >
          {selected || label}
        </Chip>
      }
      style={styles.dropdownMenu}
    >
      {options.map(option => (
        <Menu.Item
          key={option}
          title={option}
          onPress={() => {
            setSelected(option);
            setVisible(false);
          }}
          style={selected === option ? styles.selectedMenuItem : null}
          titleStyle={selected === option ? styles.selectedMenuItemText : null}
        />
      ))}
    </Menu>
  );

  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedDoctor && (
            <Chip
              onClose={() => setSelectedDoctor(null)}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterChipText}
              icon={({size}) => <MaterialCommunityIcons name="doctor" size={size} color="#6366f1" />}
            >
              {selectedDoctor}
            </Chip>
          )}
          {selectedPatient && (
            <Chip
              onClose={() => setSelectedPatient(null)}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterChipText}
              icon={({size}) => <MaterialCommunityIcons name="account" size={size} color="#0ea5e9" />}
            >
              {selectedPatient}
            </Chip>
          )}
          {selectedCategory && (
            <Chip
              onClose={() => setSelectedCategory(null)}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterChipText}
              icon={({size}) => <MaterialCommunityIcons name="tag" size={size} color="#10b981" />}
            >
              {selectedCategory}
            </Chip>
          )}
          {dateFilter && (
            <Chip
              onClose={() => setDateFilter('')}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterChipText}
              icon={({size}) => <MaterialCommunityIcons name="calendar" size={size} color="#f59e0b" />}
            >
              {dateFilter}
            </Chip>
          )}
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Limpar tudo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderListHeader = () => (
    <View>
      <Surface style={styles.searchBarContainer} elevation={1}>
        <Searchbar
          placeholder="Buscar por nome, data, sintoma..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
          icon={() => <MaterialCommunityIcons name="magnify" size={22} color="#64748b" />}
        />
      </Surface>

      <View style={styles.filterChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterDropdown('Médico', 'doctor', doctorMenuVisible, setDoctorMenuVisible, selectedDoctor, setSelectedDoctor, allDoctors)}
          {renderFilterDropdown('Paciente', 'account', patientMenuVisible, setPatientMenuVisible, selectedPatient, setSelectedPatient, allPatients)}
          {renderFilterDropdown('Categoria', 'tag-multiple', categoryMenuVisible, setCategoryMenuVisible, selectedCategory, setSelectedCategory, allCategories)}

          <Chip
            selected={!!dateFilter}
            onPress={() => setShowDateInput(!showDateInput)}
            style={[styles.filterChip, dateFilter ? styles.selectedChip : null]}
            textStyle={dateFilter ? styles.selectedChipText : styles.chipText}
            icon={({size, color}) => (
              <MaterialCommunityIcons name="calendar-search" size={size} color={color} />
            )}
          >
            Data
          </Chip>
        </ScrollView>
      </View>

      {showDateInput && (
        <View style={styles.dateInputContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#64748b" style={styles.dateInputIcon} />
          <TextInput
            placeholder="Filtrar por data (ex: 03/2026, 2026)"
            value={dateFilter}
            onChangeText={setDateFilter}
            style={styles.dateInput}
            placeholderTextColor="#94a3b8"
            autoFocus
          />
          {dateFilter ? (
            <TouchableOpacity onPress={() => { setDateFilter(''); setShowDateInput(false); }}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {renderActiveFilters()}

      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item: prescription }: { item: Prescription }) => {
    const isExpanded = expandedCardId === prescription.id;
    
    return (
      <Card 
        style={styles.card} 
        onPress={() => navigation.navigate('DetalheReceita', { prescriptionId: prescription.id })}
        onLongPress={() => toggleExpand(prescription.id)}
      >
        <Card.Content>
          <View style={styles.prescriptionHeader}>
            <MaterialCommunityIcons name="doctor" size={20} color="#6366f1" />
            <Text variant="titleMedium" style={styles.doctorName}>
              Dr(a). {prescription.doctorName}
            </Text>
          </View>
          <View style={styles.prescriptionMeta}>
            <MaterialCommunityIcons name="account" size={16} color="#64748b" />
            <Text variant="bodyMedium" style={styles.patientName}>
              {prescription.patientName}
            </Text>
          </View>
          <View style={styles.prescriptionMeta}>
            <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
            <Text variant="bodyMedium" style={styles.appointmentDate}>
              {prescription.appointmentDate}
            </Text>
          </View>

          {prescription.symptomDescription ? (
            <Text variant="bodyMedium" style={styles.descriptionText} numberOfLines={2}>
              {prescription.symptomDescription}
            </Text>
          ) : null}

          {isExpanded && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.categoriesContainer}>
                {prescription.symptomCategories.map((category, index) => (
                  <Chip 
                    key={index} 
                    style={styles.categoryChip} 
                    textStyle={styles.categoryChipText}
                    onPress={() => {
                      setSelectedCategory(category);
                    }}
                  >
                    {category}
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
              navigation.navigate('EditarReceita', { prescriptionId: prescription.id });
            }}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={24}
              color="#6366f1"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                "Confirmar exclusão",
                "Tem certeza que deseja excluir esta receita?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  { 
                    text: "Excluir", 
                    onPress: () => deletePrescription(prescription.id),
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
        data={filteredPrescriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          !isAdFree && filteredPrescriptions.length > 0 ? (
            <View style={styles.listAdContainer}>
              <BannerAd
                unitId={adConfig.getBannerAdId()}
                size={BannerAdSize.LARGE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="prescription" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma receita encontrada</Text>
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
    backgroundColor: 'white',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: 'white',
    height: 48,
  },
  searchBarInput: {
    fontSize: 14,
    minHeight: 48,
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
  dropdownMenu: {
    marginTop: 48,
  },
  selectedMenuItem: {
    backgroundColor: '#e0e7ff',
  },
  selectedMenuItemText: {
    color: '#4338ca',
    fontWeight: 'bold',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
  },
  dateInputIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    padding: 0,
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: '#e0e7ff',
  },
  activeFilterChipText: {
    color: '#4338ca',
    fontSize: 12,
  },
  clearAllButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  clearAllText: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 13,
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
  listAdContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: 'white',
    borderLeftWidth: 0,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  doctorName: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  prescriptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  patientName: {
    marginLeft: 8,
    color: '#64748b',
  },
  appointmentDate: {
    marginLeft: 8,
    color: '#64748b',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    color: '#64748b',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e2e8f0',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e7ff',
  },
  categoryChipText: {
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
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
