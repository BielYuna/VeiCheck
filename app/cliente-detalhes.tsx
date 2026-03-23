import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { CIDADES_POR_UF } from '@/utils/cidadesPorUf';
import { adicionarCliente, atualizarCliente, deletarCliente, type Cliente } from '@/utils/clientesStorage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const sanitizeAndSortCities = (cities: string[]) =>
  Array.from(new Set(cities.map((item) => item.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );

export default function ClienteDetalhesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [cliente, setCliente] = useState<Cliente>({
    id: '',
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estadoModalVisible, setEstadoModalVisible] = useState(false);
  const [cidadeModalVisible, setCidadeModalVisible] = useState(false);
  const [cidadeSearch, setCidadeSearch] = useState('');

  useEffect(() => {
    if (params.cliente) {
      try {
        const clienteParsed = JSON.parse(params.cliente as string);
        setCliente(clienteParsed);
        setIsEditing(false);
      } catch {
        setIsEditing(true);
      }
    } else {
      setIsEditing(true);
    }
  }, [params.cliente]);

  const cidadesEstado = useMemo(
    () => sanitizeAndSortCities(CIDADES_POR_UF[cliente.estado || ''] || []),
    [cliente.estado]
  );

  useEffect(() => {
    if (!cliente.estado) {
      setCidadeSearch('');
      return;
    }

    setCliente((prev) =>
      prev.cidade && !cidadesEstado.includes(prev.cidade)
        ? { ...prev, cidade: '' }
        : prev
    );
  }, [cliente.estado, cidadesEstado]);

  const cidadesFiltradas = useMemo(
    () =>
      cidadesEstado.filter((cidade) =>
        normalizeText(cidade).includes(normalizeText(cidadeSearch))
      ),
    [cidadeSearch, cidadesEstado]
  );

  const handleSave = async () => {
    if (!cliente.nome.trim() || !cliente.cpf.trim() || !cliente.telefone.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (cliente.id) {
        // Atualizar cliente existente
        await atualizarCliente(cliente);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      } else {
        // Adicionar novo cliente
        const novoCliente = await adicionarCliente({
          nome: cliente.nome,
          cpf: cliente.cpf,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
          cidade: cliente.cidade,
          estado: cliente.estado,
        });
        setCliente(novoCliente);
        Alert.alert('Sucesso', 'Cliente adicionado com sucesso!');
      }
      setIsEditing(false);
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar cliente. Tente novamente.');
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (params.cliente) {
      setIsEditing(false);
    } else {
      router.back();
    }
  };

  const handleDeletear = async () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar este cliente?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              setLoading(true);
              if (cliente.id) {
                await deletarCliente(cliente.id);
                Alert.alert('Sucesso', 'Cliente deletado com sucesso!');
                router.back();
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro ao deletar cliente. Tente novamente.');
              console.error('Erro ao deletar:', error);
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.smallBackButton, { backgroundColor: BrandColors.primary }]}>
            <ThemedText style={styles.smallButtonText}>← Voltar</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            {isEditing ? 'Novo Cliente' : 'Detalhes do Cliente'}
          </ThemedText>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Nome Completo *</ThemedText>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              placeholder="Digite o nome completo"
              placeholderTextColor="#999"
              value={cliente.nome}
              onChangeText={(text) =>
                setCliente((prev) => ({ ...prev, nome: text }))
              }
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>CPF *</ThemedText>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              placeholder="000.000.000-00"
              placeholderTextColor="#999"
              value={cliente.cpf}
              onChangeText={(text) =>
                setCliente((prev) => ({ ...prev, cpf: text }))
              }
              editable={isEditing}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Telefone *</ThemedText>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              placeholder="(00) 98765-4321"
              placeholderTextColor="#999"
              value={cliente.telefone}
              onChangeText={(text) =>
                setCliente((prev) => ({ ...prev, telefone: text }))
              }
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Endereço</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.inputMultiline,
                !isEditing && styles.inputDisabled,
              ]}
              placeholder="Rua, número, bairro!"
              placeholderTextColor="#999"
              value={cliente.endereco}
              onChangeText={(text) =>
                setCliente((prev) => ({ ...prev, endereco: text }))
              }
              editable={isEditing}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Estado</ThemedText>
            {isEditing ? (
              <TouchableOpacity
                style={styles.selectorInput}
                onPress={() => setEstadoModalVisible(true)}
                activeOpacity={0.7}
              >
                <ThemedText style={cliente.estado ? styles.selectorText : styles.selectorPlaceholder}>
                  {cliente.estado || 'Selecione o estado'}
                </ThemedText>
                <ThemedText style={styles.selectorArrow}>▼</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={[styles.input, styles.inputDisabled]}>
                <ThemedText style={{ color: '#666', fontSize: 15 }}>
                  {cliente.estado || '—'}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Cidade</ThemedText>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.selectorInput, !cliente.estado && styles.selectorInputDisabled]}
                onPress={() => cliente.estado && setCidadeModalVisible(true)}
                activeOpacity={cliente.estado ? 0.7 : 0.5}
              >
                <ThemedText style={cliente.cidade ? styles.selectorText : styles.selectorPlaceholder}>
                  {cliente.cidade || (cliente.estado ? 'Selecione a cidade' : 'Selecione um estado primeiro')}
                </ThemedText>
                <ThemedText style={styles.selectorArrow}>▼</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={[styles.input, styles.inputDisabled]}>
                <ThemedText style={{ color: '#666', fontSize: 15 }}>
                  {cliente.cidade || '—'}
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={estadoModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEstadoModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setEstadoModalVisible(false)}
          >
            <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Selecione o Estado</ThemedText>
                <TouchableOpacity onPress={() => setEstadoModalVisible(false)}>
                  <ThemedText style={styles.modalClose}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.estadosGrid}>
                {ESTADOS_BRASIL.map((uf) => (
                  <TouchableOpacity
                    key={uf}
                    style={[
                      styles.estadoButton,
                      cliente.estado === uf && styles.estadoButtonSelected,
                    ]}
                    onPress={() => {
                      setCliente((prev) => ({
                        ...prev,
                        estado: uf,
                        cidade: prev.estado === uf ? prev.cidade : '',
                      }));
                      setCidadeSearch('');
                      setEstadoModalVisible(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.estadoButtonText,
                        cliente.estado === uf && styles.estadoButtonTextSelected,
                      ]}
                    >
                      {uf}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={cidadeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCidadeModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCidadeModalVisible(false)}
          >
            <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Selecione a Cidade</ThemedText>
                <TouchableOpacity onPress={() => setCidadeModalVisible(false)}>
                  <ThemedText style={styles.modalClose}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar cidade"
                placeholderTextColor="#999"
                value={cidadeSearch}
                onChangeText={setCidadeSearch}
                autoCapitalize="words"
              />

              <FlatList
                data={cidadesFiltradas}
                keyExtractor={(item) => item}
                style={styles.cityList}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.cityStatusContainer}>
                    <ThemedText style={styles.cityStatusText}>Nenhuma cidade encontrada.</ThemedText>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.cityListItem,
                      cliente.cidade === item && styles.cityListItemSelected,
                    ]}
                    onPress={() => {
                      setCliente((prev) => ({ ...prev, cidade: item }));
                      setCidadeModalVisible(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.cityListItemText,
                        cliente.cidade === item && styles.cityListItemTextSelected,
                      ]}
                    >
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={[styles.buttonGroup, { paddingBottom: insets.bottom + 20 }]}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
          )}
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleCancel}
                disabled={loading}
              >
                <ThemedText style={styles.buttonSecondaryText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: BrandColors.primary, opacity: loading ? 0.6 : 1 }]}
                onPress={handleSave}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>Salvar</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setIsEditing(true)}
                disabled={loading}
              >
                <ThemedText style={styles.buttonSecondaryText}>Editar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonDanger, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleDeletear}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>Deletar</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  title: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 0,
    marginTop: 20,
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    flex: 0.60,
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  buttonDanger: {
    backgroundColor: '#ff4444',
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
  selectorInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  selectorText: {
    fontSize: 15,
    color: '#333',
  },
  selectorPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 18,
    color: '#666',
    paddingHorizontal: 8,
  },
  estadosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    gap: 8,
    paddingBottom: 16,
  },
  estadoButton: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  estadoButtonSelected: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  estadoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  estadoButtonTextSelected: {
    color: '#000',
  },
  searchInput: {
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  cityList: {
    maxHeight: 420,
  },
  cityListItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  cityListItemSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#fff8cf',
  },
  cityListItemText: {
    fontSize: 15,
    color: '#333',
  },
  cityListItemTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  cityStatusContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cityStatusText: {
    color: '#666',
    fontSize: 14,
  },
});
