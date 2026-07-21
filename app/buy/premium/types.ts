interface Titular {
  documentType: string;
  documentNumber: string;
  firstName: string;
  secondName: string;
  lastName: string;
  secondLastName: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  socialStratum: string;
  educationLevel: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  documentType: string;
  documentNumber: string;
  age: number;
  relationship: string;
  isTitular?: boolean;
}

interface TitularWithId extends Titular {
  id: string;
  name: string;
}

interface Assistance {
  id: string;
  category: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  price: PriceStructure;
}

interface PriceStructure {
  [key: number]: number;
  base?: number;
  fixed?: number;
}

interface AssistanceWithBeneficiaries extends Assistance {
  selectedBeneficiaries: Beneficiary[];
  includeTitular: boolean;
  titularData?: TitularWithId;
  titularOnly?: boolean;
}

interface AssistanceWithPets extends Assistance {
  selectedPets: Pet[];
}

interface Pet {
  id: string;
  name: string;
  species: "PERRO" | "GATO";
  color: string;
  age: number;
} 

export type { Titular, TitularWithId, Assistance, AssistanceWithBeneficiaries, AssistanceWithPets, Pet, PriceStructure };