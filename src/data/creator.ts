import type { ImageSourcePropType } from 'react-native';

// Personalize aqui. Para usar uma foto local, substitua null por require('caminho-da-foto').
export const creator: {
  name: string;
  description: string;
  photo: ImageSourcePropType | null;
} = {
  name: 'Luiz', // Nome que já estava presente na tela inicial.
  description: 'Conheça minha rotina de musculação e acompanhe minha divisão semanal.',
  photo: require('../../assets/images/minha-foto1.jpeg'),
};
