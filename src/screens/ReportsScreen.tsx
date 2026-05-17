import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Surface, Divider } from 'react-native-paper';
import { usePrescriptions, Prescription } from '../context/PrescriptionContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import adConfig from '../utils/adConfig';
import { useIap } from '../contexts/IapContext';
import { useThemeMode } from '../context/ThemeContext';

type BarChartProps = {
  data: [string, number][];
  maxValue: number;
  total: number;
  colors: string[];
  textColor: string;
  secondaryTextColor: string;
};

const BarChart = ({ data, maxValue, total, colors: chartColors, textColor, secondaryTextColor }: BarChartProps) => (
  <View style={styles.chartContainer}>
    {data.map(([label, value], index) => {
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      const fillPct = maxValue > 0 ? Math.min(100, (value / maxValue) * 92) : 0;
      return (
        <View key={index} style={styles.barRow}>
          <Text style={[styles.barLabel, { color: secondaryTextColor }]} numberOfLines={1}>{label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${fillPct}%`, backgroundColor: chartColors[index % chartColors.length] }]} />
          </View>
          <View style={styles.barMeta}>
            <Text style={[styles.barCount, { color: textColor }]}>{value}</Text>
            <Text style={[styles.barPct, { color: secondaryTextColor }]}>{pct}%</Text>
          </View>
        </View>
      );
    })}
  </View>
);

type MonthlyChartProps = {
  data: [string, number][];
  maxValue: number;
  primaryColor: string;
  textColor: string;
  secondaryTextColor: string;
  bgColor: string;
};

const MonthlyChart = ({ data, maxValue, primaryColor, textColor, secondaryTextColor, bgColor }: MonthlyChartProps) => (
  <View style={[styles.monthlyContainer, { backgroundColor: bgColor }]}>
    {data.map(([monthYear, value], index) => {
      const fillPct = maxValue > 0 ? Math.max(6, Math.round((value / maxValue) * 100)) : 6;
      return (
        <View key={index} style={styles.monthlyBarCol}>
          <Text style={[styles.monthlyCount, { color: textColor }]}>{value}</Text>
          <View style={styles.monthlyBarWrapper}>
            <View
              style={[
                styles.monthlyBar,
                {
                  height: `${fillPct}%`,
                  backgroundColor: primaryColor,
                  opacity: 0.6 + (index / data.length) * 0.4,
                },
              ]}
            />
          </View>
          <Text style={[styles.monthlyLabel, { color: secondaryTextColor }]}>{monthYear.substring(0, 3)}</Text>
        </View>
      );
    })}
  </View>
);

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function ReportsScreen() {
  const { prescriptions } = usePrescriptions();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isAdFree } = useIap();
  const { colors } = useThemeMode();

  const stats = useMemo(() => {
    const total = prescriptions.length;
    const uniqueDoctors = new Set(prescriptions.map(p => p.doctorName)).size;
    const uniquePatients = new Set(prescriptions.map(p => p.patientName)).size;
    const uniqueCategories = new Set(prescriptions.flatMap(p => p.symptomCategories)).size;

    const doctorCounts: Record<string, number> = {};
    const patientCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};

    prescriptions.forEach(p => {
      doctorCounts[p.doctorName] = (doctorCounts[p.doctorName] || 0) + 1;
      patientCounts[p.patientName] = (patientCounts[p.patientName] || 0) + 1;
      p.symptomCategories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const parts = p.appointmentDate?.split('/');
      if (parts && parts.length === 3) {
        const mm = parseInt(parts[1], 10);
        const yy = parts[2];
        if (mm >= 1 && mm <= 12 && yy) {
          const key = `${MONTH_ABBR[mm - 1]}/${yy.slice(2)}`;
          monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        }
      }
    });

    const sortedDoctors = Object.entries(doctorCounts).sort(([, a], [, b]) => b - a).slice(0, 5) as [string, number][];
    const sortedPatients = Object.entries(patientCounts).sort(([, a], [, b]) => b - a).slice(0, 5) as [string, number][];
    const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a).slice(0, 6) as [string, number][];

    const monthlyData = Object.entries(monthlyCounts)
      .sort(([a], [b]) => {
        const [am, ay] = a.split('/');
        const [bm, by] = b.split('/');
        const aMonthIdx = MONTH_ABBR.indexOf(am);
        const bMonthIdx = MONTH_ABBR.indexOf(bm);
        const aYear = parseInt(ay, 10);
        const bYear = parseInt(by, 10);
        if (aYear !== bYear) return aYear - bYear;
        return aMonthIdx - bMonthIdx;
      })
      .slice(-6) as [string, number][];

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
      monthlyData,
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
      <View style={[styles.recentDot, { backgroundColor: colors.primary }]} />
      <View style={styles.recentContent}>
        <Text style={[styles.recentDoctor, { color: colors.text }]} numberOfLines={1}>
          Dr(a). {prescription.doctorName}
        </Text>
        <Text style={[styles.recentMeta, { color: colors.textSecondary }]} numberOfLines={1}>
          {prescription.patientName} · {prescription.appointmentDate || formatDate(prescription.createdAt)}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.iconMuted} />
    </TouchableOpacity>
  );

  if (prescriptions.length === 0) {
    return (
      <View style={[styles.emptyScreen, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="chart-bar" size={64} color={colors.iconMuted} />
        <Text style={[styles.emptyScreenTitle, { color: colors.textSecondary }]}>Sem dados para exibir</Text>
        <Text style={[styles.emptyScreenSub, { color: colors.textTertiary }]}>
          Adicione receitas para ver relatórios e estatísticas.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Visão Geral */}
      <Surface style={[styles.overviewCard, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="chart-areaspline" size={22} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Visão geral</Text>
        </View>
        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
              <MaterialCommunityIcons name="prescription" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Receitas</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
              <MaterialCommunityIcons name="doctor" size={24} color={colors.primaryLight} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.uniqueDoctors}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Médicos</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
              <MaterialCommunityIcons name="account-group" size={24} color={colors.primaryLighter} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.uniquePatients}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pacientes</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg }]}>
              <MaterialCommunityIcons name="tag-multiple" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.uniqueCategories}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Categorias</Text>
          </View>
        </View>
      </Surface>

      {/* Distribuição Mensal */}
      {stats.monthlyData.length > 1 && (
        <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Distribuição Mensal</Text>
          </View>
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          <MonthlyChart
            data={stats.monthlyData}
            maxValue={Math.max(...stats.monthlyData.map(([, v]) => v))}
            primaryColor={colors.primary}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
            bgColor={colors.background}
          />
        </Surface>
      )}

      {/* Período dos registros */}
      {stats.oldest && stats.newest && (
        <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-range" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Período dos registros</Text>
          </View>
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: colors.textTertiary }]}>Mais antigo</Text>
              <Text style={[styles.timelineValue, { color: colors.text }]}>{formatDate(stats.oldest.createdAt)}</Text>
              <Text style={[styles.timelineSub, { color: colors.textSecondary }]} numberOfLines={1}>
                Dr(a). {stats.oldest.doctorName}
              </Text>
            </View>
            <View style={styles.timelineSeparator}>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.iconMuted} />
            </View>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: colors.textTertiary }]}>Mais recente</Text>
              <Text style={[styles.timelineValue, { color: colors.text }]}>{formatDate(stats.newest.createdAt)}</Text>
              <Text style={[styles.timelineSub, { color: colors.textSecondary }]} numberOfLines={1}>
                Dr(a). {stats.newest.doctorName}
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Receitas recentes */}
      <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="clock-outline" size={22} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Receitas recentes</Text>
        </View>
        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.recentList}>
          {stats.recentPrescriptions.map(renderRecentItem)}
        </View>
      </Surface>

      {!isAdFree && (
        <View style={styles.nativeAdContainer}>
          <BannerAd
            unitId={adConfig.getBannerAdId()}
            size={BannerAdSize.MEDIUM_RECTANGLE}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}

      {/* Top médicos */}
      <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="doctor" size={22} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Médicos mais frequentes</Text>
        </View>
        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
        {stats.sortedDoctors.length > 0 ? (
          <BarChart
            data={stats.sortedDoctors}
            maxValue={stats.sortedDoctors[0][1]}
            total={stats.total}
            colors={colors.chartColors}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Sem dados suficientes</Text>
          </View>
        )}
      </Surface>

      {/* Top pacientes */}
      {stats.sortedPatients.length > 1 && (
        <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-multiple" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Pacientes com mais receitas</Text>
          </View>
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          <BarChart
            data={stats.sortedPatients}
            maxValue={stats.sortedPatients[0][1]}
            total={stats.total}
            colors={colors.chartColors}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
          />
        </Surface>
      )}

      {/* Top categorias */}
      <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="tag-multiple" size={22} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Categorias mais comuns</Text>
        </View>
        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
        {stats.sortedCategories.length > 0 ? (
          <BarChart
            data={stats.sortedCategories}
            maxValue={stats.sortedCategories[0][1]}
            total={stats.total}
            colors={colors.chartColors}
            textColor={colors.text}
            secondaryTextColor={colors.textSecondary}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Sem categorias adicionadas</Text>
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
  },
  overviewCard: {
    margin: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  card: {
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 17,
  },
  divider: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  // Bar chart
  chartContainer: {
    padding: 16,
    paddingTop: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  barLabel: {
    width: 88,
    marginRight: 8,
    fontSize: 13,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(128,128,128,0.10)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barMeta: {
    width: 52,
    paddingLeft: 8,
    alignItems: 'flex-end',
  },
  barCount: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 17,
  },
  barPct: {
    fontSize: 11,
    lineHeight: 14,
  },
  // Monthly chart
  monthlyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 120,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  monthlyBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  monthlyCount: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  monthlyBarWrapper: {
    width: 24,
    height: 64,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  monthlyBar: {
    width: '100%',
    borderRadius: 4,
  },
  monthlyLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  // Timeline
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  timelineSub: {
    fontSize: 12,
    marginTop: 2,
  },
  // Recent prescriptions
  recentList: {
    paddingVertical: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentDoctor: {
    fontSize: 15,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 13,
    marginTop: 1,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyScreenTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyScreenSub: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 21,
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
  },
});
