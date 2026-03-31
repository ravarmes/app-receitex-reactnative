import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Adicionar: undefined;
  Receitas: undefined;
  DetalheReceita: { prescriptionId: number };
  EditarReceita: { prescriptionId: number };
  'Relatórios': undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
