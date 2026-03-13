// Dados de marcas e modelos de veículos do Brasil
export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano?: number;
}

export const veiculosPorMarca: { [key: string]: string[] } = {
  Fiat: [
    'Argo',
    'Cronos',
    'Fastback',
    'Mobi',
    'Uno',
    'Pulse',
    'Titano',
    'Strada',
    'Toro',
    'Professional',
  ],
  Volkswagen: [
    'Gol',
    'Polo',
    'Virtus',
    'T-Cross',
    'Taos',
    'Tiguan',
    'Saveiro',
    'Amarok',
    'Consonantino',
  ],
  Chevrolet: [
    'Onix',
    'Onix Plus',
    'Tracker',
    'Equinox',
    'Blazer',
    'S10',
    'Montana',
    'Spin',
  ],
  Hyundai: [
    'HB20',
    'Creta',
    'Tucson',
    'Santa Fe',
    'Venue',
    'i30',
    'Elantra',
  ],
  Toyota: [
    'Corolla',
    'Hilux',
    'SW4',
    'Yaris',
    'Etios',
    'Camry',
    'RAV4',
    'Prius',
  ],
  Honda: [
    'Civic',
    'WR-V',
    'Fit',
    'HR-V',
    'CR-V',
    'Accord',
    'Odyssey',
    'City',
  ],
  Renault: [
    'Kwid',
    'Sandero',
    'Duster',
    'Captur',
    'Arkana',
    'Master',
    'Kangoo',
  ],
  Kia: [
    'Picanto',
    'Cerato',
    'Sportage',
    'Sorento',
    'Telluride',
    'Niro',
    'Rio',
  ],
  Suzuki: [
    'Alto',
    'Celerio',
    'Swift',
    'Vitara',
    'Jimny',
    'Ciaz',
  ],
  Jeep: [
    'Renegade',
    'Compass',
    'Wrangler',
    'Gladiator',
    'Cherokee',
  ],
  Peugeot: [
    '208',
    '308',
    '2008',
    '3008',
    '5008',
    'Partner',
    'Boxer',
  ],
  Citroën: [
    'C3',
    'C3 Aircross',
    'C4 Cactus',
    'C5 Aircross',
    'Berlingo',
    'Jumper',
  ],
  BYD: [
    'Seagull',
    'Yuan Plus',
    'Qin',
    'Song Plus DM',
    'Song Max',
    'F3',
  ],
  GWM: [
    'Haval H6',
    'Poer',
    'Jolion',
  ],
  MG: [
    'MG3',
    'MG5',
    'MG6',
    'ZS',
    'ZS EV',
    'RX5',
  ],
  Chery: [
    'Arrizo 5',
    'Tiggo 5x',
    'Tiggo 8',
    'QQ3',
  ],
  JAC: [
    'T40',
    'S2',
    'S3',
    'S4',
  ],
  Geely: [
    'Vision',
    'Emgrand',
    'Coolray',
  ],
  Effa: [
    'EV3',
    'EV5',
    'EV6',
  ],
  Caoa: [
    'Chery T40',
    'Chery Tiggo 5x',
  ],
  Nissan: [
    'Versa',
    'March',
    'Frontier',
    'Kicks',
    'Qashqai',
    'X-Trail',
  ],
  Ford: [
    'Ka',
    'Fiesta',
    'Focus',
    'Ecosport',
    'Edge',
    'Ranger',
    'Mustang',
  ],
  BMW: [
    'X1',
    'X3',
    'X5',
    'Série 3',
    'Série 5',
    'i4',
  ],
  'Mercedes-Benz': [
    'Classe A',
    'Classe C',
    'Classe E',
    'GLA',
    'GLC',
    'GLE',
    'Sprinter',
  ],
  Audi: [
    'A1',
    'A3',
    'A4',
    'Q2',
    'Q3',
    'Q5',
  ],
  Porsche: [
    '911',
    'Cayenne',
    'Cayman',
    'Panamera',
  ],
  Volvo: [
    'XC40',
    'XC60',
    'XC90',
    'S60',
    'S90',
  ],
  Jaguar: [
    'E-PACE',
    'F-PACE',
    'I-PACE',
  ],
  'Land Rover': [
    'Range Rover',
    'Range Rover Evoque',
    'Range Rover Sport',
    'Discovery',
  ],
  Lamborghini: [
    'Urus',
  ],
  Ferrari: [
    'F8 Tributo',
    'Roma',
    'SF90',
  ],
  Maserati: [
    'Ghibli',
    'Quattroporte',
    'MC20',
  ],
};

export const getAllMarcas = (): string[] => {
  return Object.keys(veiculosPorMarca).sort();
};

export const getModelosByMarca = (marca: string): string[] => {
  return veiculosPorMarca[marca] || [];
};

export const getAllVeiculos = (): Veiculo[] => {
  const veiculos: Veiculo[] = [];
  let id = 1;

  Object.entries(veiculosPorMarca).forEach(([marca, modelos]) => {
    modelos.forEach((modelo) => {
      veiculos.push({
        id: id.toString(),
        marca,
        modelo,
      });
      id++;
    });
  });

  return veiculos;
};
