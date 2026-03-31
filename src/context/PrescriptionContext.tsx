import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Prescription {
  id: number;
  doctorName: string;
  patientName: string;
  symptomCategories: string[];
  symptomDescription: string;
  photoURI?: string;
  appointmentDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PrescriptionContextData {
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrescription: (id: number, data: Partial<Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deletePrescription: (id: number) => Promise<void>;
  getPrescriptionById: (id: number) => Prescription | undefined;
  getPrescriptionsByDoctor: (doctor: string) => Prescription[];
  getPrescriptionsByCategory: (category: string) => Prescription[];
}

const PrescriptionContext = createContext<PrescriptionContextData>({} as PrescriptionContextData);

export const PrescriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  React.useEffect(() => {
    loadPrescriptions();

    return () => {
      if (prescriptions.length > 0) {
        savePrescriptions(prescriptions).catch(err =>
          console.error('Error during cleanup save:', err)
        );
      }
    };
  }, []);

  const loadPrescriptions = async () => {
    try {
      const storedPrescriptions = await AsyncStorage.getItem('@prescriptions');
      if (storedPrescriptions) {
        setPrescriptions(JSON.parse(storedPrescriptions));
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const savePrescriptions = async (newPrescriptions: Prescription[]) => {
    try {
      await AsyncStorage.setItem('@prescriptions', JSON.stringify(newPrescriptions));
    } catch (error) {
      console.error('Error saving prescriptions:', error);
    }
  };

  const addPrescription = async (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newPrescription: Prescription = {
        ...prescription,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      const updatedPrescriptions = [newPrescription, ...prescriptions];
      setPrescriptions(updatedPrescriptions);
      await savePrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const updatePrescription = async (id: number, data: Partial<Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedPrescriptions = prescriptions.map(prescription =>
        prescription.id === id
          ? { ...prescription, ...data, updatedAt: new Date().toISOString() }
          : prescription
      );
      setPrescriptions(updatedPrescriptions);
      await savePrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  const deletePrescription = async (id: number) => {
    try {
      const updatedPrescriptions = prescriptions.filter(prescription => prescription.id !== id);
      setPrescriptions(updatedPrescriptions);
      await savePrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const getPrescriptionsByDoctor = (doctor: string) => {
    return prescriptions.filter(prescription =>
      prescription.doctorName.toLowerCase().includes(doctor.toLowerCase())
    );
  };

  const getPrescriptionsByCategory = (category: string) => {
    return prescriptions.filter(prescription =>
      prescription.symptomCategories.some(c => c.toLowerCase().includes(category.toLowerCase()))
    );
  };

  const getPrescriptionById = (id: number) => {
    return prescriptions.find(prescription => prescription.id === id);
  };

  return (
    <PrescriptionContext.Provider
      value={{
        prescriptions,
        addPrescription,
        updatePrescription,
        deletePrescription,
        getPrescriptionById,
        getPrescriptionsByDoctor,
        getPrescriptionsByCategory,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};

export const usePrescriptions = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescriptions must be used within a PrescriptionProvider');
  }
  return context;
};
