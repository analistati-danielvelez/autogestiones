import { PriceStructure } from "@/app/buy/premium/types";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Beneficiary {
  id: string;
  name: string;
  documentType: string;
  documentNumber: string;
  age: number;
  relationship: string;
}

export interface Assistance {
  id: string;
  name: string;
  image: string;
  description: string;
  features: string[];
  titularOnly?: boolean;
  category: string;
  price: PriceStructure;
}

export interface AssistanceWithBeneficiaries extends Assistance {
  selectedBeneficiaries: Beneficiary[];
  includeTitular: boolean;
  titularOnly?: boolean;
}

export interface Pet {
  id: string;
  name: string;
  species: 'PERRO' | 'GATO';
  color: string;
  age: number;
}
