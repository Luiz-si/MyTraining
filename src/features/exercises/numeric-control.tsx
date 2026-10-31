import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { parseRepetitions, parseWeight } from './model';

export function NumericControl({ value, label, integer = false, onValue, onStep }: {
  value: string;
  label: string;
  integer?: boolean;
  onValue: (value: string) => void;
  onStep: (delta: 1 | -1) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value;
  const valid = integer ? parseRepetitions(text) !== null : parseWeight(text) !== null;

  function change(text: string) {
    setDraft(text);
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
          disabled={Number(value) === 0} onPress={() => step(-1)}
          style={({ pressed }) => [local.step, Number(value) === 0 && local.disabled, pressed && local.pressed]}>
          <Text style={local.symbol}>−</Text>
        </Pressable>
        <TextInput accessibilityLabel={label} value={text} selectTextOnFocus
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
  control: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#34473A', borderRadius: 10, overflow: 'hidden' },
  step: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#25351F' },
  symbol: { color: '#B0F36D', fontSize: 23, fontWeight: '600' },
  input: { flex: 1, minWidth: 26, minHeight: 44, paddingHorizontal: 2, paddingVertical: 8, color: '#F4F7F3', textAlign: 'center', fontSize: 13 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.6 },
  invalid: { backgroundColor: '#482625' },
  error: { color: '#FFB4A8', fontSize: 11, marginTop: 4 },
});
