import {
    buscarUsuarioPorTelefone,
    initializeUsuarios,
    redefinirSenhaPorTelefone,
} from '@/utils/usuariosStorage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#F2D10B',
  secondary: '#F7DE45',
  text: '#1a1a1a',
  divider: '#e0e0e0',
};

export default function RecuperarSenhaScreen() {
  const [telefone, setTelefone] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecuperarSenha = async () => {
    if (!telefone.trim()) {
      Alert.alert('Erro', 'Informe o telefone cadastrado.');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await initializeUsuarios();
      const usuario = await buscarUsuarioPorTelefone(telefone.trim());

      if (!usuario) {
        Alert.alert('Não encontrado', 'Nenhum usuário foi encontrado com este telefone.');
        return;
      }

      const senhaAtualizada = await redefinirSenhaPorTelefone(telefone.trim(), novaSenha);
      if (!senhaAtualizada) {
        Alert.alert('Erro', 'Não foi possível atualizar a senha.');
        return;
      }

      Alert.alert(
        'Senha atualizada',
        'Sua senha foi redefinida com sucesso. Faça login com a nova senha.',
        [{ text: 'OK', onPress: () => router.replace('/login') }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível recuperar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Recuperar senha</Text>
            <Text style={styles.subtitle}>
              Confirme seu telefone cadastrado e defina uma nova senha.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Telefone cadastrado</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: (11) 99999-9999"
                placeholderTextColor="#999"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nova senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#999"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirmar nova senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita a nova senha"
                placeholderTextColor="#999"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRecuperarSenha}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Atualizando senha...' : 'Redefinir senha'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  form: {
    gap: 4,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
