'use client';
import { useState, useEffect } from 'react';
import BeneficiariesStep from '@/components/steps/BeneficiariesStep';
import HumanAssistanceStep from '@/components/steps/HumanAssistanceStep';
import PetAssistanceStep from '@/components/steps/PetAssistanceStep';
import SummaryStep from '@/components/steps/SummaryStep';
import { AlertCircle } from 'lucide-react';
import { 
  Titular, 
  Beneficiary, 
  AssistanceWithBeneficiaries, 
  AssistanceWithPets, 
  Pet,
} from './types';
import { toast } from 'react-toastify';
import TitularStep from '@/components/steps/TitularStep';
import { StepsNavigation } from '@/components/StepsNavigation';
import { 
  AVAILABLE_HUMAN_ASSISTANCE, 
  AVAILABLE_PET_ASSISTANCE, 
  PREMIUM_PRICING_TABLE,
  clearStorage,
  getPriceByQuantity 
} from './constants';

export default function BuyBasicPage() {
  // Inicializar estados sin condiciones
  const [currentStep, setCurrentStep] = useState(1);
  const [titular, setTitular] = useState<Titular>({
    documentType: '',
    documentNumber: '',
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: '',
    socialStratum: '',
    educationLevel: ''
  });
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedHumanAssistance, setSelectedHumanAssistance] = useState<AssistanceWithBeneficiaries[]>([]);
  const [selectedPetAssistance, setSelectedPetAssistance] = useState<AssistanceWithPets[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedGlobalBeneficiaries, setSelectedGlobalBeneficiaries] = useState<Beneficiary[]>([]);
  const [includeGlobalTitular, setIncludeGlobalTitular] = useState(false);

  const calculateTotal = () => {
    // Get total number of people (beneficiaries + titular)
    const totalPeople = beneficiaries.length + 1;
    
    // Usar precio base fijo para la membresía en lugar de multiplicar por persona
    const costoPorPersonas = PREMIUM_PRICING_TABLE[1];
    
    // Calcular costo individual (para mostrar en el desglose)
    const costoIndividual = costoPorPersonas / totalPeople;

    // Filtrar asistencias que aún tienen beneficiarios
    const validHumanAssistance = selectedHumanAssistance.filter(assistance => 
      assistance.selectedBeneficiaries.length > 0 || assistance.includeTitular || assistance.includeTitular
    );

    // Filtrar asistencias que aún tienen mascotas
    const validPetAssistance = selectedPetAssistance.filter(assistance => 
      assistance.selectedPets.length > 0
    );

    // Costo de asistencias usando solo las asistencias válidas
    const costoAsistenciasPersonas = validHumanAssistance.reduce((acc, curr) => {
      const totalCount = curr.selectedBeneficiaries.length + (curr.includeTitular ? 1 : 0);
      const { pricePerUnit, isFixed } = getPriceByQuantity(curr.price, totalCount);
      
      // Si es precio fijo, multiplicar por cantidad
      if (isFixed) {
        return acc + (pricePerUnit * totalCount);
      }
      
      // Si no es fijo, usar el precio directamente
      return acc + pricePerUnit;
    }, 0);

    const costoAsistenciasMascotas = validPetAssistance.reduce((acc, curr) => {
      const petsCount = curr.selectedPets.length;
      const { pricePerUnit, isFixed } = getPriceByQuantity(curr.price, petsCount);
      
      // Si es precio fijo, cada mascota paga el precio
      if (isFixed) {
        return acc + (pricePerUnit * petsCount);
      }
      
      // Si no es fijo, el precio es el total para esa cantidad de mascotas
      return acc + pricePerUnit;
    }, 0);

    // Calcular costos de servicios globales
    const totalGlobal = selectedGlobalBeneficiaries.length + (includeGlobalTitular ? 1 : 0);
    const costoGlobal = totalGlobal;

    const subtotalPersonas = costoPorPersonas + costoAsistenciasPersonas;
    const subtotalMascotas = costoAsistenciasMascotas;
    
    return {
      costoPorPersonas,
      costoIndividual,
      costoAsistenciasPersonas,
      costoPorMascotas: 0,
      costoAsistenciasMascotas,
      costoGlobal,
      subtotalPersonas,
      subtotalMascotas,
      total: subtotalPersonas + subtotalMascotas + costoGlobal,
      beneficiariesWithoutServices: [],
      costoExequial: 0
    };
  };

  // Cargar datos del sessionStorage en el primer render
  useEffect(() => {
    const savedStep = sessionStorage.getItem('currentStep');
    const savedTitular = sessionStorage.getItem('titular');
    const savedBeneficiaries = sessionStorage.getItem('beneficiaries');
    const savedHumanAssistance = sessionStorage.getItem('humanAssistance');
    const savedPetAssistance = sessionStorage.getItem('petAssistance');
    const savedPets = sessionStorage.getItem('pets');
    const savedGlobalBeneficiaries = sessionStorage.getItem('globalBeneficiaries');
    const savedGlobalTitular = sessionStorage.getItem('includeGlobalTitular');

    if (savedStep) setCurrentStep(Number(savedStep));
    if (savedTitular) setTitular(JSON.parse(savedTitular));
    if (savedBeneficiaries) setBeneficiaries(JSON.parse(savedBeneficiaries));
    if (savedHumanAssistance) setSelectedHumanAssistance(JSON.parse(savedHumanAssistance));
    if (savedPetAssistance) setSelectedPetAssistance(JSON.parse(savedPetAssistance));
    if (savedPets) setPets(JSON.parse(savedPets));
    if (savedGlobalBeneficiaries) setSelectedGlobalBeneficiaries(JSON.parse(savedGlobalBeneficiaries));
    if (savedGlobalTitular) setIncludeGlobalTitular(savedGlobalTitular === 'true');
  }, []);

  // Función para navegar entre pasos
  const navigateStep = (step: number | 'next' | 'prev') => {
    if (step === 'next') {
      // Validación para el titular
      if (currentStep === 1) {
        if (!titular.documentNumber || !titular.firstName || !titular.lastName || !titular.email || !titular.phone) {
          toast.error('Por favor completa los campos obligatorios del titular', {
            position: "top-center",
            icon: <AlertCircle className="h-5 w-5" />
          });
          return;
        }
      }

      // Validación para asistencias humanas
      if (currentStep === 3 && selectedHumanAssistance.length > 0 && beneficiaries.length === 0) {
        toast.error('Debes registrar al menos un beneficiario para agregar asistencias', {
          position: "top-center",
          icon: <AlertCircle className="h-5 w-5" />
        });
        return;
      }

      // Validación para asistencias de mascotas
      if (currentStep === 5 && selectedPetAssistance.length > 0 && pets.length === 0) {
        toast.error('Debes registrar al menos una mascota para agregar asistencias', {
          position: "top-center",
          icon: <AlertCircle className="h-5 w-5" />
        });
        return;
      }

      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      }
    } else if (step === 'prev') {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    } else {
      // Validar antes de navegar directamente
      const canNavigate = validateCurrentStep();
      if (canNavigate) {
        setCurrentStep(step);
      }
    }
  };

  // Agregar la función handlePayment
  const handlePayment = () => {
    clearStorage();
    window.location.href = 'https://checkout.wompi.co/l/VPOS_FmlV90';
  };

  // Agregar la función skipToSummary
  const skipToSummary = () => {
    setCurrentStep(7);  // En premium es 7 en lugar de 7
  };

  // Agregar función de validación
  const validateCurrentStep = () => {
    // Validar según el paso actual
    switch (currentStep) {
      case 1:
        if (!titular.documentNumber || !titular.firstName || !titular.lastName || !titular.email || !titular.phone) {
          toast.error('Por favor completa los campos obligatorios del titular');
          return false;
        }
        break;

      case 3:
        if (selectedHumanAssistance.length > 0 && beneficiaries.length === 0) {
          toast.error('Debes registrar al menos un beneficiario para agregar asistencias');
          return false;
        }
        break;

      case 5:
        if (selectedPetAssistance.length > 0 && pets.length === 0) {
          toast.error('Debes registrar al menos una mascota para agregar asistencias');
          return false;
        }
        break;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        {/* Agregar la navegación */}
        <StepsNavigation 
          currentStep={currentStep} 
          onNavigateToStep={navigateStep} 
        />

        {/* Resto del contenido */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <TitularStep 
              titular={titular}
              setTitular={setTitular}
              onNext={() => navigateStep('next')}
              onSkipToSummary={skipToSummary}
              costos={calculateTotal()}
            />
          )}

          {currentStep === 2 && (
            <BeneficiariesStep 
              beneficiaries={beneficiaries}
              setBeneficiaries={setBeneficiaries}
              selectedHumanAssistance={selectedHumanAssistance}
              setSelectedHumanAssistance={setSelectedHumanAssistance}
              selectedPetAssistance={selectedPetAssistance}
              setSelectedPetAssistance={setSelectedPetAssistance}
              selectedGlobalBeneficiaries={selectedGlobalBeneficiaries}
              setSelectedGlobalBeneficiaries={setSelectedGlobalBeneficiaries}
              onNext={() => navigateStep('next')}
              onPrev={() => navigateStep('prev')}
              onSkipToSummary={skipToSummary}
              costos={calculateTotal()}
              pets={pets}
              setPets={setPets}
            />
          )}

          {currentStep === 3 && (
            <HumanAssistanceStep
              beneficiaries={beneficiaries}
              selectedAssistance={selectedHumanAssistance}
              setSelectedAssistance={setSelectedHumanAssistance}
              availableAssistance={AVAILABLE_HUMAN_ASSISTANCE}
              onNext={() => navigateStep('next')}
              onPrev={() => navigateStep('prev')}
              onSkipToSummary={skipToSummary}
              titular={titular}
              costos={calculateTotal()}
            />
          )}

          {currentStep === 4 && (
            <PetAssistanceStep
              selectedAssistance={selectedPetAssistance}
              setSelectedAssistance={setSelectedPetAssistance}
              availableAssistance={AVAILABLE_PET_ASSISTANCE}
              onNext={() => navigateStep('next')}
              onPrev={() => navigateStep('prev')}
              onSkipToSummary={skipToSummary}
              pets={pets}
              costos={calculateTotal()}
            />
          )}

          {currentStep === 5 && (
            <SummaryStep
              titular={titular}
              beneficiaries={beneficiaries}
              humanAssistance={selectedHumanAssistance}
              petAssistance={selectedPetAssistance}
              pets={pets}
              globalBeneficiaries={selectedGlobalBeneficiaries}
              selectedGlobalBeneficiaries={selectedGlobalBeneficiaries}
              includeGlobalTitular={includeGlobalTitular}
              costos={calculateTotal()}
              selectedExequialBeneficiaries={[]}
              onPrev={() => navigateStep('prev')}
              onProceedToPayment={handlePayment}
              membershipType="basic"
            />
          )}
        </div>
      </div>
    </div>
  );
}
