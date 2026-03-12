import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { getAllClientes, initializeClientes, type Cliente } from '@/utils/clientesStorage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ClienteItemProps {
  cliente: Cliente;
  onPress: (cliente: Cliente) => void;
}

function ClienteItem({ cliente, onPress }: ClienteItemProps) {
  return (
    <TouchableOpacity
      style={styles.clienteCard}
      onPress={() => onPress(cliente)}
      activeOpacity={0.7}
    >
      <View style={styles.clienteContent}>
        <ThemedText style={styles.clienteNome}>{cliente.nome}</ThemedText>
        <ThemedText style={styles.clienteInfo}>CPF: {cliente.cpf}</ThemedText>
        <ThemedText style={styles.clienteInfo}>Tel: {cliente.telefone}</ThemedText>
      </View>
      <View style={styles.arrow}>
        <ThemedText style={styles.arrowText}>›</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function ClientesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      await initializeClientes();
      const data = await getAllClientes();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClientes();
    }, [loadClientes])
  );

  const handleClientePress = (cliente: Cliente) => {
    router.push({
      pathname: '/cliente-detalhes',
      params: {
        cliente: JSON.stringify(cliente),
      },
    });
  };

  const handleNovoCliente = () => {
    router.push('/cliente-detalhes');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title">Clientes</ThemedText>
      </View>

      {clientes.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>Nenhum cliente cadastrado.</ThemedText>
          <ThemedText style={styles.emptySubtext}>Toque em "Novo Cliente" para começar</ThemedText>
        </View>
      ) : (
        <FlatList
          data={clientes}
          renderItem={({ item }) => (
            <ClienteItem cliente={item} onPress={handleClientePress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: BrandColors.primary }]}
        onPress={handleNovoCliente}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.buttonText}>+ Novo Cliente</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  clienteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  clienteContent: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  clienteInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  arrow: {
    marginLeft: 10,
    paddingRight: 4,
  },
  arrowText: {
    fontSize: 24,
    color: BrandColors.primary,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
