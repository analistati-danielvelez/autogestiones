import { Assistance } from '@/types';
import { Beneficiary, PriceStructure } from './types';

export const RELATIONSHIPS = [
  { value: 'SPOUSE', label: 'Cónyuge/Compañero(a)' },
  { value: 'CHILD', label: 'Hijo(a)' },
  { value: 'PARENT', label: 'Padre/Madre' },
  { value: 'SIBLING', label: 'Hermano(a)' },
  { value: 'GRANDPARENT', label: 'Abuelo(a)' },
] as const;

interface AgeRange {
  minAge: number;
  maxAge: number;
}

interface ParentescoRestriction {
  parentesco: string;
  ageRange: AgeRange;
}

interface AssistanceRestrictions {
  allowedRelationships?: string[];
  ageRestrictions?: ParentescoRestriction[];
  includeTitular: boolean;
}

export interface AssistanceWithRestrictions extends Assistance {
  restrictions?: AssistanceRestrictions;
}

const AVAILABLE_HUMAN_ASSISTANCE: AssistanceWithRestrictions[] = [
  {
    id: '1',
    category: 'HEALTH',
    name: 'Asistencia Médica Premium',
    description: 'Accede a servicios médicos integrales con cobertura completa para ti y tu familia.',
    image: '/medical.jpeg',
    features: [
      'Cobertura Amplia: Accede a servicios médicos, odontológicos y especializados sin largas esperas.',
      'Atención Oportuna: Respaldo en emergencias médicas y consultas prioritarias.',
      'Prevención y Bienestar: Exámenes médicos preventivos y programas de salud para toda la familia.',
      'Red de Especialistas: Convenios con médicos, clínicas y centros de salud de calidad.',
      'Facilidad de Acceso: Asesoría personalizada y trámites simplificados.',
      'Seguridad y Tranquilidad: Protección en salud para ti y tus seres queridos.'
    ],
    price: {
      fixed: 25000
    },
    restrictions: {
      allowedRelationships: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT'],
      includeTitular: true,
      ageRestrictions: [
        { parentesco: 'SPOUSE', ageRange: { minAge: 18, maxAge: 100 } },
        { parentesco: 'CHILD', ageRange: { minAge: 0, maxAge: 100 } },
        { parentesco: 'PARENT', ageRange: { minAge: 18, maxAge: 100 } },
        { parentesco: 'SIBLING', ageRange: { minAge: 0, maxAge: 100 } },
        { parentesco: 'GRANDPARENT', ageRange: { minAge: 18, maxAge: 100 } }
      ]
    }
  },
  {
    id: '2',
    category: 'HOME',
    name: 'Asistencia Hogar',
    description: 'Protección integral para tu hogar con servicios de emergencia y mantenimiento.',
    image: '/home.jpg',
    features: [
      'Servicios de Emergencia 24/7',
      'Reparaciones Eléctricas',
      'Plomería y Fontanería',
      'Cerrajería de Emergencia',
      'Asistencia en Vidriería'
    ],
    price: {
      fixed: 30000
    },
    restrictions: {
      allowedRelationships: [],
      includeTitular: true
    }
  },
  {
    id: '3',
    category: 'EXEQUIAL',
    name: 'Asistencia Exequial Mi familia extendida',
    description: 'Servicio funerario completo de asistencia exequial para tu grupo familiar más amplio. Te protege: Titular + Beneficiarios (padres, hijos, conyugue, hermanos, primos, abuelos, etc)+ Beneficiarios sin parentesco hasta 2. Hasta 9 beneficiarios.Cubrimiento nacional',
    image: '/exequialfamilyextended.jpg',
    features: [
      'Servicio funerario completo',
      'Trámites legales',
      'Traslados',
      'Sala de velación',
      'Servicios de cremación o inhumación'
    ],
    price: {
      1: 14600,
      2: 20000,
      3: 24800,
      4: 31300,
      5: 34200,
      6: 38300,
      7: 43700,
      8: 48200,
      9: 51500,
      base: 14600
    },
    restrictions: {
      allowedRelationships: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT'],
      includeTitular: false,
      ageRestrictions: [
        { parentesco: 'SPOUSE', ageRange: { minAge: 18, maxAge: 65 } },
        { parentesco: 'CHILD', ageRange: { minAge: 0, maxAge: 65 } },
        { parentesco: 'PARENT', ageRange: { minAge: 18, maxAge: 75 } },
        { parentesco: 'SIBLING', ageRange: { minAge: 0, maxAge: 65 } },
        { parentesco: 'GRANDPARENT', ageRange: { minAge: 18, maxAge: 65 } }
      ]
    }
  },
  {
    id: '4',
    category: 'EXEQUIAL',
    name: 'Asistencia Exequial Mi familia primaria',
    description: 'Servicio funerario completo de asistencia exequial para tu grupo familiar primario. Te protege: Titular + conyuge + hijos de 1 hasta 30 años. Cubrimiento nacional',
    image: '/exequialfamilyprimary.jpg',
    features: [
      'Servicio funerario completo',
      'Trámites legales',
      'Traslados',
      'Sala de velación',
      'Servicios de cremación o inhumación'
    ],
    price: {
      1: 12000,
      2: 12000,
      3: 12000,
      4: 12000,
      5: 12000,
      base: 12000
    },
    restrictions: {
      allowedRelationships: ['SPOUSE', 'CHILD'],
      includeTitular: false,
      ageRestrictions: [
        { parentesco: 'SPOUSE', ageRange: { minAge: 18, maxAge: 60 } },
        { parentesco: 'CHILD', ageRange: { minAge: 1, maxAge: 30 } }
      ]
    }
  },
  {
    id: '5',
    category: 'EXEQUIAL',
    name: 'Asistencia Exequial Mis Adultos Mayores',
    description: 'Servicio funerario completo de asistencia exequial para tus familiares o amigos más mayores. Te protege: Titular + Beneficiarios hasta 5 personas (sin parentesco). Cubrimiento por porcentajes de acuerdo al tiempo de permanencia. Cubrimiento nacional',
    image: '/exequialadult.jpg',
    features: [
      'Servicio funerario completo',
      'Trámites legales',
      'Traslados',
      'Sala de velación',
      'Servicios de cremación o inhumación'
    ],
    price: {
      1: 68500,
      2: 68500,
      3: 68500,
      4: 68500,
      5: 68500,
      6: 137000,
      7: 137000,
      8: 137000,
      9: 137000,
      10: 205500,
      11: 205500,
      12: 205500,
      13: 205500,
      14: 205500,
      15: 205500,
      base: 68500
    },
    restrictions: {
      allowedRelationships: ['SPOUSE', 'PARENT', 'SIBLING', 'GRANDPARENT'],
      includeTitular: false,
      ageRestrictions: [
        { parentesco: 'SPOUSE', ageRange: { minAge: 65, maxAge: 100 } },
        { parentesco: 'PARENT', ageRange: { minAge: 65, maxAge: 100 } },
        { parentesco: 'SIBLING', ageRange: { minAge: 65, maxAge: 100 } },
        { parentesco: 'GRANDPARENT', ageRange: { minAge: 65, maxAge: 100 } }
      ]
    }
  },
  {
    id: '6',
    category: 'EXEQUIAL',
    name: 'Asistencia Exequial Mis familiares en el exterior',
    description: 'Servicio funerario completo de asistencia exequial para tus familiares y amigos que vivan en el exterior. Te protege: Titular + Sin limete de benefiaciarios (sin parentesco). Cubrimiento de acuerdo a los tiempos de carencia. Cubrimiento internacional y nacional.',
    image: '/exequialabroad.jpg',
    features: [
      'Servicio funerario completo',
      'Trámites legales',
      'Traslados',
      'Sala de velación',
      'Servicios de cremación o inhumación'
    ],
    price: {
      fixed: 29900
    },
    restrictions: {
      allowedRelationships: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT'],
      includeTitular: true,
      ageRestrictions: [
        { parentesco: 'SPOUSE', ageRange: { minAge: 0, maxAge: 100 } },
        { parentesco: 'CHILD', ageRange: { minAge: 0, maxAge: 100 } },
        { parentesco: 'PARENT', ageRange: { minAge: 0, maxAge: 100 } },
        { parentesco: 'SIBLING', ageRange: { minAge: 0, maxAge: 100 } },
        { parentesco: 'GRANDPARENT', ageRange: { minAge: 0, maxAge: 100 } }
      ]
    }
  }
];

