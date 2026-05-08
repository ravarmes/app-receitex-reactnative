import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface, useTheme, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { useIap } from '../contexts/IapContext';

interface FeatureCardProps {
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
}

const FeatureCard = ({ title, icon, description, onPress }: FeatureCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={styles.featureCard} elevation={1}>
        <View style={styles.featureIconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color="#0E7C78" />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
      </Surface>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { prescriptions } = usePrescriptions();
  const theme = useTheme();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { isAdFree, isLoading, purchaseRemoveAds } = useIap();

  const latestPrescription = prescriptions && prescriptions.length > 0
    ? prescriptions[0]
    : null;

  const totalPrescriptions = prescriptions ? prescriptions.length : 0;

  const uniqueDoctors = prescriptions
    ? new Set(prescriptions.map(p => p.doctorName)).size
    : 0;

  const uniquePatients = prescriptions
    ? new Set(prescriptions.map(p => p.patientName)).size
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerBrand}>
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoText}>R</Text>
          </View>
          <Text style={styles.headerBrandName}>RECEITEX</Text>
        </View>
        <Text style={styles.headerTitle}>Suas receitas, organizadas</Text>
        <Text style={styles.headerSubtitle}>
          Acompanhe medicamentos, médicos e consultas em um só lugar.
        </Text>
      </Surface>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="prescription" size={22} color="#0E7C78" />
          <Text style={styles.statValue}>{totalPrescriptions}</Text>
          <Text style={styles.statLabel}>Receitas</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="doctor" size={22} color="#0E7C78" />
          <Text style={styles.statValue}>{uniqueDoctors}</Text>
          <Text style={styles.statLabel}>Médicos</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="account-group" size={22} color="#0E7C78" />
          <Text style={styles.statValue}>{uniquePatients}</Text>
          <Text style={styles.statLabel}>Pacientes</Text>
        </Surface>
      </View>

      {latestPrescription && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DetalheReceita', { prescriptionId: latestPrescription.id })}
        >
          <Card style={styles.latestCard}>
            <Card.Content>
              <View style={styles.latestHeader}>
                <Text style={styles.latestLabel}>Última receita</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#0E7C78" />
              </View>
              <Text style={styles.latestDoctor}>Dr(a). {latestPrescription.doctorName}</Text>
              <Text style={styles.latestPatient}>{latestPrescription.patientName} — {latestPrescription.appointmentDate}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}

      {!isAdFree && (
        <TouchableOpacity
          style={styles.premiumCard}
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

      <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>

      <FeatureCard
        title="Adicionar receita"
        icon="plus"
        description="Cadastre uma nova receita médica"
        onPress={() => navigation.navigate('Adicionar')}
      />

      <FeatureCard
        title="Ver receitas salvas"
        icon="prescription"
        description="Acesse suas receitas armazenadas"
        onPress={() => navigation.navigate('Receitas')}
      />

      <FeatureCard
        title="Consultar relatórios"
        icon="chart-bar"
        description="Estatísticas e histórico"
        onPress={() => navigation.navigate('Relatórios')}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Receitex v0.4.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F7',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: '#0E7C78',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 0,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  headerBrandName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.90)',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    lineHeight: 32,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 20,
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
    paddingVertical: 14,
    paddingHorizontal: 8,
    margin: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  latestCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: 'white',
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
    fontSize: 11,
    color: '#0E7C78',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  latestPatient: {
    fontSize: 13,
    marginTop: 4,
    color: '#64748b',
  },
  premiumCard: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
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
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
    color: '#64748b',
    letterSpacing: 1.0,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E0F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
