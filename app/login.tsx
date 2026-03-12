import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#F2D10B',
  secondary: '#F7DE45',
  light: '#F9E882',
  text: '#1a1a1a',
  divider: '#e0e0e0',
  success: '#4CAF50',
};

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [salvarDados, setSalvarDados] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animação do botão
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: false,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: false,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleLogin = () => {
    if (!usuario.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu usuário');
      return;
    }
    if (!senha.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha');
      return;
    }

    setLoading(true);
    // Simular delay de login
    setTimeout(() => {
      Alert.alert('Sucesso', `Bem-vindo, ${usuario}!${salvarDados ? '\nDados salvos' : ''}`);
      setLoading(false);
      // Transição entre tela de login e tela inicial
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Input Usuário */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Usuário ou Email"
              placeholderTextColor="#999"
              value={usuario}
              onChangeText={setUsuario}
              editable={!loading}
            />
          </View>

          {/* Input Senha */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Checkbox Salvar Dados */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                salvarDados && { backgroundColor: COLORS.secondary },
              ]}
              onPress={() => setSalvarDados(!salvarDados)}
              disabled={loading}
            >
              {salvarDados && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Salvar meus dados</Text>
          </View>

          {/* Botão Login Animado */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonScale }],
                opacity: buttonOpacity,
              },
            ]}
          >
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={1}
            >
              <View style={styles.button}>
                <Text style={styles.buttonText}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
          <View style={styles.helpContent}>
            <TouchableOpacity onPress={() => Alert.alert('Recuperação', 'Clique aqui para recuperar sua senha')}>
              <Text style={styles.helpLink}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>•</Text>
            <TouchableOpacity onPress={() => Alert.alert('Registro', 'Clique aqui para criar uma conta')}>
              <Text style={styles.helpLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    marginVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.light,
    backgroundColor: '#fff',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    borderRadius: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  helpTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    fontWeight: '600',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpLink: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  separator: {
    color: '#ddd',
    fontSize: 16,
  },
});