const AVAILABLE_PET_ASSISTANCE: Assistance[] = [
  {
    id: "pet1",
    category: 'PET_HEALTH',
    name: "Asistencia Básica Mascotas",
    image: "/pet-basic.jpg",
    description: "Cobertura esencial para el cuidado y bienestar de tus mascotas.",
    features: [
      'Consultas veterinarias',
      'Vacunación básica',
      'Desparasitación',
      'Urgencias 24/7',
      'Descuentos en medicamentos'
    ],
    price: {
      fixed: 25000
    }
  },
  {
    id: 'pet2',
    category: 'PET_HEALTH',
    name: 'Asistencia Premium Mascotas',
    image: '/pet-premium.webp',
    description: 'La protección más completa para tus compañeros peludos.',
    features: [
      'Todo lo del plan básico',
      'Cirugías menores',
      'Limpieza dental',
      'Peluquería',
      'Microchip de identificación'
    ],
    price: {
      fixed: 35000
    }
  },
  {
    id: 'pet3',
    category: 'PET_EXEQUIAL',
    name: 'Asistencia Exequial Mascotas',
    image: '/petexequial.jpg',
    description: 'Servicio funerario completo de asistencia exequial para tus mascotas.',
    features: [
      'Servicio funerario completo',
      'Trámites legales',
      'Traslados',
      'Sala de velación',
      'Servicios de cremación o inhumación'
    ],
    price: {
      1: 12400,
      2: 24800,
      3: 24800,
      4: 37200,
      5: 49600,
      6: 49600,
      base: 29900
    }
  }
];

