/**
 * INFORMAÇÕES DO CRIADOR
 * Edite aqui o nome, a descrição e a referência da foto pessoal.
 * O tamanho e a posição da foto são definidos em src/app/perfil.tsx.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

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
