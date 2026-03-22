import { Usuario } from '@/utils/usuariosStorage';
import React, { createContext, useContext, useState } from 'react';

interface AuthContextData {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
}

export const AuthContext = createContext<AuthContextData>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
