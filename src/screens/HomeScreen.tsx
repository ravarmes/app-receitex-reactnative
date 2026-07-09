import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { useIap } from '../contexts/IapContext';
import { useThemeMode } from '../context/ThemeContext';

interface FeatureCardProps {
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const { prescriptions } = usePrescriptions();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isAdFree, isLoading, purchaseRemoveAds } = useIap();
  const { isDark, toggleTheme, colors } = useThemeMode();

  const latestPrescription = prescriptions && prescriptions.length > 0
    ? prescriptions[0]
    : null;

  const totalPrescriptions = prescriptions ? prescriptions.length : 0;
  const uniqueDoctors = prescriptions ? new Set(prescriptions.map(p => p.doctorName)).size : 0;
  const uniquePatients = prescriptions ? new Set(prescriptions.map(p => p.patientName)).size : 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia!';
    if (hour < 18) return 'Boa tarde!';
    return 'Boa noite!';
  }, []);

  const relativeTime = (iso: string) => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return 'hoje';
    if (days === 1) return 'ontem';
    if (days < 30) return `há ${days} dias`;
    const months = Math.floor(days / 30);
    return months === 1 ? 'há 1 mês' : `há ${months} meses`;
  };
  const FeatureCard = ({ title, icon, description, onPress }: FeatureCardProps) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={[styles.featureCard, { backgroundColor: colors.surface }]} elevation={1}>
        <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryBg }]}>
          <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
        </View>
        <View style={styles.featureContent}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
      </Surface>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: colors.headerBg }]} elevation={0}>
        <View style={styles.headerBrand}>
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoText}>R</Text>
          </View>
          <Text style={styles.headerBrandName}>RECEITEX</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={toggleTheme} style={styles.headerThemeToggle}>
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={22}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Suas receitas, organizadas</Text>
        <Text style={styles.headerSubtitle}>
          {greeting} Acompanhe medicamentos, médicos e consultas em um só lugar.
        </Text>
      </Surface>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={1}>
          <MaterialCommunityIcons name="prescription" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{totalPrescriptions}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Receitas</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={1}>
          <MaterialCommunityIcons name="doctor" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{uniqueDoctors}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Médicos</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={1}>
          <MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{uniquePatients}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pacientes</Text>
        </Surface>
      </View>

      {latestPrescription && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DetalheReceita', { prescriptionId: latestPrescription.id })}
        >
          <Card style={[styles.latestCard, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.latestHeader}>
                <Text style={[styles.latestLabel, { color: colors.primary }]}>Última receita</Text>
                <View style={styles.latestHeaderRight}>
                  <Text style={[styles.latestWhen, { color: colors.textTertiary }]}>
                    {relativeTime(latestPrescription.createdAt)}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
                </View>
              </View>
              <Text style={[styles.latestDoctor, { color: colors.text }]}>Dr(a). {latestPrescription.doctorName}</Text>
              <Text style={[styles.latestPatient, { color: colors.textSecondary }]}>
                {latestPrescription.patientName} — {latestPrescription.appointmentDate}
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}

      {!isAdFree && (
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: colors.gold }]}
          onPress={purchaseRemoveAds}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.premiumText}>👑 Remover Anúncios para Sempre</Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AÇÕES RÁPIDAS</Text>

      <FeatureCard
        title="Adicionar receita"
        icon="plus"
        description="Cadastre uma nova receita médica"
        onPress={() => navigation.navigate('Adicionar')}
      />

      <FeatureCard
        title="Ver receitas salvas"
        icon="prescription"
        description={totalPrescriptions > 0 ? `${totalPrescriptions} receita${totalPrescriptions !== 1 ? 's' : ''} armazenada${totalPrescriptions !== 1 ? 's' : ''}` : 'Acesse suas receitas armazenadas'}
        onPress={() => navigation.navigate('Receitas')}
      />

      <FeatureCard
        title="Consultar relatórios"
        icon="chart-bar"
        description="Estatísticas e histórico"
        onPress={() => navigation.navigate('Relatórios')}
      />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>Receitex v1.0.11</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerLogoText: {
    fontSize: 19,
    fontWeight: '800',
    color: 'white',
  },
  headerBrandName: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.90)',
    letterSpacing: 1.2,
  },
  headerThemeToggle: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    lineHeight: 34,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    margin: 4,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  latestCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0E7C78',
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  latestLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  latestWhen: {
    fontSize: 12,
  },
  latestDoctor: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  latestPatient: {
    fontSize: 14,
    marginTop: 4,
  },
  premiumCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  premiumText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 1.0,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