// Helper function para obtener el precio según la cantidad
const getPriceByQuantity = (priceStructure: PriceStructure, quantity: number): {
  pricePerUnit: number;
  isFixed: boolean;
} => {
  // Si tiene precio fijo por unidad (como las asistencias de mascotas)
  if (priceStructure.fixed) {
    return {
      pricePerUnit: priceStructure.fixed,
      isFixed: true // Multiplicar por cantidad
    };
  }
  
  // Para precios por cantidad total (incluye casos donde el precio es igual)
  if (quantity in priceStructure) {
    return {
      pricePerUnit: priceStructure[quantity],
      isFixed: false // Usar el precio tal cual, sin multiplicar
    };
  }
  
  // Si no hay precio para esa cantidad, usar el base
  return {
    pricePerUnit: priceStructure.base || 0,
    isFixed: false
  };
};

const PREMIUM_PRICING_TABLE = {
  1: 12000,
};

const clearStorage = () => {
  sessionStorage.removeItem('currentStep');
  sessionStorage.removeItem('titular');
  sessionStorage.removeItem('beneficiaries');
  sessionStorage.removeItem('humanAssistance');
  sessionStorage.removeItem('petAssistance');
  sessionStorage.removeItem('pets');
  sessionStorage.removeItem('globalBeneficiaries');
  sessionStorage.removeItem('includeGlobalTitular');
}; 

// Volver a la validación original
export const validateBeneficiaryForAssistance = (
  beneficiary: Beneficiary, 
  assistance: AssistanceWithRestrictions
): { isValid: boolean; message?: string } => {
  if (!assistance.restrictions) {
    return { isValid: true };
  }

  const { allowedRelationships, ageRestrictions } = assistance.restrictions;

  // Validar parentesco permitido
  if (allowedRelationships && !allowedRelationships.includes(beneficiary.relationship)) {
    const allowedLabels = allowedRelationships
      .map(r => RELATIONSHIPS.find(rel => rel.value === r)?.label)
      .filter(Boolean)
      .join(', ');
    
    return {
      isValid: false,
      message: `Esta asistencia solo está disponible para: ${allowedLabels}`
    };
  }

  // Validar restricciones de edad según parentesco
  if (ageRestrictions) {
    const restriction = ageRestrictions.find(r => r.parentesco === beneficiary.relationship);
    if (restriction) {
      const { minAge, maxAge } = restriction.ageRange;
      const relationshipLabel = RELATIONSHIPS.find(r => r.value === beneficiary.relationship)?.label;

      if (beneficiary.age < minAge) {
        return {
          isValid: false,
          message: `La edad mínima para ${relationshipLabel} es ${minAge} años`
        };
      }

      if (beneficiary.age > maxAge) {
        return {
          isValid: false,
          message: `La edad máxima para ${relationshipLabel} es ${maxAge} años`
        };
      }
    }
  }

  return { isValid: true };
};

// Agregar esta interfaz y configuración
interface CategoryRestrictions {
  allowMultipleAssistances: boolean;
  name: string;
}

const CATEGORY_RESTRICTIONS: Record<string, CategoryRestrictions> = {
  HEALTH: {
    allowMultipleAssistances: true,
    name: 'Salud'
  },
  HOME: {
    allowMultipleAssistances: true,
    name: 'Hogar'
  },
  EXEQUIAL: {
    allowMultipleAssistances: false,
    name: 'Exequial'
  },
  EDUCATION: {
    allowMultipleAssistances: true,
    name: 'Educación'
  },
  LEGAL: {
    allowMultipleAssistances: true,
    name: 'Legal'
  }
} as const;

const PET_CATEGORY_RESTRICTIONS: Record<string, CategoryRestrictions> = {
  PET_HEALTH: {
    allowMultipleAssistances: false,
    name: 'Salud Mascotas'
  },
  PET_GROOMING: {
    allowMultipleAssistances: true,
    name: 'Peluquería'
  },
  PET_EMERGENCY: {
    allowMultipleAssistances: true,
    name: 'Emergencias'
  },
  PET_EXEQUIAL: {
    allowMultipleAssistances: true,
    name: 'Exequial'
  }
} as const;

export { 
  AVAILABLE_HUMAN_ASSISTANCE, 
  AVAILABLE_PET_ASSISTANCE, 
  PREMIUM_PRICING_TABLE, 
  clearStorage,
  getPriceByQuantity,
  CATEGORY_RESTRICTIONS,
  PET_CATEGORY_RESTRICTIONS
};