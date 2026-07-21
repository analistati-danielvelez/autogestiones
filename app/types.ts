interface Benefit {
    id: number;
    name: string;
    description: string;
    basic: {
      value: string;
      subtext?: string;
      details: string;
    };
    premium: {
      value: string;
      subtext?: string;
      details: string;
    };
  }

  export type { Benefit };

export interface Pet {
  id: string;
  name: string;
  species: 'PERRO' | 'GATO';
  color: string;
  age: number;
}

interface PriceStructure {
  [key: number]: number;
  base?: number;
  fixed?: number;
}

export interface Assistance {
  id: string;
  category: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  price: PriceStructure;
}