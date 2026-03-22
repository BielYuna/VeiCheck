import { useAuth } from '@/app/context/AuthContext';
import { atualizarUsuario } from '@/utils/usuariosStorage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const MENU_WIDTH = Dimensions.get('window').width * 0.82;

const COLORS = {
  primary: '#F2D10B',
  text: '#1a1a1a',
  divider: '#e0e0e0',
  bg: '#f5f7fa',
};

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      // Populate fields from user
      setNome(user?.nome ?? '');
      setTelefone(user?.telefone ?? '');
      setCpfCnpj(user?.cpfCnpj ?? '');
      setEndereco(user?.endereco ?? '');
      setEmail(user?.email ?? '');
      setEditing(false);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, user, slideAnim]);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0] && user) {
      const uri = result.assets[0].uri;
      const updated = { ...user, fotoUri: uri };
      await atualizarUsuario(updated);
      setUser(updated);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) return Alert.alert('Erro', 'Preencha o nome.');
    if (!telefone.trim()) return Alert.alert('Erro', 'Preencha o telefone.');
    if (!cpfCnpj.trim()) return Alert.alert('Erro', 'Preencha o CPF/CNPJ.');
    if (!endereco.trim()) return Alert.alert('Erro', 'Preencha o endereço.');
    if (!email.trim() || !email.includes('@')) return Alert.alert('Erro', 'Digite um e-mail válido.');
    if (!user) return;

    setSaving(true);
    try {
      const updated = { ...user, nome, telefone, cpfCnpj, endereco, email };
      await atualizarUsuario(updated);
      setUser(updated);
      setEditing(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          setUser(null);
          onClose();
          router.replace('/login');
        },
      },
    ]);
  };

  const initials = (user?.nome ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.drawerContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrapper}>
                {user?.fotoUri ? (
                  <Image source={{ uri: user.fotoUri }} style={styles.avatar} />
                ) : (
                  <Image source={require('@/animated/ImageUser.png')} style={styles.avatar} />
                )}
                <View style={styles.cameraIcon}>
                  <Text style={styles.cameraIconText}>📷</Text>
                </View>
              </TouchableOpacity>
              {!editing && (
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.nome ?? '—'}
                </Text>
              )}
            </View>

            {/* Info / Edit fields */}
            {editing ? (
              <View style={styles.fieldsSection}>
                {[
                  { label: 'Nome completo', value: nome, setter: setNome, keyboard: 'default' as const },
                  { label: 'Telefone', value: telefone, setter: setTelefone, keyboard: 'phone-pad' as const },
                  { label: 'CPF / CNPJ', value: cpfCnpj, setter: setCpfCnpj, keyboard: 'numeric' as const },
                  { label: 'Endereço', value: endereco, setter: setEndereco, keyboard: 'default' as const },
                  { label: 'E-mail', value: email, setter: setEmail, keyboard: 'email-address' as const },
                ].map((field) => (
                  <View key={field.label} style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={field.value}
                      onChangeText={field.setter}
                      keyboardType={field.keyboard}
                      autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                      editable={!saving}
                    />
                  </View>
                ))}

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => setEditing(false)}
                    disabled={saving}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.saveBtn]}
                    onPress={handleSave}
                    disabled={saving}>
                    <Text style={styles.saveBtnText}>{saving ? 'Salvando…' : 'Salvar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoSection}>
                {[
                  { label: 'Telefone', value: user?.telefone },
                  { label: 'CPF / CNPJ', value: user?.cpfCnpj },
                  { label: 'Endereço', value: user?.endereco },
                  { label: 'E-mail', value: user?.email },
                ].map((item) => (
                  <View key={item.label} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{item.value ?? '—'}</Text>
                  </View>
                ))}

                <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                  <Text style={styles.editBtnText}>✏️  Editar informações</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

export function ProfileIconButton({ onPress, fotoUri, nome }: { onPress: () => void; fotoUri?: string; nome?: string }) {
  const initials = (nome ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <TouchableOpacity onPress={onPress} style={styles.profileIconButton} activeOpacity={0.8}>
      <View style={styles.profileIconContainer}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.profileIconImage} />
        ) : (
          <Image source={require('@/animated/ImageUser.png')} style={styles.profileIconImage} />
        )}
      </View>
      <Text style={styles.profileIconLabel}>Menu</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#fff',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  drawerContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  cameraIconText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  infoSection: {
    gap: 12,
    marginBottom: 12,
  },
  infoRow: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  editBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  fieldsSection: {
    gap: 10,
    marginBottom: 12,
  },
  fieldWrapper: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: '#fff',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 16,
  },
  logoutBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  // Profile icon button (used in home screen)
  profileIconButton: {
    marginLeft: 16,
    marginTop: 4,
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: 'hidden',
  },
  profileIconLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
    textAlign: 'center',
  },
  profileIconImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileIconPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileIconInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});
