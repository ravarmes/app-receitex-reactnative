import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePrescriptions } from '../context/PrescriptionContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';

interface FeatureCardProps {
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
  color: string;
}

const FeatureCard = ({ title, icon, description, onPress, color }: FeatureCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Surface style={[styles.featureCard, { borderLeftColor: color }]} elevation={2}>
        <View style={styles.featureIconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
      </Surface>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { prescriptions } = usePrescriptions();
  const theme = useTheme();
  const navigation = useNavigation<RootStackNavigationProp>();

  // Get latest prescription if available
  const latestPrescription = prescriptions && prescriptions.length > 0 
    ? prescriptions[0]
    : null;

  // Get prescription stats
  const totalPrescriptions = prescriptions ? prescriptions.length : 0;
  
  // Count unique doctors
  const uniqueDoctors = prescriptions 
    ? new Set(prescriptions.map(p => p.doctorName)).size
    : 0;

  // Count unique patients
  const uniquePatients = prescriptions
    ? new Set(prescriptions.map(p => p.patientName)).size
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <Text style={styles.headerTitle}>Receitex</Text>
        <Text style={styles.headerSubtitle}>Suas receitas médicas organizadas</Text>
      </Surface>

      {latestPrescription && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('DetalheReceita', { prescriptionId: latestPrescription.id })}
        >
          <Card style={styles.latestCard}>
            <Card.Content>
              <View style={styles.latestHeader}>
                <Text style={styles.latestLabel}>Última receita</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#6366f1" />
              </View>
              <Text style={styles.latestDoctor}>Dr(a). {latestPrescription.doctorName}</Text>
              <Text style={styles.latestPatient}>{latestPrescription.patientName} — {latestPrescription.appointmentDate}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}

      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="prescription" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{totalPrescriptions}</Text>
          <Text style={styles.statLabel}>Receitas</Text>
        </Surface>
        
        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="doctor" size={24} color="#0ea5e9" />
          <Text style={styles.statValue}>{uniqueDoctors}</Text>
          <Text style={styles.statLabel}>Médicos</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons name="account-group" size={24} color="#10b981" />
          <Text style={styles.statValue}>{uniquePatients}</Text>
          <Text style={styles.statLabel}>Pacientes</Text>
        </Surface>
      </View>

      <Text style={styles.sectionTitle}>O que você deseja fazer?</Text>
      
      <FeatureCard
        title="Adicionar Nova Receita" 
        icon="plus-circle"
        description="Cadastre uma nova receita médica"
        onPress={() => navigation.navigate('Adicionar')}
        color="#6366f1"
      />
      
      <FeatureCard
        title="Ver Receitas Salvas" 
        icon="prescription"
        description="Acesse suas receitas médicas armazenadas"
        onPress={() => navigation.navigate('Receitas')}
        color="#0ea5e9"
      />
      
      <FeatureCard
        title="Consultar Relatórios" 
        icon="chart-bar"
        description="Visualize estatísticas das suas receitas"
        onPress={() => navigation.navigate('Relatórios')}
        color="#10b981"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Receitex v0.1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 24,
    backgroundColor: '#6366f1',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  latestCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  latestLabel: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestDoctor: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  latestPatient: {
    fontSize: 14,
    marginTop: 4,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: '#1e293b',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderLeftWidth: 4,
  },
  featureIconContainer: {
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  featureDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
  },
}); 