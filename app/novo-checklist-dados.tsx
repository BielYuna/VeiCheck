import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect } from 'react';
import {
    Animated,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistContext } from './context/ChecklistContext';

const motivos = [
  'Acidente',
  'Pane',
  'Roubo',
  'Motor',
  'Mecânica',
  'Elétrica',
  'Arrefecimento',
  'Suspensão',
  'Bateria',
  'Combustível',
  'Pneu',
  'Outros',
];

export default function NovoChecklistDadosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { motivo, motivoEspecifico, setMotivo, setMotivoEspecifico } = useContext(ChecklistContext);

  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeinAnim = React.useRef(new Animated.Value(0)).current;
  const [motivoSelecionado, setMotivoSelecionado] = React.useState<string | null>(motivo);
  const [motivoLocal, setMotivoLocal] = React.useState(motivoEspecifico);

  React.useEffect(() => {
    setMotivoSelecionado(motivo);
  }, [motivo]);

  React.useEffect(() => {
    setMotivoLocal(motivoEspecifico);
  }, [motivoEspecifico]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeinAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeinAnim]);

  const handleVoltar = () => {
    router.back();
  };

  const handleAvancar = () => {
    if (!motivoSelecionado) return;
    if (motivoSelecionado === 'Outros' && motivoLocal.trim() === '') return;

    const motivoFinal = motivoSelecionado === 'Outros' ? motivoLocal.trim() : motivoSelecionado;

    setMotivo(motivoFinal);
    setMotivoEspecifico(motivoLocal);

    console.log('Motivo selecionado:', motivoFinal);

    // Aqui você pode navegar para a próxima tela quando ela estiver pronta.
    // Exemplo:
    // router.push({
    //   pathname: '/novo-checklist-final',
    //   params: {
    //     cliente: String(params.cliente ?? ''),
    //     veiculo: String(params.veiculo ?? ''),
    //     placa: String(params.placa ?? ''),
    //     motivo: motivoSelecionado,
    //   },
    // });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%', backgroundColor: '#51eb7c' }]} />
      </View>

      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <ThemedText style={[styles.messageText, { fontSize: 24, fontWeight: '600', margin: 16 }]}> 
          Motivo do chamado
        </ThemedText>
      </Animated.View>

      <Animated.View
        style={[
          styles.animationContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <LottieView
          source={require('@/animated/RoadAssist.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <View style={styles.menuContainer}>
          <ThemedText style={[styles.fieldLabel, { fontSize: 20, fontWeight: '600', marginBottom: 12 }]}>Selecione o motivo:</ThemedText>
          <View style={styles.gridWrapper}>
            {motivoSelecionado === 'Outros' ? (
              <TextInput
                style={styles.outrosInput}
                placeholder="Descreva o motivo"
                placeholderTextColor="#999"
                value={motivoLocal}
                onChangeText={setMotivoLocal}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoFocus
              />
            ) : (
              <FlatList
                data={motivos}
                keyExtractor={(item) => item}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const selected = motivoSelecionado === item;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.gridItem,
                        selected && styles.gridItemSelected,
                      ]}
                      onPress={() => {
                        setMotivoSelecionado(item);
                        if (item !== 'Outros') setMotivoLocal('');
                      }}>
                      <ThemedText
                        style={[
                          styles.gridItemText,
                          selected && styles.gridItemTextSelected,
                        ]}>
                        {item}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }}
                columnWrapperStyle={styles.gridColumn}
              />
            )}
          </View>
        </View>
      </Animated.View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleVoltar}>
          <ThemedText style={styles.buttonSecondaryText}>Voltar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: BrandColors.primary,
              opacity:
                !motivoSelecionado || (motivoSelecionado === 'Outros' && motivoLocal.trim() === '')
                  ? 0.5
                  : 1,
            },
          ]}
          onPress={handleAvancar}
          disabled={!motivoSelecionado || (motivoSelecionado === 'Outros' && motivoLocal.trim() === '')}>
          <ThemedText style={styles.buttonText}>Avançar</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },
  animationContainer: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  lottie: {
    width: 240,
    height: 240,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  menuContainer: {
    marginBottom: 24,
  },
  outrosInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  gridWrapper: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
  },
  gridColumn: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  gridItemSelected: {
    backgroundColor: BrandColors.primary,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  gridItemTextSelected: {
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
