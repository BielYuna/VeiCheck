import { useAuth } from '@/app/context/AuthContext';
import { ProfileIconButton, ProfileMenu } from '@/components/profile-menu';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleNovoChecklist = () => {
    router.push('/novo-checklist');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Profile icon — top left */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <ProfileIconButton
          onPress={() => setMenuVisible(true)}
          fotoUri={user?.fotoUri}
          nome={user?.nome}
        />
      </View>

      <ProfileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      {/* Espaço central para animação */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require('@/animated/Initial.json')}
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
    paddingTop: 0,
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    paddingBottom: 4,
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
