import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Text, Surface, Divider } from 'react-native-paper';
import { usePrescriptions, Prescription } from '../context/PrescriptionContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import adConfig from '../utils/adConfig';

// Componente para representar um gráfico de barras simples
const BarChart = ({ data, maxValue }: { data: [string, number][]; maxValue: number }) => {
  const barWidthMultiplier = 0.75;

  return (
    <View style={styles.chartContainer}>
      {data.map(([label, value], index) => (
        <View key={index} style={styles.barContainer}>
          <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
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

const getColorForIndex = (index: number): string => {
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];
  return colors[index % colors.length];
};

export default function ReportsScreen() {
  const { prescriptions } = usePrescriptions();
  const navigation = useNavigation<RootStackNavigationProp>();

  const stats = useMemo(() => {
    const total = prescriptions.length;
    const uniqueDoctors = new Set(prescriptions.map(p => p.doctorName)).size;
    const uniquePatients = new Set(prescriptions.map(p => p.patientName)).size;
    const uniqueCategories = new Set(prescriptions.flatMap(p => p.symptomCategories)).size;

    // Contagem por médico
    const doctorCounts: Record<string, number> = {};
    // Contagem por paciente
    const patientCounts: Record<string, number> = {};
    // Contagem por categoria
    const categoryCounts: Record<string, number> = {};

    prescriptions.forEach(p => {
      doctorCounts[p.doctorName] = (doctorCounts[p.doctorName] || 0) + 1;
      patientCounts[p.patientName] = (patientCounts[p.patientName] || 0) + 1;
      p.symptomCategories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const sortedDoctors = Object.entries(doctorCounts).sort(([, a], [, b]) => b - a).slice(0, 5) as [string, number][];
    const sortedPatients = Object.entries(patientCounts).sort(([, a], [, b]) => b - a).slice(0, 5) as [string, number][];
    const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a).slice(0, 5) as [string, number][];

    // Receitas recentes (por createdAt)
    const sortedByDate = [...prescriptions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recentPrescriptions = sortedByDate.slice(0, 5);
    const oldest = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : null;
    const newest = sortedByDate.length > 0 ? sortedByDate[0] : null;

    return {
      total,
      uniqueDoctors,
      uniquePatients,
      uniqueCategories,
      sortedDoctors,
      sortedPatients,
      sortedCategories,
      recentPrescriptions,
      oldest,
      newest,
    };
  }, [prescriptions]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const renderRecentItem = (prescription: Prescription) => (
    <TouchableOpacity
      key={prescription.id}
      style={styles.recentItem}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('DetalheReceita', { prescriptionId: prescription.id })}
    >
      <View style={styles.recentDot} />
      <View style={styles.recentContent}>
        <Text style={styles.recentDoctor} numberOfLines={1}>Dr(a). {prescription.doctorName}</Text>
        <Text style={styles.recentMeta} numberOfLines={1}>
          {prescription.patientName} · {prescription.appointmentDate || formatDate(prescription.createdAt)}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  if (prescriptions.length === 0) {
    return (
      <View style={styles.emptyScreen}>
        <MaterialCommunityIcons name="chart-bar" size={64} color="#cbd5e1" />
        <Text style={styles.emptyScreenTitle}>Sem dados para exibir</Text>
        <Text style={styles.emptyScreenSub}>Adicione receitas para ver relatórios e estatísticas.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Visão Geral */}
      <Surface style={styles.overviewCard} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="chart-areaspline" size={22} color="#6366f1" />
          <Text style={styles.cardTitle}>Visão Geral</Text>
        </View>
        <Divider style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <MaterialCommunityIcons name="prescription" size={22} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Receitas</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
              <MaterialCommunityIcons name="doctor" size={22} color="#0ea5e9" />
            </View>
            <Text style={styles.statValue}>{stats.uniqueDoctors}</Text>
            <Text style={styles.statLabel}>Médicos</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
              <MaterialCommunityIcons name="account-group" size={22} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{stats.uniquePatients}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </View>
        </View>
      </Surface>

      {/* Período dos registros */}
      {stats.oldest && stats.newest && (
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-range" size={22} color="#6366f1" />
            <Text style={styles.cardTitle}>Período dos Registros</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Registro mais antigo</Text>
              <Text style={styles.timelineValue}>{formatDate(stats.oldest.createdAt)}</Text>
              <Text style={styles.timelineSub} numberOfLines={1}>Dr(a). {stats.oldest.doctorName}</Text>
            </View>
            <View style={styles.timelineSeparator}>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#cbd5e1" />
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Registro mais recente</Text>
              <Text style={styles.timelineValue}>{formatDate(stats.newest.createdAt)}</Text>
              <Text style={styles.timelineSub} numberOfLines={1}>Dr(a). {stats.newest.doctorName}</Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Receitas recentes */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="clock-outline" size={22} color="#6366f1" />
          <Text style={styles.cardTitle}>Receitas Recentes</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.recentList}>
          {stats.recentPrescriptions.map(renderRecentItem)}
        </View>
      </Surface>

      {/* Anúncio nativo entre seções */}
      <View style={styles.nativeAdContainer}>
        <BannerAd
          unitId={adConfig.getBannerAdId()}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>

      {/* Top médicos */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="doctor" size={22} color="#6366f1" />
          <Text style={styles.cardTitle}>Médicos Mais Frequentes</Text>
        </View>
        <Divider style={styles.divider} />
        {stats.sortedDoctors.length > 0 ? (
          <BarChart data={stats.sortedDoctors} maxValue={stats.sortedDoctors[0][1]} />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sem dados suficientes</Text>
          </View>
        )}
      </Surface>

      {/* Top pacientes */}
      {stats.sortedPatients.length > 1 && (
        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-multiple" size={22} color="#6366f1" />
            <Text style={styles.cardTitle}>Pacientes com Mais Receitas</Text>
          </View>
          <Divider style={styles.divider} />
          <BarChart data={stats.sortedPatients} maxValue={stats.sortedPatients[0][1]} />
        </Surface>
      )}

      {/* Top categorias */}
      <Surface style={styles.card} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="tag-multiple" size={22} color="#6366f1" />
          <Text style={styles.cardTitle}>Categorias Mais Comuns</Text>
        </View>
        <Divider style={styles.divider} />
        {stats.sortedCategories.length > 0 ? (
          <BarChart data={stats.sortedCategories} maxValue={stats.sortedCategories[0][1]} />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sem categorias adicionadas</Text>
          </View>
        )}
      </Surface>

      <View style={styles.footerSpacer} />
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
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  card: {
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'white',
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
    fontSize: 16,
  },
  divider: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  // Timeline / period card
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  timelineItem: {
    flex: 1,
  },
  timelineSeparator: {
    paddingHorizontal: 12,
  },
  timelineLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  timelineSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  // Recent prescriptions
  recentList: {
    paddingVertical: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentDoctor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  recentMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  // Bar charts
  chartContainer: {
    padding: 16,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 90,
    marginRight: 8,
    fontSize: 13,
    textAlign: 'right',
    color: '#475569',
  },
  barWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 25,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f5f7fa',
  },
  emptyScreenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptyScreenSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSpacer: {
    height: 16,
  },
  nativeAdContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
}); 