/** Escolha, prévia e criação de modelos. Usar um modelo sempre cria OUTRA rotina. */
import { useRef, useState } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';
import { Button, styles } from '@/components/tela-base';
import { workoutColors as colors } from '@/constants/cores-app';
import { modelSources, routineModels, weekNames, type RoutineModel } from '@/data/modelos-rotinas';
import { createRoutine } from './estado-rotinas';
import { RoutineSheet, SmallAction } from './componentes-rotinas';
import { routineStyles as local } from './estilos-rotinas';
import { getModelRecommendations } from '@/data/exercicios-recomendados';
import { exerciseImages } from '@/data/exercise-images.generated';
import { ExerciseImage } from '@/features/exercicios/imagem-exercicio';

const imagesById = new Map(exerciseImages.map((image) => [image.id, image.source]));

export function ModelCatalog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [chosen, setChosen] = useState<RoutineModel | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const suggestions = chosen ? getModelRecommendations(chosen.id) : [];
  const hasSuggestions = suggestions.some((day) => day.length > 0);
  async function save(withExercises: boolean) {
    if (working.current) return;
    working.current = true; setBusy(true); setError('');
    try { const id = await createRoutine(name, chosen!.id, withExercises); onCreated(id); }
    catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível criar a rotina.'); }
    finally { working.current = false; setBusy(false); }
  }
  function choose(model: RoutineModel) { setChosen(model); setName(model.id === 'custom' ? '' : model.name); setError(''); }
  return <RoutineSheet title={chosen ? 'Criar rotina' : 'Explorar modelos'} onClose={onClose} busy={busy} contentKey={chosen?.id ?? 'catalog'}>
    {chosen ? <>
      <Text style={styles.sectionTitle}>{chosen.name}</Text>
      <Text style={styles.description}>Confira os dias e as sugestões abaixo. Você poderá trocar, remover ou adicionar exercícios. Peso e repetições começam vazios.</Text>
      <Text style={local.caption}>Nome da rotina</Text>
      <TextInput accessibilityLabel="Nome da rotina" value={name} onChangeText={setName} maxLength={100} editable={!busy} placeholder="Ex.: Treino das férias" placeholderTextColor={colors.textSecondary} style={local.input} />
      {!!error && <Text accessibilityRole="alert" style={local.error}>{error}</Text>}
      {/* As duas opções usam a mesma transação; somente a primeira inclui sugestões. */}
      {!busy && hasSuggestions && <Button label="Criar rotina com estes exercícios" onPress={() => { void save(true); }} />}
      {!busy && <Button label={hasSuggestions ? 'Criar somente a divisão, sem exercícios' : 'Criar rotina do zero'} onPress={() => { void save(false); }} secondary={hasSuggestions} />}
      {chosen.sessions.map((day, index) => <View key={index} style={local.card}>
        <Text style={local.badge}>{weekNames[index]}</Text>
        <Text style={styles.sectionTitle}>{day?.name ?? 'Descanso'}</Text>
        {day && <Text style={local.caption}>{day.muscles.join(' · ')}</Text>}
        {suggestions[index]?.map((exercise) => <View key={exercise.id} style={local.recommendationRow}>
          <ExerciseImage source={imagesById.get(exercise.imageId)} small />
          <View style={local.flex}>
            <Text style={local.actionText}>{exercise.name}</Text>
            <Text style={local.caption}>{exercise.muscles}</Text>
            <Text style={local.caption}>Sugestão inicial · editável</Text>
          </View>
        </View>)}
        {day && !suggestions[index]?.length && <Text style={local.caption}>Adicione seus exercícios depois de criar a rotina.</Text>}
      </View>)}
      <SmallAction label="Escolher outro modelo" onPress={() => setChosen(null)} disabled={busy} />
    </> : <>
      <Text style={styles.description}>Divisões com exercícios sugeridos, totalmente editáveis. São pontos de partida, sem cargas ou repetições prescritas. Adapte os exercícios às suas necessidades.</Text>
      {routineModels.map((model) => <View key={model.id} style={local.card}>
        <Text style={styles.sectionTitle}>{model.name}</Text>
        <Text style={local.badge}>{model.sessions.filter(Boolean).length} DIAS DE TREINO</Text>
        <Text style={styles.description}>{model.description}</Text>
        <Text style={local.caption}>{model.sessions.map((day, index) => day ? `${weekNames[index].split('-')[0]}: ${day.name}` : null).filter(Boolean).join(' · ') || 'Escolha livremente de zero a sete dias'}</Text>
        <Button label={model.id === 'custom' ? 'Criar do zero' : 'Visualizar divisão e exercícios'} onPress={() => choose(model)} />
      </View>)}
      <Text style={local.caption}>Os exemplos de dias são escolhas editáveis do MeuTreino. As referências discutem princípios gerais de frequência e organização, sem validar cada agenda acima.</Text>
      {modelSources.map((source) => <SmallAction key={source.url} label={source.label} onPress={() => { void Linking.openURL(source.url).catch(() => setError('Não foi possível abrir a referência.')); }} />)}
      {!!error && <Text style={local.error}>{error}</Text>}
    </>}
  </RoutineSheet>;
}
