import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { getAllClientes, initializeClientes, type Cliente } from '@/utils/clientesStorage';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistContext } from './context/ChecklistContext';

export default function NovoChecklistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeinAnim = React.useRef(new Animated.Value(0)).current;
  const { cliente, setCliente } = useContext(ChecklistContext);
  const [clienteSelecionado, setClienteSelecionado] = React.useState<Cliente | null>(cliente);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = React.useState<Cliente[]>([]);
  const [pesquisa, setPesquisa] = React.useState('');
  const [modalVisivel, setModalVisivel] = React.useState(false);

  React.useEffect(() => {
    setClienteSelecionado(cliente);
  }, [cliente]);

  useEffect(() => {
    // Carregar clientes ao montar o componente
    const carregarClientes = async () => {
      try {
        await initializeClientes();
        const clientesCarregados = await getAllClientes();
        // Ordenar por id DESC para mostrar o mais recente primeiro
        const clientesOrdenados = clientesCarregados.sort((a, b) => 
          parseInt(b.id) - parseInt(a.id)
        );
        setClientes(clientesOrdenados);
        setClientesFiltrados(clientesOrdenados);
        // Definir o último cadastrado como selecionado
        if (clientesOrdenados.length > 0) {
          setClienteSelecionado(clientesOrdenados[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };

    carregarClientes();
  }, []);

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
    if (texto.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter((cliente) =>
        cliente.nome.toLowerCase().includes(texto.toLowerCase()) ||
        cliente.cpf.includes(texto)
      );
      setClientesFiltrados(filtrados);
    }
  };

  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setCliente(cliente);
    setModalVisivel(false);
    setPesquisa('');
    setClientesFiltrados(clientes);
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleAvançar = () => {
    if (clienteSelecionado) {
      console.log('Cliente selecionado:', clienteSelecionado);
      router.push({
        pathname: '/novo-checklist-veiculo',
      });
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Barra de Progresso */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '33%', backgroundColor: '#51eb7c' }]} />
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
        <ThemedText style={[styles.messageText, { fontSize: 24, fontWeight: '600',margin: 16 }]}>Vamos adicionar os dados</ThemedText>
      </Animated.View>

      <ThemedView style={styles.container}>
            {/* Espaço central para animação */}
            <View style={styles.animationContainer}>
              <LottieView
                source={require('@/animated/CustomerSelect.json')}
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
        {/* Campo Cliente */}
        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { fontSize: 20, fontWeight: '600' }]}>Cliente:</ThemedText>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalVisivel(true)}>
            <ThemedText
              style={{
                fontSize: 20,
                color: clienteSelecionado ? '#242424' : '#999999',
              }}>
              {clienteSelecionado ? clienteSelecionado.nome : 'Selecione um cliente'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal de Pesquisa de Clientes */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeaderContainer}>
            <TouchableOpacity
              onPress={() => {
                setModalVisivel(false);
                setPesquisa('');
                setClientesFiltrados(clientes);
              }}
              style={[styles.smallBackButton, { backgroundColor: BrandColors.primary }]}>
              <ThemedText style={styles.smallButtonText}>← Voltar</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>Lista de clientes</ThemedText>
          </View>

          <View style={styles.pesquisaContainer}>
            <TextInput
              style={styles.pesquisaInput}
              placeholder="Pesquise por nome ou CPF"
              placeholderTextColor="#999999"
              value={pesquisa}
              onChangeText={handlePesquisa}
              autoFocus
            />
          </View>

          <FlatList
            data={clientesFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.clienteItem,
                  clienteSelecionado?.id === item.id && styles.clienteItemSelecionado,
                ]}
                onPress={() => handleSelecionarCliente(item)}>
                <View style={styles.clienteInfo}>
                  <ThemedText style={styles.clienteNome}>{item.nome}</ThemedText>
                  <ThemedText style={styles.clienteCPF}>{item.cpf}</ThemedText>
                </View>
                {clienteSelecionado?.id === item.id && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>
      </Modal>

      {/* Botões na posição inferior */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleVoltar}>
          <ThemedText style={styles.buttonSecondaryText}>Voltar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: BrandColors.primary, opacity: clienteSelecionado ? 1 : 0.5 },
          ]}
          onPress={handleAvançar}
          disabled={!clienteSelecionado}>
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
    //alignItems: 'center',
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
  button: {
    width: '100%',
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '50%',
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
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clienteItemSelecionado: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clienteCPF: {
    fontSize: 13,
    color: '#999',
  },
  checkmark: {
    fontSize: 20,
    color: BrandColors.primary,
    fontWeight: 'bold',
    marginLeft: 12,
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
