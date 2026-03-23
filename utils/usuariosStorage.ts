import { getSharedDatabase } from './database';

export interface Usuario {
  id: string;
  nome: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
  email: string;
  senha: string;
  fotoUri?: string;
}

const getDatabase = getSharedDatabase;

const normalizeTelefone = (telefone: string) => telefone.replace(/\D/g, '');

export const initializeUsuarios = async () => {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        cpf_cnpj TEXT NOT NULL,
        endereco TEXT NOT NULL,
        email TEXT NOT NULL,
        senha TEXT NOT NULL,
        foto_uri TEXT
      )
    `);
  });
  // Migrate: add foto_uri column for existing databases
  try {
    await database.runAsync(`ALTER TABLE usuarios ADD COLUMN foto_uri TEXT`);
  } catch {
    // Column already exists — safe to ignore
  }
};

export const cadastrarUsuario = async (dados: Omit<Usuario, 'id'>): Promise<void> => {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM usuarios WHERE email = ?',
    [dados.email.toLowerCase()]
  );
  if (existing) throw new Error('E-mail já cadastrado.');
  const id = Date.now().toString();
  await database.runAsync(
    'INSERT INTO usuarios (id, nome, telefone, cpf_cnpj, endereco, email, senha) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, dados.nome, dados.telefone, dados.cpfCnpj, dados.endereco, dados.email.toLowerCase(), dados.senha]
  );
};

export const loginUsuario = async (email: string, senha: string): Promise<Usuario | null> => {
  const database = await getDatabase();
  type Row = { id: string; nome: string; telefone: string; cpf_cnpj: string; endereco: string; email: string; senha: string; foto_uri: string | null };
  const row = await database.getFirstAsync<Row>(
    'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
    [email.toLowerCase(), senha]
  );
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    cpfCnpj: row.cpf_cnpj,
    endereco: row.endereco,
    email: row.email,
    senha: row.senha,
    fotoUri: row.foto_uri ?? undefined,
  };
};

export const atualizarUsuario = async (usuario: Omit<Usuario, 'senha'>): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE usuarios SET nome = ?, telefone = ?, cpf_cnpj = ?, endereco = ?, email = ?, foto_uri = ? WHERE id = ?',
    [usuario.nome, usuario.telefone, usuario.cpfCnpj, usuario.endereco, usuario.email.toLowerCase(), usuario.fotoUri ?? null, usuario.id]
  );
};

export const buscarUsuarioPorTelefone = async (telefone: string): Promise<Usuario | null> => {
  const telefoneNormalizado = normalizeTelefone(telefone);
  if (!telefoneNormalizado) return null;

  const database = await getDatabase();
  type Row = {
    id: string;
    nome: string;
    telefone: string;
    cpf_cnpj: string;
    endereco: string;
    email: string;
    senha: string;
    foto_uri: string | null;
  };

  const rows = await database.getAllAsync<Row>('SELECT * FROM usuarios');
  const row = rows.find((item) => normalizeTelefone(item.telefone) === telefoneNormalizado);
  if (!row) return null;

  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    cpfCnpj: row.cpf_cnpj,
    endereco: row.endereco,
    email: row.email,
    senha: row.senha,
    fotoUri: row.foto_uri ?? undefined,
  };
};

export const redefinirSenhaPorTelefone = async (
  telefone: string,
  novaSenha: string
): Promise<boolean> => {
  const usuario = await buscarUsuarioPorTelefone(telefone);
  if (!usuario) return false;

  const database = await getDatabase();
  await database.runAsync('UPDATE usuarios SET senha = ? WHERE id = ?', [novaSenha, usuario.id]);
  return true;
};
