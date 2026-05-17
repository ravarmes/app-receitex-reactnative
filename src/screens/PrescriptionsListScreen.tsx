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
import { useThemeMode } from '../context/ThemeContext';

type SortOrder = 'newest' | 'oldest' | 'doctorAZ' | 'patientAZ';

export default function PrescriptionsListScreen() {
  const { prescriptions, deletePrescription } = usePrescriptions();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isAdFree } = useIap();
  const { colors } = useThemeMode();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [doctorMenuVisible, setDoctorMenuVisible] = useState(false);
  const [patientMenuVisible, setPatientMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

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

  const filteredPrescriptions = useMemo(() => {
    const filtered = prescriptions.filter(prescription => {
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

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'doctorAZ':
          return a.doctorName.localeCompare(b.doctorName, 'pt-BR');
        case 'patientAZ':
          return a.patientName.localeCompare(b.patientName, 'pt-BR');
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [prescriptions, searchQuery, selectedDoctor, selectedPatient, selectedCategory, dateFilter, sortOrder]);

  const sortLabels: Record<SortOrder, string> = {
    newest: 'Mais recentes',
    oldest: 'Mais antigas',
    doctorAZ: 'Médico A→Z',
    patientAZ: 'Paciente A→Z',
  };

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
          style={[
            styles.filterChip,
            { backgroundColor: selected ? colors.primary : colors.surface },
          ]}
          textStyle={[
            styles.chipText,
            { color: selected ? 'white' : colors.textSecondary },
          ]}
          icon={({ size, color }) => (
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
          style={selected === option ? { backgroundColor: colors.chipBg } : undefined}
          titleStyle={selected === option ? { color: colors.chipText, fontWeight: 'bold' } : { color: colors.text }}
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
              style={[styles.activeFilterChip, { backgroundColor: colors.chipBg }]}
              textStyle={[styles.activeFilterChipText, { color: colors.chipText }]}
              icon={({ size }) => <MaterialCommunityIcons name="doctor" size={size} color={colors.primary} />}
            >
              {selectedDoctor}
            </Chip>
          )}
          {selectedPatient && (
            <Chip
              onClose={() => setSelectedPatient(null)}
              style={[styles.activeFilterChip, { backgroundColor: colors.chipBg }]}
              textStyle={[styles.activeFilterChipText, { color: colors.chipText }]}
              icon={({ size }) => <MaterialCommunityIcons name="account" size={size} color={colors.primaryLight} />}
            >
              {selectedPatient}
            </Chip>
          )}
          {selectedCategory && (
            <Chip
              onClose={() => setSelectedCategory(null)}
              style={[styles.activeFilterChip, { backgroundColor: colors.chipBg }]}
              textStyle={[styles.activeFilterChipText, { color: colors.chipText }]}
              icon={({ size }) => <MaterialCommunityIcons name="tag" size={size} color={colors.primaryLighter} />}
            >
              {selectedCategory}
            </Chip>
          )}
          {dateFilter && (
            <Chip
              onClose={() => setDateFilter('')}
              style={[styles.activeFilterChip, { backgroundColor: colors.chipBg }]}
              textStyle={[styles.activeFilterChipText, { color: colors.chipText }]}
              icon={({ size }) => <MaterialCommunityIcons name="calendar" size={size} color={colors.warning} />}
            >
              {dateFilter}
            </Chip>
          )}
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
            <Text style={[styles.clearAllText, { color: colors.primary }]}>Limpar tudo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderListHeader = () => (
    <View>
      <Surface style={[styles.searchBarContainer, { backgroundColor: colors.surface }]} elevation={1}>
        <Searchbar
          placeholder="Buscar por nome, data, sintoma..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          inputStyle={[styles.searchBarInput, { color: colors.text }]}
          placeholderTextColor={colors.inputPlaceholder}
          icon={() => <MaterialCommunityIcons name="magnify" size={22} color={colors.iconSecondary} />}
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
            style={[styles.filterChip, { backgroundColor: dateFilter ? colors.primary : colors.surface }]}
            textStyle={[styles.chipText, { color: dateFilter ? 'white' : colors.textSecondary }]}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="calendar-search" size={size} color={color} />
            )}
          >
            Data
          </Chip>
        </ScrollView>
      </View>

      {showDateInput && (
        <View style={[styles.dateInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="calendar" size={20} color={colors.iconSecondary} style={styles.dateInputIcon} />
          <TextInput
            placeholder="Filtrar por data (ex: 03/2026, 2026)"
            value={dateFilter}
            onChangeText={setDateFilter}
            style={[styles.dateInput, { color: colors.text }]}
            placeholderTextColor={colors.inputPlaceholder}
            autoFocus
          />
          {dateFilter ? (
            <TouchableOpacity onPress={() => { setDateFilter(''); setShowDateInput(false); }}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {renderActiveFilters()}

      <View style={styles.resultCountRow}>
        <Text style={[styles.resultCountText, { color: colors.textSecondary }]}>
          {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
        </Text>

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setSortMenuVisible(true)}
              style={[styles.sortButton, { backgroundColor: colors.primaryBg }]}
            >
              <MaterialCommunityIcons name="sort" size={16} color={colors.primary} />
              <Text style={[styles.sortButtonText, { color: colors.primary }]}>
                {sortLabels[sortOrder]}
              </Text>
            </TouchableOpacity>
          }
        >
          {(Object.keys(sortLabels) as SortOrder[]).map(key => (
            <Menu.Item
              key={key}
              title={sortLabels[key]}
              onPress={() => { setSortOrder(key); setSortMenuVisible(false); }}
              style={sortOrder === key ? { backgroundColor: colors.chipBg } : undefined}
              titleStyle={sortOrder === key
                ? { color: colors.chipText, fontWeight: 'bold', fontSize: 15 }
                : { color: colors.text, fontSize: 15 }}
              leadingIcon={sortOrder === key ? 'check' : undefined}
            />
          ))}
        </Menu>
      </View>
    </View>
  );

  const renderItem = ({ item: prescription }: { item: Prescription }) => {
    const isExpanded = expandedCardId === prescription.id;

    return (
      <Card
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('DetalheReceita', { prescriptionId: prescription.id })}
        onLongPress={() => toggleExpand(prescription.id)}
      >
        <Card.Content>
          <View style={styles.prescriptionHeader}>
            <MaterialCommunityIcons name="doctor" size={20} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.doctorName, { color: colors.text }]}>
              Dr(a). {prescription.doctorName}
            </Text>
          </View>
          <View style={styles.prescriptionMeta}>
            <MaterialCommunityIcons name="account" size={17} color={colors.iconSecondary} />
            <Text variant="bodyMedium" style={[styles.metaText, { color: colors.textSecondary }]}>
              {prescription.patientName}
            </Text>
          </View>
          <View style={styles.prescriptionMeta}>
            <MaterialCommunityIcons name="calendar" size={17} color={colors.iconSecondary} />
            <Text variant="bodyMedium" style={[styles.metaText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
              {prescription.appointmentDate}
            </Text>
          </View>

          {prescription.symptomDescription ? (
            <Text variant="bodyMedium" style={[styles.descriptionText, { color: colors.textSecondary }]} numberOfLines={2}>
              {prescription.symptomDescription}
            </Text>
          ) : null}

          {isExpanded && (
            <>
              <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.categoriesContainer}>
                {prescription.symptomCategories.map((category, index) => (
                  <Chip
                    key={index}
                    style={[styles.categoryChip, { backgroundColor: colors.chipBg }]}
                    textStyle={[styles.categoryChipText, { color: colors.chipText }]}
                    onPress={() => setSelectedCategory(category)}
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
            <MaterialCommunityIcons name="pencil-outline" size={26} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                'Confirmar exclusão',
                'Tem certeza que deseja excluir esta receita?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    onPress: () => deletePrescription(prescription.id),
                    style: 'destructive',
                  },
                ],
              );
            }}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons name="delete-outline" size={26} color={colors.iconSecondary} />
          </TouchableOpacity>

          <View style={styles.expandIndicator}>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={26}
              color={colors.textTertiary}
            />
          </View>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="prescription" size={64} color={colors.iconMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma receita encontrada</Text>
            <Text style={[styles.emptySubText, { color: colors.textTertiary }]}>Experimente outros termos de busca ou filtros</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchBar: {
    elevation: 0,
    height: 52,
  },
  searchBarInput: {
    fontSize: 15,
    minHeight: 52,
  },
  filterChipsContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
  },
  dropdownMenu: {
    marginTop: 48,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 1,
    borderWidth: 1,
  },
  dateInputIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  activeFilterChip: {
    marginRight: 8,
  },
  activeFilterChipText: {
    fontSize: 13,
  },
  clearAllButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  clearAllText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultCountText: {
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  doctorName: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  prescriptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 13,
  },
  actions: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  actionButton: {
    padding: 10,
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
    fontSize: 17,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 21,
  },
});
