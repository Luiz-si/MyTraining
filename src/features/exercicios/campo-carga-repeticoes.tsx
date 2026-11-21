/**
 * CAMPO NUMÉRICO DE CARGA OU REPETIÇÕES
 * Edite aqui: campo de digitação e botões de aumentar/diminuir.
 * Lida com o texto digitado, valida os valores e apresenta erros.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { parseRepetitions, parseWeight } from './tipos-e-validacao';

export function NumericControl({ value, label, integer = false, allowEmpty = false, onValue, onStep }: {
  value: string;
  label: string;
  integer?: boolean;
  allowEmpty?: boolean;
  onValue: (value: string | null) => void;
  onStep: (delta: 1 | -1) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value;
  const valid = allowEmpty && text.trim() === '' || (integer ? parseRepetitions(text) !== null : parseWeight(text) !== null);

  function change(text: string) {
    setDraft(text);
    // Apagar todo o texto remove o valor salvo, em vez de transformar vazio em zero.
    if (allowEmpty && text.trim() === '') { onValue(null); return; }
    const parsed = integer ? parseRepetitions(text) : parseWeight(text);
    if (parsed !== null) onValue(String(parsed));
  }

  function step(delta: 1 | -1) {
    setDraft(null);
    onStep(delta);
  }

  return (
    <View style={local.column}>
      <View style={local.control}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Diminuir ${label}`}
          disabled={value === '' || Number(value) === 0} onPress={() => step(-1)}
          style={({ pressed }) => [local.step, (value === '' || Number(value) === 0) && local.disabled, pressed && local.pressed]}>
          <Text style={local.symbol}>−</Text>
        </Pressable>
        <TextInput accessibilityLabel={label} value={text} selectTextOnFocus
          placeholder={allowEmpty ? integer ? 'Repet.' : 'Peso' : undefined} placeholderTextColor={workoutColors.textSecondary}
          inputMode={integer ? 'numeric' : 'decimal'} maxLength={24}
          onChangeText={change} onBlur={() => setDraft(null)}
          style={[local.input, !valid && local.invalid]} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Aumentar ${label}`}
          disabled={integer && Number(value) >= Number.MAX_SAFE_INTEGER}
          onPress={() => step(1)} style={({ pressed }) => [local.step, pressed && local.pressed]}>
          <Text style={local.symbol}>+</Text>
        </Pressable>
      </View>
      {!valid && <Text accessibilityLiveRegion="polite" style={local.error}>Use {integer ? 'um inteiro' : 'um número'} ≥ 0. O valor anterior foi mantido.</Text>}
    </View>
  );
}

const local = StyleSheet.create({
  column: { flex: 1, minWidth: 116 },
  control: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: workoutColors.border, borderRadius: 10, overflow: 'hidden' },
  step: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: workoutColors.selected },
  symbol: { color: workoutColors.accent, fontSize: 23, fontWeight: '600' },
  input: { flex: 1, minWidth: 26, minHeight: 44, paddingHorizontal: 2, paddingVertical: 8, color: workoutColors.text, textAlign: 'center', fontSize: 13 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.6 },
  invalid: { backgroundColor: '#482625' },
  error: { color: '#FFB4A8', fontSize: 11, marginTop: 4 },
});
