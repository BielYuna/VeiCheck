import type { Cliente } from '@/utils/clientesStorage';
import type { Veiculo } from '@/utils/veiculosData';
import React from 'react';

export type ChecklistState = {
  cliente: Cliente | null;
  veiculo: (Veiculo & { ano?: number }) | null;
  placa: string;
  motivo: string | null;
  motivoEspecifico: string;
};

export type ChecklistActions = {
  setCliente: (cliente: Cliente | null) => void;
  setVeiculo: (veiculo: (Veiculo & { ano?: number }) | null) => void;
  setPlaca: (placa: string) => void;
  setMotivo: (motivo: string | null) => void;
  setMotivoEspecifico: (motivo: string) => void;
  reset: () => void;
};

const initialState: ChecklistState = {
  cliente: null,
  veiculo: null,
  placa: '',
  motivo: null,
  motivoEspecifico: '',
};

export const ChecklistContext = React.createContext<ChecklistState & ChecklistActions>({
  ...initialState,
  setCliente: () => {},
  setVeiculo: () => {},
  setPlaca: () => {},
  setMotivo: () => {},
  setMotivoEspecifico: () => {},
  reset: () => {},
});

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState<ChecklistState['cliente']>(null);
  const [veiculo, setVeiculo] = React.useState<ChecklistState['veiculo']>(null);
  const [placa, setPlaca] = React.useState<ChecklistState['placa']>('');
  const [motivo, setMotivo] = React.useState<ChecklistState['motivo']>(null);
  const [motivoEspecifico, setMotivoEspecifico] = React.useState<ChecklistState['motivoEspecifico']>('');

  const reset = React.useCallback(() => {
    setCliente(null);
    setVeiculo(null);
    setPlaca('');
    setMotivo(null);
    setMotivoEspecifico('');
  }, []);

  return (
    <ChecklistContext.Provider
      value={{
        cliente,
        veiculo,
        placa,
        motivo,
        motivoEspecifico,
        setCliente,
        setVeiculo,
        setPlaca,
        setMotivo,
        setMotivoEspecifico,
        reset,
      }}>
      {children}
    </ChecklistContext.Provider>
  );
}
