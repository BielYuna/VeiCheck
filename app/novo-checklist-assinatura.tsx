import { SignaturePad } from '@/components/signature-pad';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistContext } from './context/ChecklistContext';

export default function NovoChecklistAssinaturaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signatureStrokes, setSignatureStrokes } = useContext(ChecklistContext);
  // Local strokes — decoupled from Context during drawing to avoid global re-renders on every stroke
  const [localStrokes, setLocalStrokes] = useState(signatureStrokes);

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

  const hasSignature = useMemo(() => {
    return localStrokes.some((stroke) => stroke.length > 0);
  }, [localStrokes]);

  const handleConfirm = () => {
    if (!hasSignature) {
      Alert.alert('Atenção', 'Por favor, peça ao cliente para assinar antes de continuar.');
      return;
    }
    setSignatureStrokes(localStrokes);
    router.push('/novo-checklist-final');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '94%', backgroundColor: '#51eb7c' }]} />
      </View>

      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <LottieView
          source={require('@/animated/Loading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <ThemedText style={[styles.messageText, { marginTop: 8 }]}>Assine abaixo</ThemedText>
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionSubtitle}>
            Use o dedo para assinar no campo abaixo.
          </ThemedText>
          <SignaturePad
            strokes={localStrokes}
            onChange={setLocalStrokes}
            placeholder="Arraste o dedo para assinar"
            style={styles.signaturePad}
          />
          <View style={styles.signatureActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => { setLocalStrokes([]); setSignatureStrokes([]); }}>
              <ThemedText style={styles.clearButtonText}>Limpar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => router.back()}>
          <ThemedText style={styles.buttonSecondaryText}>Voltar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: BrandColors.primary, opacity: hasSignature ? 1 : 0.5 },
          ]}
          onPress={handleConfirm}
          disabled={!hasSignature}>
          <ThemedText style={styles.buttonText}>Salvar e continuar</ThemedText>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
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
    marginBottom: 8,
  },
  messageText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  signaturePad: {
    marginTop: 10,
    marginBottom: 10,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 18,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
