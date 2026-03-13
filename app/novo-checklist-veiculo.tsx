import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { getAllVeiculos, type Veiculo } from '@/utils/veiculosData';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import {
  Animated,
  FlatList,
  Modal, ScrollView, StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NovoChecklistVeiculoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeinAnim = React.useRef(new Animated.Value(0)).current;
  const [veiculoSelecionado, setVeiculoSelecionado] = React.useState<(Veiculo & { ano?: number }) | null>(null);
  const [veiculos, setVeiculos] = React.useState<Veiculo[]>([]);
  const [modalVisivel, setModalVisivel] = React.useState(false);
  const [step, setStep] = React.useState<'marcas' | 'modelos' | 'anos'>('marcas');
  const [selectedMarca, setSelectedMarca] = React.useState<string | null>(null);
  const [selectedModelo, setSelectedModelo] = React.useState<string | null>(null);
  const [marcasFiltradas, setMarcasFiltradas] = React.useState<string[]>([]);
  const [modelosFiltrados, setModelosFiltrados] = React.useState<string[]>([]);
  const [pesquisa, setPesquisa] = React.useState('');

  // Gerar lista de anos (últimos 30 anos)
  const anosDisponiveis = React.useMemo(() => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual; i >= anoAtual - 30; i--) {
      anos.push(i);
    }
    return anos;
  }, []);

  const marcas = React.useMemo(() => {
    const unique = [...new Set(veiculos.map(v => v.marca))];
    return unique.sort();
  }, [veiculos]);

  const modelos = React.useMemo(() => {
    if (!selectedMarca) return [];
    const unique = [...new Set(veiculos.filter(v => v.marca === selectedMarca).map(v => v.modelo))];
    return unique.sort();
  }, [veiculos, selectedMarca]);

  useEffect(() => {
    setModelosFiltrados(modelos);
  }, [modelos]);

  useEffect(() => {
    // Carregar veículos ao montar o componente
    const veiculosCarregados = getAllVeiculos();
    setVeiculos(veiculosCarregados);
  }, []);

  useEffect(() => {
    setMarcasFiltradas(marcas);
  }, [marcas]);

  useEffect(() => {
    // Animação de slide da direita para esquerda
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

  const handlePesquisa = (texto: string) => {
    setPesquisa(texto);
    if (step === 'marcas') {
      if (texto.trim() === '') {
        setMarcasFiltradas(marcas);
      } else {
        const filtradas = marcas.filter(marca =>
          marca.toLowerCase().includes(texto.toLowerCase())
        );
        setMarcasFiltradas(filtradas);
      }
    } else if (step === 'modelos') {
      if (texto.trim() === '') {
        setModelosFiltrados(modelos);
      } else {
        const filtrados = modelos.filter(modelo =>
          modelo.toLowerCase().includes(texto.toLowerCase())
        );
        setModelosFiltrados(filtrados);
      }
    }
  };

  const handleSelecionarMarca = (marca: string) => {
    setSelectedMarca(marca);
    setStep('modelos');
    setPesquisa('');
  };

  const handleSelecionarModelo = (modelo: string) => {
    setSelectedModelo(modelo);
    setStep('anos');
    setPesquisa('');
  };

  const handleSelecionarAno = (ano: number) => {
    const veiculo = veiculos.find(v => v.marca === selectedMarca && v.modelo === selectedModelo);
    if (veiculo) {
      setVeiculoSelecionado({ ...veiculo, ano });
      setModalVisivel(false);
      setStep('marcas');
      setSelectedMarca(null);
      setSelectedModelo(null);
    }
  };

  const handleBack = () => {
    if (step === 'marcas') {
      setModalVisivel(false);
      setMarcasFiltradas(marcas);
      setPesquisa('');
    } else if (step === 'modelos') {
      setStep('marcas');
      setSelectedMarca(null);
      setMarcasFiltradas(marcas);
      setPesquisa('');
    } else if (step === 'anos') {
      setStep('modelos');
      setSelectedModelo(null);
      setModelosFiltrados(modelos);
      setPesquisa('');
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleAvançar = () => {
    if (veiculoSelecionado) {
      console.log('Veículo selecionado:', veiculoSelecionado);
      // router.push('/novo-checklist-dados'); // decomente quando a próxima tela estiver pronta
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Barra de Progresso */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '66%', backgroundColor: '#51eb7c' }]} />
      </View>

      {/* Mensagem com animação */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <ThemedText style={[styles.messageText, { fontSize: 24, fontWeight: '600', margin: 16 }]}>
          Agora os dados do veículo
        </ThemedText>
      </Animated.View>

      <ThemedView style={styles.container}>
        {/* Espaço central para animação */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('@/animated/Car.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </ThemedView>

      {/* Conteúdo principal com animação */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        {/* Campo Veículo */}
        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { fontSize: 20, fontWeight: '600' }]}>
            Selecione o veiculo:
          </ThemedText>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              setModalVisivel(true);
              setStep('marcas');
            }}>
            <ThemedText
              style={{
                fontSize: 20,
                color: veiculoSelecionado ? '#242424' : '#999999',
              }}>
              {veiculoSelecionado
                ? `${veiculoSelecionado.marca} ${veiculoSelecionado.modelo} (${veiculoSelecionado.ano})`
                : 'Selecione um veículo'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal de Seleção de Veículos */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeaderContainer}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.smallBackButton}>
              <ThemedText style={styles.smallButtonText}>← Voltar</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>
              {step === 'marcas' ? 'Selecione a marca' : step === 'modelos' ? 'Selecione o modelo' : 'Selecione o ano'}
            </ThemedText>
          </View>

          {step !== 'anos' && (
            <View style={styles.pesquisaContainer}>
              <TextInput
                style={styles.pesquisaInput}
                placeholder={step === 'marcas' ? 'Pesquise por marca' : 'Pesquise por modelo'}
                placeholderTextColor="#999999"
                value={pesquisa}
                onChangeText={handlePesquisa}
                autoFocus
              />
            </View>
          )}

          {step === 'marcas' && (
            <FlatList
              data={marcasFiltradas}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.marcaItem}
                  onPress={() => handleSelecionarMarca(item)}>
                  <ThemedText style={styles.marcaText}>{item}</ThemedText>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {step === 'modelos' && (
            <FlatList
              data={modelosFiltrados}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modeloItem}
                  onPress={() => handleSelecionarModelo(item)}>
                  <ThemedText style={styles.modeloText}>{item}</ThemedText>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {step === 'anos' && (
            <ScrollView
              contentContainerStyle={styles.anosContainer}
              showsVerticalScrollIndicator={false}>
              {anosDisponiveis.map((ano) => (
                <TouchableOpacity
                  key={ano}
                  style={styles.anoItem}
                  onPress={() => handleSelecionarAno(ano)}>
                  <ThemedText style={styles.anoText}>{ano}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ThemedView>
      </Modal>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleVoltar}>
          <ThemedText style={styles.buttonSecondaryText}>Voltar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: BrandColors.primary, opacity: veiculoSelecionado ? 1 : 0.5 },
          ]}
          onPress={handleAvançar}
          disabled={!veiculoSelecionado}>
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
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 500,
    height: 500,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: BrandColors.primary,
    fontWeight: '600',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  messageText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectButton: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#969694',
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
  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
    marginBottom: 16,
  },
  pesquisaContainer: {
    marginBottom: 16,
  },
  pesquisaInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  veiculoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  veiculoItemSelecionado: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  veiculoInfo: {
    flex: 1,
  },
  veiculoMarca: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  veiculoModelo: {
    fontSize: 13,
    color: '#999',
  },
  checkmark: {
    fontSize: 20,
    color: BrandColors.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  marcaItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  marcaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modeloItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modeloText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  anosContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  anoItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  anoItemSelecionado: {
    backgroundColor: BrandColors.primary,
    borderBottomWidth: 0,
  },
  anoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  anoTextSelecionado: {
    color: '#fff',
  },
  smallBackButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalTitle: {
    flex: 1,
  },
});
