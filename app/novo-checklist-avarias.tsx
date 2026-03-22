import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useMemo } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistContext } from './context/ChecklistContext';

const items = [
  'Faróis',
  'Faróis Auxiliares',
  'Lanterna DI',
  'Lanterna E',
  'Parabrisa',
  'Para-choque',
  'Palhetas',
];

const statuses = [
  { key: 'S', label: 'S', labelFull: 'Sim' },
  { key: 'I', label: 'I', labelFull: 'Incompleto' },
  { key: 'N', label: 'N', labelFull: 'Não' },
  { key: 'A', label: 'A', labelFull: 'Avariado' },
] as const;

type StatusKey = (typeof statuses)[number]['key'];

export default function NovoChecklistAvariasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { avarias, setAvarias } = useContext(ChecklistContext);
  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeinAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(fadeinAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeinAnim, slideAnim]);

  const canSubmit = useMemo(() => {
    return items.every((item) => !!avarias[item]);
  }, [avarias]);

  const statusColors: Record<StatusKey, { background: string; border: string }> = {
    S: { background: '#5ede7f', border: '#5ede7f' },
    I: { background: '#f7b500', border: '#f7b500' },
    N: { background: '#f7b500', border: '#f7b500' },
    A: { background: '#ef4d50', border: '#ef4d50' },
  };

  const handleSetStatus = (item: string, status: StatusKey) => {
    const current = avarias[item] ?? '';
    const selectedSet = new Set(current.split(''));

    const isSelected = selectedSet.has(status);

    // Toggle off
    if (isSelected) {
      selectedSet.delete(status);

      // If we remove S, we must also remove A (A requires S)
      if (status === 'S') {
        selectedSet.delete('A');
      }

      // If we remove N, just clear it
      const next = Array.from(selectedSet).join('');
      if (!next) {
        const nextAvarias = { ...avarias };
        delete nextAvarias[item];
        setAvarias(nextAvarias);
      } else {
        setAvarias({
          ...avarias,
          [item]: next,
        });
      }

      return;
    }

    // Toggle on
    // Selecting N overrides everything.
    if (status === 'N') {
      setAvarias({
        ...avarias,
        [item]: 'N',
      });
      return;
    }

    // If currently N and selecting something else, replace it.
    if (selectedSet.has('N')) {
      selectedSet.clear();
    }

    // Selecting A should implicitly select S.
    if (status === 'A') {
      selectedSet.add('S');
    }

    selectedSet.add(status);

    setAvarias({
      ...avarias,
      [item]: Array.from(selectedSet).join(''),
    });
  };
  const handleVoltar = () => {
    router.back();
  };

  const handleAvancar = () => {
    if (!canSubmit) return;

    console.log('Avarias:', avarias);

    // Navega para a captura de foto traseira
    router.push('/novo-checklist-foto-traseira');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '75%', backgroundColor: '#51eb7c' }]} />
      </View>

      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <View style={styles.legendContainer}>
          <ThemedText style={[styles.legendText, { fontSize: 13 },{ fontWeight: '600' }]}>
            S = Sim (Existe) • N = Não (Não existe) • I = Incompleto • A = Avariado
          </ThemedText>
        </View>

        <View style={styles.avariasContainer}>
          <ThemedText style={[styles.sectionTitle, { marginBottom: 12 }]}>Avarias frente do veículo:</ThemedText>
          <View style={styles.avariasTable}>
            
            {items.map((item) => {
              const selected = avarias[item] ?? '';
              return (
                <View key={item} style={styles.avariaRow}>
                  <ThemedText style={styles.avariaLabel}>{item}</ThemedText>
                  <View style={styles.statusRow}>
                    {statuses.map((status) => {
                      const hasN = selected.includes('N');
                      const isActive = selected.includes(status.key);
                      const isDisabled = hasN && status.key !== 'N';

                      return (
                        <TouchableOpacity
                          key={status.key}
                          style={[
                            styles.statusButton,
                            isActive && {
                              backgroundColor: statusColors[status.key].background,
                              borderColor: statusColors[status.key].border,
                            },
                            isDisabled && styles.statusButtonDisabled,
                          ]}
                          disabled={isDisabled}
                          onPress={() => handleSetStatus(item, status.key)}>
                          <ThemedText
                            style={[
                              styles.statusButtonText,
                              isActive && styles.statusButtonTextActive,
                            ]}>
                            {status.label}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
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
            { backgroundColor: BrandColors.primary, opacity: canSubmit ? 1 : 0.5 },
          ]}
          onPress={handleAvancar}
          disabled={!canSubmit}>
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
    alignItems: 'center',
  },
  photosContainer: {
    marginBottom: 0,
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  photoSlot: {
    width: 240,
    maxWidth: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSlotSelected: {
    borderColor: BrandColors.primary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  legendContainer: {
    width: '100%',
    maxWidth: 520,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  avariasContainer: {
    marginTop: 0,
    marginBottom: 24,
    width: '100%',
    maxWidth: 520,
  },
  avariasTable: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
  },
  avariaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avariaLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#f7f7f7',
  },
  statusButtonDisabled: {
    opacity: 0.4,
  },

  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statusButtonTextActive: {
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
