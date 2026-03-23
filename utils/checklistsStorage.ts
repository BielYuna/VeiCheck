import { getSharedDatabase } from './database';

export interface ChecklistHistorico {
  id: string;
  clienteNome: string;
  motoristaNome: string;
  veiculo: string;
  placa: string;
  motivo: string;
  localEntrega: string;
  pdfUri?: string;
  createdAt: string;
}

let _initialized = false;

export const initializeChecklistHistorico = async () => {
  if (_initialized) return;

  const database = await getSharedDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS checklist_historico (
        id TEXT PRIMARY KEY,
        cliente_nome TEXT NOT NULL,
        motorista_nome TEXT NOT NULL,
        veiculo TEXT NOT NULL,
        placa TEXT NOT NULL,
        motivo TEXT NOT NULL,
        local_entrega TEXT NOT NULL,
        pdf_uri TEXT,
        created_at TEXT NOT NULL
      )
    `);
  });

  try {
    await database.runAsync('ALTER TABLE checklist_historico ADD COLUMN pdf_uri TEXT');
  } catch {
    // Column already exists — safe to ignore
  }

  _initialized = true;
};

export const adicionarChecklistHistorico = async (
  dados: Omit<ChecklistHistorico, 'id' | 'createdAt'>
): Promise<void> => {
  await initializeChecklistHistorico();

  const database = await getSharedDatabase();
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO checklist_historico (
      id,
      cliente_nome,
      motorista_nome,
      veiculo,
      placa,
      motivo,
      local_entrega,
      pdf_uri,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      dados.clienteNome,
      dados.motoristaNome,
      dados.veiculo,
      dados.placa,
      dados.motivo,
      dados.localEntrega,
      dados.pdfUri ?? null,
      createdAt,
    ]
  );
};

export const listarChecklistHistorico = async (): Promise<ChecklistHistorico[]> => {
  await initializeChecklistHistorico();

  const database = await getSharedDatabase();
  type Row = {
    id: string;
    cliente_nome: string;
    motorista_nome: string;
    veiculo: string;
    placa: string;
    motivo: string;
    local_entrega: string;
    pdf_uri: string | null;
    created_at: string;
  };

  const rows = await database.getAllAsync<Row>(
    'SELECT * FROM checklist_historico ORDER BY datetime(created_at) DESC'
  );

  return rows.map((row) => ({
    id: row.id,
    clienteNome: row.cliente_nome,
    motoristaNome: row.motorista_nome,
    veiculo: row.veiculo,
    placa: row.placa,
    motivo: row.motivo,
    localEntrega: row.local_entrega,
    pdfUri: row.pdf_uri ?? undefined,
    createdAt: row.created_at,
  }));
};

export const deletarChecklistHistorico = async (id: string): Promise<void> => {
  await initializeChecklistHistorico();

  const database = await getSharedDatabase();
  await database.runAsync('DELETE FROM checklist_historico WHERE id = ?', [id]);
};
