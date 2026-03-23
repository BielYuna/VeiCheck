import { getSharedDatabase } from './database';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  cidade?: string;
  estado?: string;
}

const CLIENTES_EXEMPLO: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    cpf: '123.456.789-01',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
  },
  {
    id: '2',
    nome: 'Maria Oliveira Costa',
    cpf: '234.567.890-12',
    telefone: '(21) 99876-5432',
    endereco: 'Av. Paulista, 456 - São Paulo, SP',
  },
  {
    id: '3',
    nome: 'Carlos Alberto Menezes',
    cpf: '345.678.901-23',
    telefone: '(31) 98765-4321',
    endereco: 'Rua das Acácias, 789 - Belo Horizonte, MG',
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    cpf: '456.789.012-34',
    telefone: '(85) 98765-4321',
    endereco: 'Av. Beira Mar, 321 - Fortaleza, CE',
  },
  {
    id: '5',
    nome: 'Roberto Gomes Pereira',
    cpf: '567.890.123-45',
    telefone: '(51) 98765-4321',
    endereco: 'Rua das Conveniências, 654 - Porto Alegre, RS',
  },
  {
    id: '6',
    nome: 'Fernanda Ribeiro Souza',
    cpf: '678.901.234-56',
    telefone: '(47) 98765-4321',
    endereco: 'Av. Getúlio Vargas, 987 - Curitiba, PR',
  },
];

// Abrir conexão com banco de dados
const getDatabase = getSharedDatabase;

// Inicializar banco de dados
export const initializeClientes = async () => {
  try {
    const database = await getDatabase();
    
    // Criar tabela se não existir
    await database.withTransactionAsync(async () => {
      await database.runAsync(`
        CREATE TABLE IF NOT EXISTS clientes (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          cpf TEXT NOT NULL,
          telefone TEXT NOT NULL,
          endereco TEXT
        )
      `);
    });

    // Migração: adicionar novas colunas se não existirem
    const newColumns = [
      'ALTER TABLE clientes ADD COLUMN cep TEXT',
      'ALTER TABLE clientes ADD COLUMN cidade TEXT',
      'ALTER TABLE clientes ADD COLUMN estado TEXT',
    ];
    for (const sql of newColumns) {
      try {
        await database.runAsync(sql);
      } catch {
        // Coluna já existe, ignorar
      }
    }

    // Verificar se há dados
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM clientes'
    );

    if (!result || result.count === 0) {
      // Inserir dados de exemplo
      for (const cliente of CLIENTES_EXEMPLO) {
        await database.runAsync(
          'INSERT INTO clientes (id, nome, cpf, telefone, endereco) VALUES (?, ?, ?, ?, ?)',
          [cliente.id, cliente.nome, cliente.cpf, cliente.telefone, cliente.endereco]
        );
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Obter todos os clientes
export const getAllClientes = async (): Promise<Cliente[]> => {
  try {
    const database = await getDatabase();
    const rows = await database.getAllAsync<Cliente>(
      'SELECT id, nome, cpf, telefone, endereco, cidade, estado FROM clientes ORDER BY nome ASC'
    );
    return rows || [];
  } catch (error) {
    console.error('Erro ao obter clientes:', error);
    return [];
  }
};

// Obter cliente por ID
export const getClienteById = async (id: string): Promise<Cliente | null> => {
  try {
    const database = await getDatabase();
    const cliente = await database.getFirstAsync<Cliente>(
      'SELECT id, nome, cpf, telefone, endereco, cidade, estado FROM clientes WHERE id = ?',
      [id]
    );
    return cliente || null;
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    return null;
  }
};

// Adicionar novo cliente
export const adicionarCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    const database = await getDatabase();
    const novoId = Date.now().toString();
    
    await database.runAsync(
      'INSERT INTO clientes (id, nome, cpf, telefone, endereco, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [novoId, cliente.nome, cliente.cpf, cliente.telefone, cliente.endereco, cliente.cidade || null, cliente.estado || null]
    );

    return {
      id: novoId,
      ...cliente,
    };
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    throw error;
  }
};

// Atualizar cliente
export const atualizarCliente = async (cliente: Cliente): Promise<void> => {
  try {
    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, endereco = ?, cidade = ?, estado = ? WHERE id = ?',
      [cliente.nome, cliente.cpf, cliente.telefone, cliente.endereco, cliente.cidade || null, cliente.estado || null, cliente.id]
    );
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

// Deletar cliente
export const deletarCliente = async (id: string): Promise<void> => {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM clientes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    throw error;
  }
};
