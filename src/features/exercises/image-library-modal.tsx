import { useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exerciseImages } from '@/data/exercise-images.generated';

import { filterLibrary } from './library-search';

export function ImageLibraryModal({ initialId, onSelect, onClose }: {
  initialId?: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(initialId ?? null);
  const { width } = useWindowDimensions();
  const columns = width >= 500 ? 3 : 2;
  const filtered = filterLibrary(exerciseImages, query);
  const canConfirm = exerciseImages.some((image) => image.id === selectedId);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} visible>
      <SafeAreaView style={local.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={local.keyboard}>
          <View style={local.panel} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={local.title}>Biblioteca de imagens</Text>
            <TextInput accessibilityLabel="Pesquisar imagem" placeholder="Pesquisar por nome…" placeholderTextColor="#A8B3AB"
              value={query} onChangeText={setQuery} style={local.input} autoCorrect={false} />
            <FlatList key={columns} data={filtered} numColumns={columns} keyExtractor={(image) => image.id}
              extraData={selectedId} keyboardShouldPersistTaps="handled" style={local.list}
              contentContainerStyle={local.grid} columnWrapperStyle={local.row}
              ListEmptyComponent={<Text style={local.description}>{exerciseImages.length
                ? 'Nenhuma imagem encontrada para esta pesquisa.'
                : 'Nenhuma imagem disponível na biblioteca. Adicione imagens à pasta de exercícios do projeto.'}</Text>}
              renderItem={({ item }) => (
                <Pressable accessibilityRole="button" accessibilityState={{ selected: selectedId === item.id }}
                  accessibilityLabel={item.name} onPress={() => setSelectedId(item.id)}
                  style={({ pressed }) => [local.tile, { width: `${100 / columns - 2}%` }, selectedId === item.id && local.selected, pressed && local.pressed]}>
                  <Image source={item.source} style={local.image} resizeMode="contain" />
                  <Text style={local.name}>{item.name}</Text>
                </Pressable>
              )} />
            <Pressable accessibilityRole="button" disabled={!canConfirm} accessibilityState={{ disabled: !canConfirm }}
              onPress={() => { if (selectedId && canConfirm) onSelect(selectedId); }}
              style={({ pressed }) => [local.confirm, !canConfirm && local.disabled, pressed && local.pressed]}>
              <Text style={local.confirmText}>Confirmar seleção</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={local.cancel}>
              <Text style={local.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const local = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000B3', padding: 16, justifyContent: 'center', alignItems: 'center' },
  keyboard: { width: '100%', maxWidth: 560, maxHeight: '90%' },
  panel: { backgroundColor: '#171F1B', borderWidth: 1, borderColor: '#34473A', borderRadius: 24, padding: 16, gap: 12, flexShrink: 1 },
  title: { color: '#F4F7F3', fontSize: 21, fontWeight: '700' },
  input: { minHeight: 48, borderRadius: 12, backgroundColor: '#0C100F', color: '#F4F7F3', padding: 12, fontSize: 15 },
  list: { flexGrow: 0, flexShrink: 1 },
  grid: { paddingVertical: 8, gap: 10 },
  row: { justifyContent: 'space-between' },
  tile: { padding: 6, borderWidth: 2, borderColor: '#2D3B31', borderRadius: 14, alignItems: 'center', gap: 6 },
  selected: { borderColor: '#B0F36D', backgroundColor: '#25351F' },
  image: { width: 80, height: 80, borderRadius: 10 },
  name: { color: '#F4F7F3', fontSize: 12, textAlign: 'center' },
  description: { color: '#A8B3AB', fontSize: 14, lineHeight: 22, paddingVertical: 16 },
  confirm: { backgroundColor: '#B0F36D', borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12 },
  confirmText: { color: '#12200B', fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#B0F36D', fontSize: 15 },
});
