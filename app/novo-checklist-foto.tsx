import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect, useMemo } from 'react';
import { Alert, Animated, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistContext } from './context/ChecklistContext';

export default function NovoChecklistFotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { photos, setPhotos } = useContext(ChecklistContext);

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

  const hasPhoto = useMemo(() => !!photos[0], [photos]);
  const photoUri = useMemo(() => photos[0] || '', [photos]);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar um foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotos((prev) => {
        const next = [...prev];
        next[0] = uri;
        return next;
      });
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert('Remover foto', 'Deseja remover a foto selecionada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () =>
          setPhotos((prev) => {
            const next = [...prev];
            next[0] = '';
            return next;
          }),
      },
    ]);
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleAvancar = () => {
    if (!hasPhoto) return;
    router.push('/novo-checklist-avarias');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '50%', backgroundColor: '#51eb7c' }]} />
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
          Foto da frente do veículo
        </ThemedText>
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('@/animated/Travel.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <View style={styles.photosContainer}>
          <View style={styles.photosGrid}>
            <TouchableOpacity
              style={[styles.photoSlot, hasPhoto && styles.photoSlotSelected]}
              onPress={hasPhoto ? handleRemovePhoto : handlePickPhoto}>
              {hasPhoto ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="add-a-photo" size={32} color="#999" />
              )}
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.photoHintText}>
            Toque para {hasPhoto ? 'remover' : 'adicionar'} a foto da frente do veículo
          </ThemedText>
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
            { backgroundColor: BrandColors.primary, opacity: hasPhoto ? 1 : 0.5 },
          ]}
          onPress={handleAvancar}
          disabled={!hasPhoto}>
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
  },
  animationContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  animation: {
    width: 220,
    height: 220,
    marginBottom: -50,
  },
  photosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 12,
  },
  photosGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoSlot: {
    width: 140,
    height: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  photoSlotSelected: {
    borderColor: BrandColors.primary,
    borderWidth: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  photoHintText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});
