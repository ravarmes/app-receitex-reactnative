declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    onPress?: () => void;
  }

  export default class MaterialCommunityIcons extends Component<IconProps> {}
}
