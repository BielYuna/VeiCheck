import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import {
    Animated,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NovoChecklistPlacaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeinAnim = React.useRef(new Animated.Value(0)).current;
  const [placa, setPlaca] = React.useState('');

  const veiculoSelecionado = React.useMemo(() => {
    if (!params.veiculo) return null;
    try {
      return JSON.parse(String(params.veiculo));
    } catch {
      return null;
    }
  }, [params.veiculo]);

  const usuarioSelecionado = React.useMemo(() => {
    if (!params.usuario) return null;
    try {
      return JSON.parse(String(params.usuario));
    } catch {
      return null;
    }
  }, [params.usuario]);

  const isPlacaValida = React.useMemo(() => {
    const normalized = placa.trim().toUpperCase();
    const regex = /^([A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/;
    return regex.test(normalized);
  }, [placa]);

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
    if (!isPlacaValida) return;

    console.log('Usuário:', usuarioSelecionado, 'Placa:', placa, 'Veículo:', veiculoSelecionado);
    // router.push('/novo-checklist-dados'); // descomente quando a próxima tela estiver pronta
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
          Agora a placa do veículo
        </ThemedText>
      </Animated.View>

      <ThemedView style={styles.container}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('@/animated/PlateCar.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </ThemedView>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { fontSize: 20, fontWeight: '600' }]}>Placa do veículo:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ex: ABC1234 ou ABC1D23"
            placeholderTextColor="#999999"
            value={placa}
            onChangeText={(text) => setPlaca(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          {!isPlacaValida && placa.trim().length > 0 && (
            <ThemedText style={[styles.subtitle, { color: '#e63946' }]}>Placa inválida. Use ABC1234 ou ABC1D23.</ThemedText>
          )}
          {veiculoSelecionado && (
            <ThemedText style={styles.subtitle}>
              {`Veículo selecionado: ${veiculoSelecionado.marca} ${veiculoSelecionado.modelo} (${veiculoSelecionado.ano ?? '---'})`}
            </ThemedText>
          )}
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
            { backgroundColor: BrandColors.primary, opacity: isPlacaValida ? 1 : 0.5 },
          ]}
          onPress={handleAvancar}
          disabled={!isPlacaValida}>
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
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    backgroundColor: '#fff',
    color: '#333',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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
