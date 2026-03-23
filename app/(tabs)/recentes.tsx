import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import {
    deletarChecklistHistorico,
    listarChecklistHistorico,
    type ChecklistHistorico,
} from '@/utils/checklistsStorage';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

type ItemProps = {
  item: ChecklistHistorico;
  onSend: (item: ChecklistHistorico) => void;
  onDelete: (item: ChecklistHistorico) => void;
};

function HistoricoItem({ item, onSend, onDelete }: ItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle} numberOfLines={1}>
          {item.clienteNome || 'Cliente não informado'}
        </ThemedText>
        <TouchableOpacity
          onPress={() => onDelete(item)}
          style={styles.deleteButton}
          accessibilityLabel="Excluir checklist"
          activeOpacity={0.7}>
          <MaterialIcons name="delete-outline" size={22} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.infoText}>Data: {formatDate(item.createdAt)}</ThemedText>
      <ThemedText style={styles.infoText}>Motorista: {item.motoristaNome || '-'}</ThemedText>
      <ThemedText style={styles.infoText}>Veículo: {item.veiculo || '-'}</ThemedText>
      <ThemedText style={styles.infoText}>Placa: {item.placa || '-'}</ThemedText>
      <ThemedText style={styles.infoText}>Motivo: {item.motivo || '-'}</ThemedText>
      <ThemedText style={styles.infoText}>Local de entrega: {item.localEntrega || '-'}</ThemedText>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => onSend(item)}
        activeOpacity={0.8}
        accessibilityLabel="Enviar PDF do checklist">
        <MaterialIcons name="send" size={18} color="#fff" />
        <ThemedText style={styles.sendButtonText}>Enviar</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function RecentesScreen() {
  const insets = useSafeAreaInsets();
  const [historico, setHistorico] = useState<ChecklistHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarHistorico = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listarChecklistHistorico();
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de checklists.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico])
  );

  const confirmarExclusao = useCallback((item: ChecklistHistorico) => {
    Alert.alert(
      'Excluir checklist',
      'Tem certeza que deseja remover este checklist do histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarChecklistHistorico(item.id);
              setHistorico((prev) => prev.filter((checklist) => checklist.id !== item.id));
            } catch (error) {
              console.error('Erro ao excluir checklist:', error);
              Alert.alert('Erro', 'Não foi possível excluir este checklist.');
            }
          },
        },
      ]
    );
  }, []);

  const enviarChecklist = useCallback(async (item: ChecklistHistorico) => {
    if (item.pdfUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(item.pdfUri);
        if (fileInfo.exists) {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(item.pdfUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar checklist',
              UTI: 'com.adobe.pdf',
            });
            return;
          }
          Alert.alert('Aviso', 'Não foi possível compartilhar o PDF neste dispositivo.');
          return;
        }
      } catch (error) {
        console.error('Erro ao abrir PDF salvo do histórico:', error);
      }
    }

    const safe = (value: string | number | null | undefined) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reemissão de Checklist</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; padding: 20px; }
          h1 { font-size: 22px; color: #0f3d8a; margin-bottom: 12px; }
          .sub { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
          .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; background: #f9fafb; }
          .item { margin-bottom: 8px; font-size: 14px; }
          .label { font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>Reemissão de Checklist</h1>
        <div class="sub">Gerado em ${safe(new Date().toLocaleString('pt-BR'))}</div>
        <div class="card">
          <div class="item"><span class="label">Data original:</span> ${safe(formatDate(item.createdAt))}</div>
          <div class="item"><span class="label">Cliente:</span> ${safe(item.clienteNome)}</div>
          <div class="item"><span class="label">Motorista:</span> ${safe(item.motoristaNome)}</div>
          <div class="item"><span class="label">Veículo:</span> ${safe(item.veiculo)}</div>
          <div class="item"><span class="label">Placa:</span> ${safe(item.placa)}</div>
          <div class="item"><span class="label">Motivo:</span> ${safe(item.motivo)}</div>
          <div class="item"><span class="label">Local de entrega:</span> ${safe(item.localEntrega)}</div>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar checklist',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Aviso', 'Não foi possível compartilhar o PDF neste dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF do histórico:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF do checklist.');
    }
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title">Histórico de checklists</ThemedText>
      </View>

      {historico.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Nenhum checklist finalizado</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Quando finalizar um checklist, ele aparecerá aqui.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoricoItem item={item} onSend={enviarChecklist} onDelete={confirmarExclusao} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#f6f7f9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdecec',
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  sendButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: BrandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});
