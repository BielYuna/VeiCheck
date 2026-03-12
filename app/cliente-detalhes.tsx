import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { adicionarCliente, atualizarCliente, deletarCliente, type Cliente } from '@/utils/clientesStorage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.cliente) {
      try {
        const clienteParsed = JSON.parse(params.cliente as string);
        setCliente(clienteParsed);
        setIsEditing(false);
      } catch (error) {
        setIsEditing(true);
      }
    } else {
      setIsEditing(true);
    }
  }, [params.cliente]);

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>← Voltar</ThemedText>
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
              placeholder="Rua, número, bairro, cidade, estado"
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
        </ScrollView>

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
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  buttonSecondary: {
    backgroundColor: '#e0e0e0',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  buttonDanger: {
    backgroundColor: '#ff4444',
  },
});
