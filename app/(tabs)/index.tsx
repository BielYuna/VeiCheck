import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleNovoChecklist = () => {
    router.push('/novo-checklist');
  };

  return (
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

      {/* Botão Novo CheckList na posição inferior central */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: BrandColors.primary }]}
        onPress={handleNovoChecklist}>
        <ThemedText style={styles.buttonText}>Novo CheckList</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
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
  button: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Sombra para Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 100, //Posicao vertical do botao, pode ser ajustada conforme necessário
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
