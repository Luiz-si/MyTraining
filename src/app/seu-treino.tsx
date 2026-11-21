/**
 * SEU PRÓPRIO TREINO: lista virtualizada de rotinas pessoais.
 * Os formulários e o banco ficam em features/rotinas, fora das rotas do Router.
 */
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, styles } from '@/components/tela-base';
import { workoutColors as colors } from '@/constants/cores-app';
import { ModelCatalog } from '@/features/rotinas/catalogo-modelos';
import { RoutineCard } from '@/features/rotinas/componentes-rotinas';
import { loadRoutines, useRoutines } from '@/features/rotinas/estado-rotinas';
import { RoutineMenu } from '@/features/rotinas/menu-rotina';
import { routineStyles as local } from '@/features/rotinas/estilos-rotinas';

export default function PersonalWorkoutScreen() {
  const state = useRoutines();
  const [catalog, setCatalog] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menu = state.routines.find((routine) => routine.id === menuId);
  useFocusEffect(useCallback(() => { void loadRoutines(); }, []));

  // O ID viaja na URL. A próxima tela consulta somente a rotina correspondente.
  function open(id: string) {
    setCatalog(false); setMenuId(null);
    router.push({ pathname: '/rotina/[id]', params: { id } });
  }
  return <SafeAreaView style={styles.screen}>
    <FlatList
      data={state.routines} keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content} initialNumToRender={5}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListHeaderComponent={<View style={local.stack}>
        <Button label="Voltar à página principal" onPress={() => router.dismissTo('/')} secondary />
        <Text style={styles.eyebrow}>MEUTREINO · SUA ROTINA</Text>
        <Text accessibilityRole="header" style={styles.hero}>Seu próprio treino</Text>
        <Text style={styles.description}>Organize seus treinos, escolha uma divisão e acompanhe sua evolução.</Text>
        <Button label="Explorar modelos" onPress={() => setCatalog(true)} />
        {!!state.error && <View style={local.stack}>
          <Text accessibilityRole="alert" style={local.error}>{state.error}</Text>
          <Button label="Atualizar" onPress={() => { void loadRoutines(); }} secondary />
        </View>}
        {state.loading && <ActivityIndicator color={colors.accent} accessibilityLabel="Carregando rotinas" />}
        <Text accessibilityRole="header" style={styles.sectionTitle}>Minhas rotinas</Text>
      </View>}
      ListEmptyComponent={state.loaded && !state.loading
        ? <Text style={styles.description}>Explore e adicione um modelo de treino primeiro!</Text>
        : undefined}
      renderItem={({ item }) => <RoutineCard routine={item} onOpen={() => open(item.id)} onMenu={() => setMenuId(item.id)} />}
    />
    {catalog && <ModelCatalog onClose={() => setCatalog(false)} onCreated={open} />}
    {menu && <RoutineMenu routine={menu} onClose={() => setMenuId(null)} onDeleted={() => setMenuId(null)} onDuplicated={open} />}
  </SafeAreaView>;
}
