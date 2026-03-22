import type { Cliente } from '@/utils/clientesStorage';
import type { Veiculo } from '@/utils/veiculosData';
import React from 'react';

export type ChecklistState = {
  cliente: Cliente | null;
  veiculo: (Veiculo & { ano?: number }) | null;
  placa: string;
  motivo: string | null;
  motivoEspecifico: string;
  motivoTraseira: string | null;
  motivoEspecificoTraseira: string;
  photos: string[];
  avarias: Record<string, string>;
  observacao: string;
  localEntregaTipo: 'cliente' | 'outro';
  localEntrega: string;
  opcionais: Record<string, boolean>;
  /** Captures the customer signature as a list of strokes (each stroke is an array of points) */
  signatureStrokes: { x: number; y: number }[][];
};

export type ChecklistActions = {
  setCliente: (cliente: Cliente | null) => void;
  setVeiculo: (veiculo: (Veiculo & { ano?: number }) | null) => void;
  setPlaca: (placa: string) => void;
  setMotivo: (motivo: string | null) => void;
  setMotivoEspecifico: (motivo: string) => void;
  setMotivoTraseira: (motivo: string | null) => void;
  setMotivoEspecificoTraseira: (motivo: string) => void;
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  setAvarias: (avarias: Record<string, string>) => void;
  setObservacao: (observacao: string) => void;
  setLocalEntregaTipo: (tipo: 'cliente' | 'outro') => void;
  setLocalEntrega: (local: string) => void;
  setOpcionais: (opcionais: Record<string, boolean>) => void;
  setSignatureStrokes: React.Dispatch<React.SetStateAction<ChecklistState['signatureStrokes']>>;
  reset: () => void;
};

const initialState: ChecklistState = {
  cliente: null,
  veiculo: null,
  placa: '',
  motivo: null,
  motivoEspecifico: '',
  motivoTraseira: null,
  motivoEspecificoTraseira: '',
  photos: [],
  avarias: {},
  observacao: '',
  localEntregaTipo: 'cliente',
  localEntrega: '',
  opcionais: {},
  signatureStrokes: [],
};

export const ChecklistContext = React.createContext<ChecklistState & ChecklistActions>({
  ...initialState,
  setCliente: () => {},
  setVeiculo: () => {},
  setPlaca: () => {},
  setMotivo: () => {},
  setMotivoEspecifico: () => {},
  setMotivoTraseira: () => {},
  setMotivoEspecificoTraseira: () => {},
  setPhotos: () => {},
  setAvarias: () => {},
  setObservacao: () => {},
  setLocalEntregaTipo: () => {},
  setLocalEntrega: () => {},
  setOpcionais: () => {},
  setSignatureStrokes: () => {},
  reset: () => {},
});

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState<ChecklistState['cliente']>(null);
  const [veiculo, setVeiculo] = React.useState<ChecklistState['veiculo']>(null);
  const [placa, setPlaca] = React.useState<ChecklistState['placa']>('');
  const [motivo, setMotivo] = React.useState<ChecklistState['motivo']>(null);
  const [motivoEspecifico, setMotivoEspecifico] = React.useState<ChecklistState['motivoEspecifico']>('');
  const [motivoTraseira, setMotivoTraseira] = React.useState<ChecklistState['motivoTraseira']>(null);
  const [motivoEspecificoTraseira, setMotivoEspecificoTraseira] = React.useState<ChecklistState['motivoEspecificoTraseira']>('');
  const [photos, setPhotos] = React.useState<ChecklistState['photos']>([]);
  const [avarias, setAvarias] = React.useState<ChecklistState['avarias']>({});
  const [observacao, setObservacao] = React.useState<ChecklistState['observacao']>('');
  const [localEntregaTipo, setLocalEntregaTipo] = React.useState<ChecklistState['localEntregaTipo']>('cliente');
  const [localEntrega, setLocalEntrega] = React.useState<ChecklistState['localEntrega']>('');
  const [opcionais, setOpcionais] = React.useState<ChecklistState['opcionais']>({});
  const [signatureStrokes, setSignatureStrokes] = React.useState<ChecklistState['signatureStrokes']>([]);

  const reset = React.useCallback(() => {
    setCliente(null);
    setVeiculo(null);
    setPlaca('');
    setMotivo(null);
    setMotivoEspecifico('');
    setMotivoTraseira(null);
    setMotivoEspecificoTraseira('');
    setPhotos([]);
    setAvarias({});
    setObservacao('');
    setLocalEntregaTipo('cliente');
    setLocalEntrega('');
    setOpcionais({});
    setSignatureStrokes([]);
  }, []);

  return (
    <ChecklistContext.Provider
      value={{
        cliente,
        veiculo,
        placa,
        motivo,
        motivoEspecifico,
        motivoTraseira,
        motivoEspecificoTraseira,
        photos,
        avarias,
        observacao,
        localEntregaTipo,
        localEntrega,
        opcionais,
        signatureStrokes,
        setCliente,
        setVeiculo,
        setPlaca,
        setMotivo,
        setMotivoEspecifico,
        setMotivoTraseira,
        setMotivoEspecificoTraseira,
        setPhotos,
        setAvarias,
        setObservacao,
        setLocalEntregaTipo,
        setLocalEntrega,
        setOpcionais,
        setSignatureStrokes,
        reset,
      }}>
      {children}
    </ChecklistContext.Provider>
  );
}
