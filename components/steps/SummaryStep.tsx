'use client'
import { Beneficiary, Pet } from '@/types';
import type { AssistanceWithBeneficiaries } from '@/app/buy/premium/types';
import type { AssistanceWithPets } from '@/app/buy/premium/types';
import { 
  Users, 
  PawPrint, 
  ArrowLeft, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Heart,
  Globe,
  User,
  Calendar,
  CreditCard as CardIcon,
  Lock,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  Wallet,
  Download
} from 'lucide-react';
import { motion } from "framer-motion";
import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { getPriceByQuantity } from '@/app/buy/premium/constants';

interface SummaryStepProps {
  titular: {
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
  };
  beneficiaries: Beneficiary[];
  humanAssistance: AssistanceWithBeneficiaries[];
  petAssistance: AssistanceWithPets[];
  pets: Pet[];
  costos: {
    costoPorPersonas: number;
    costoIndividual: number;
    costoAsistenciasPersonas: number;
    costoPorMascotas: number;
    costoAsistenciasMascotas: number;
    subtotalPersonas: number;
    subtotalMascotas: number;
    total: number;
    costoGlobal: number;
    costoExequial: number;
    beneficiariesWithoutServices: Beneficiary[];
  };
  globalBeneficiaries: Beneficiary[];
  includeGlobalTitular: boolean;
  selectedExequialBeneficiaries: Beneficiary[];
  selectedGlobalBeneficiaries: Beneficiary[];
  onPrev: () => void;
  onProceedToPayment: () => void;
  membershipType: 'basic' | 'premium';
  onNavigateToStep?: (step: number) => void;
}

export default function SummaryStep({
  titular,
  beneficiaries,
  humanAssistance,
  petAssistance,
  pets,
  costos,
  globalBeneficiaries,
  includeGlobalTitular,
  selectedExequialBeneficiaries,
  selectedGlobalBeneficiaries = [],
  onPrev,
  onProceedToPayment,
  membershipType,
}: SummaryStepProps) {
  const [showHumanDetails, setShowHumanDetails] = useState(false);
  const [showPetDetails, setShowPetDetails] = useState(false);
  const [showBeneficiariesDetails, setShowBeneficiariesDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExequialDetails, setShowExequialDetails] = useState(false);
  const [showGlobalDetails, setShowGlobalDetails] = useState(false);
  const [showMembershipDetails, setShowMembershipDetails] = useState(false);

  const BASE_PRICES = {
    basic: {
      person: 12000,
      pet: 12400
    },
    premium: {
      person: 18000,
      pet: 12400
    }
  };

  const basePrice = BASE_PRICES[membershipType];

  const handlePaymentSelection = () => {
    setShowPaymentModal(true);
  };

  const validateCard = {
    number: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (!cleaned) return 'El número de tarjeta es requerido';
      if (cleaned.length !== 16) return 'El número debe tener 16 dígitos';
      // Algoritmo de Luhn
      let sum = 0;
      let isEven = false;
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      if (sum % 10 !== 0) return 'Número de tarjeta inválido';
      return '';
    },
    expiry: (value: string) => {
      if (!value) return 'La fecha de vencimiento es requerida';
      const [month, year] = value.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (!month || !year) return 'Formato inválido (MM/AA)';
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (monthNum < 1 || monthNum > 12) return 'Mes inválido';
      if (yearNum < currentYear) return 'Tarjeta vencida';
      if (yearNum === currentYear && monthNum < currentMonth) return 'Tarjeta vencida';
      return '';
    },
    cvv: (value: string) => {
      if (!value) return 'El código de seguridad es requerido';
      if (!/^\d{3,4}$/.test(value)) return 'CVV inválido';
      return '';
    },
    name: (value: string) => {
      if (!value.trim()) return 'El nombre es requerido';
      if (!/^[a-zA-ZÀ-ÿ\s]{3,}$/.test(value)) return 'Nombre inválido';
      return '';
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardForm(prev => ({ ...prev, [name]: formattedValue }));
    setCardErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar todos los campos
    const newErrors = {
      number: validateCard.number(cardForm.number),
      expiry: validateCard.expiry(cardForm.expiry),
      cvv: validateCard.cvv(cardForm.cvv),
      name: validateCard.name(cardForm.name)
    };

    setCardErrors(newErrors);

    // Verificar si hay errores
    if (Object.values(newErrors).some(error => error)) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Simular proceso de validación con el banco
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Guardar los últimos 4 dígitos para el comprobante
      setPaymentDetails({
        ...paymentDetails,
        cardNumber: cardForm.number.replace(/\s/g, '').slice(-4)
      });

      setIsSubmitting(false);
      setShowCardForm(false);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setIsSubmitting(false);
      // Manejar error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
            <div className="relative z-10 px-6 py-8 md:p-10">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-white">
                    Resumen de Membresía
                  </h1>
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                      {membershipType === 'premium' ? 'Membresía Vida Total' : 'Membresía Vida Esencial'}
                    </span>
                    <span className="text-sm">•</span>
                    <span className="text-sm">
                      {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <div className="space-y-1">
                    <p className="text-xl font-semibold text-white">
                      {titular.firstName} {titular.lastName}
                    </p>
                    <p className="text-blue-100">
                      {titular.documentType}: {titular.documentNumber}
                    </p>
                    <p className="text-blue-100 text-sm">{titular.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="space-y-4">

              {beneficiaries.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Users className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        Beneficiarios ({beneficiaries.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowBeneficiariesDetails(!showBeneficiariesDetails)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showBeneficiariesDetails ? (
                        <>
                          <span>Ocultar detalles</span>
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <span>Ver detalles</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5 rounded-lg space-y-3">
                    {!showBeneficiariesDetails && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Beneficiarios</span>
                        <span className="font-medium text-gray-600">{beneficiaries.length} persona{beneficiaries.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {showBeneficiariesDetails && (
                      <div className="space-y-2">
                        {beneficiaries.map((ben) => (
                          <div key={ben.id} className="flex items-center text-sm text-gray-600 pl-6">
                            <span>• {ben.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Membresía</h3>
                </div>
                <button
                  onClick={() => setShowMembershipDetails(!showMembershipDetails)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  {showMembershipDetails ? (
                    <>
                      <span>Ocultar detalles</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Ver detalles</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-5 rounded-lg space-y-3">
                {!showMembershipDetails ? (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Membresía</span>
                    <span className="font-bold text-purple-700">${costos.costoPorPersonas.toLocaleString()}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-600">
                          Costo membresia
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 pl-6">
                        <span>• Titular: {titular.firstName} {titular.lastName}</span>
                        <span className="text-purple-600">${basePrice.person.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-100">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total Membresía</span>
                        <span className="font-bold text-purple-700">${costos.costoPorPersonas.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {(humanAssistance.length > 0 || humanAssistance.some(a => a.titularOnly)) && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Heart className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Asistencias</h3>
                  </div>
                  <button
                    onClick={() => setShowHumanDetails(!showHumanDetails)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showHumanDetails ? (
                      <>
                        <span>Ocultar detalles</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Ver detalles</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5 rounded-lg space-y-3">
                  {!showHumanDetails && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Asistencias</span>
                      <span className="font-bold text-blue-700">${costos.costoAsistenciasPersonas.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {showHumanDetails && (
                    <div className="space-y-3">
                      {humanAssistance.map((assistance) => (
                        <div key={assistance.id} className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-blue-700">{assistance.name}</h4>
                              {assistance.titularOnly ? (
                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-2">
                                  Solo titular
                                </span>
                              ) : (
                                <div className="mt-2">
                                  {assistance.includeTitular && (
                                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2 mb-2">
                                      Titular
                                    </span>
                                  )}
                                  {assistance.selectedBeneficiaries.map((beneficiary) => (
                                    <span key={beneficiary.id} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2 mb-2">
                                      {beneficiary.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-700">
                                Total: ${(() => {
                                  const { pricePerUnit, isFixed } = getPriceByQuantity(
                                    assistance.price,
                                    assistance.titularOnly ? 1 : assistance.selectedBeneficiaries.length + (assistance.includeTitular ? 1 : 0)
                                  );
                                  const total = isFixed ? pricePerUnit * (assistance.selectedBeneficiaries.length + (assistance.includeTitular ? 1 : 0)) : pricePerUnit;
                                  return total.toLocaleString();
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedExequialBeneficiaries.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Globe className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Servicios Exequiales</h3>
                  </div>
                  <button
                    onClick={() => setShowExequialDetails(!showExequialDetails)}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    {showExequialDetails ? (
                      <>
                        <span>Ocultar detalles</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Ver detalles</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-5 rounded-lg space-y-3">
                  {!showExequialDetails ? (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Servicios Exequiales</span>
                      <span className="font-bold text-purple-700">${costos.costoExequial.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">
                            Servicio exequial ({selectedExequialBeneficiaries.length} {selectedExequialBeneficiaries.length === 1 ? 'persona' : 'personas'})
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-100">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Total Servicios Exequiales</span>
                          <span className="font-bold text-purple-700">${costos.costoExequial.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {(globalBeneficiaries.length > 0 || includeGlobalTitular) && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Globe className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Repatriación Global</h3>
                  </div>
                  <button
                    onClick={() => setShowGlobalDetails(!showGlobalDetails)}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    {showGlobalDetails ? (
                      <>
                        <span>Ocultar detalles</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Ver detalles</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 sm:p-5 rounded-lg space-y-3">
                  {!showGlobalDetails ? (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Repatriación Global</span>
                      <span className="font-bold text-emerald-700">${costos.costoGlobal.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span className="text-gray-600">
                            Repatriación ({globalBeneficiaries.length + (includeGlobalTitular ? 1 : 0)} {globalBeneficiaries.length + (includeGlobalTitular ? 1 : 0) === 1 ? 'persona' : 'personas'})
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-100">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Total Repatriación Global</span>
                          <span className="font-bold text-emerald-700">${costos.costoGlobal.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {pets.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <PawPrint className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Mascotas({pets.length})</h3>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 sm:p-5 rounded-lg space-y-3">

                  <div className="space-y-2">
                    {pets.map((pet, index) => (
                      <div key={pet.id} className="flex items-center gap-2 text-sm text-gray-600 pl-6">
                        <span>• {pet.name} ({pet.species})</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {petAssistance.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Heart className="h-4 sm:h-5 w-4 sm:w-5 text-red-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Asistencias Mascotas</h3>
                  </div>
                  <button
                    onClick={() => setShowPetDetails(!showPetDetails)}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  >
                    {showPetDetails ? (
                      <>
                        <span>Ocultar detalles</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Ver detalles</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-5 rounded-lg space-y-3">
                  {!showPetDetails && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Asistencias Mascotas</span>
                      <span className="font-bold text-red-700">${costos.costoAsistenciasMascotas.toLocaleString()}</span>
                    </div>
                  )}

                  {showPetDetails && (
                    <div className="space-y-3">
                      {petAssistance.map((assistance) => (
                        <div key={assistance.id} className="bg-white p-3 rounded-lg border border-red-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-red-700">{assistance.name}</h4>
                              <div className="mt-2">
                                {assistance.selectedPets.map((pet) => (
                                  <span key={pet.id} className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-2 mb-2">
                                    {pet.name} ({pet.species})
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-700">
                                Total: ${(() => {
                                  const { pricePerUnit, isFixed } = getPriceByQuantity(
                                    assistance.price,
                                    assistance.selectedPets.length
                                  );
                                  const total = isFixed ? pricePerUnit * assistance.selectedPets.length : pricePerUnit;
                                  return total.toLocaleString();
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6">Resumen de Costos</h3>
                <div className="space-y-4">
                  {costos.costoPorPersonas > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Membresía Base</span>
                      </div>
                      <span className="font-medium">${costos.costoPorPersonas.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-800 font-medium">Total Mensual</span>
                        <span className="text-3xl font-bold text-blue-600">
                          ${costos.total.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Incluye todos los servicios y coberturas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Beneficiarios */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-100/50 rounded-lg transform transition-transform group-hover:scale-105 duration-200" />
                    <div className="relative p-2 text-center">
                      <div className="flex justify-center mb-1.5">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-blue-600">
                          {beneficiaries.length}
                        </p>
                        <p className="text-xs font-medium text-gray-600">
                          Beneficiarios
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mascotas */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-orange-100/50 rounded-lg transform transition-transform group-hover:scale-105 duration-200" />
                    <div className="relative p-2 text-center">
                      <div className="flex justify-center mb-1.5">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <PawPrint className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-orange-600">
                          {pets.length}
                        </p>
                        <p className="text-xs font-medium text-gray-600">
                          Mascotas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Asistencias */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-red-100/50 rounded-lg transform transition-transform group-hover:scale-105 duration-200" />
                    <div className="relative p-2 text-center">
                      <div className="flex justify-center mb-1.5">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                          <Heart className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-red-600">
                          {humanAssistance.length + petAssistance.length}
                        </p>
                        <p className="text-xs font-medium text-gray-600">
                          Asistencias
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50">
        <div className="px-6 py-4 md:px-10 md:py-6 flex flex-col sm:flex-row gap-3 justify-end">
          <motion.button
            onClick={onPrev}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Modificar Plan</span>
          </motion.button>
          <motion.button
            onClick={handlePaymentSelection}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm font-medium"
          >
            <CreditCard className="h-4 w-4" />
            <span>Proceder al Pago</span>
          </motion.button>
        </div>
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setShowCardForm(false);
        }}
        size="lg"
      >
        <ModalContent>
          {!showCardForm ? (
            <>
              <ModalHeader className="border-b border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Elige tu método de pago</h3>
                    <p className="text-sm text-gray-500 mt-1">Selecciona la opción que prefieras para realizar tus pagos</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCardForm(true)}
                    className="w-full p-6 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <CardIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">Débito Automático</p>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Recomendado</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Registra tu tarjeta para pagos mensuales automáticos</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Pago automático</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Shield className="h-4 w-4" />
                            <span>Pagos seguros</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onProceedToPayment}
                    className="w-full p-6 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <Globe className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Pago Manual</p>
                        <p className="text-sm text-gray-600 mt-1">Realiza tus pagos mensualmente a través de nuestro link de pago</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <DollarSign className="h-4 w-4" />
                            <span>Pago flexible</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Pago mensual</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </ModalBody>
            </>
          ) : (
            <>
              <ModalHeader className="border-b border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <CardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Configura el débito automático</h3>
                    <p className="text-sm text-gray-500 mt-1">Ingresa los datos de tu tarjeta para pagos automáticos</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <form onSubmit={handleSubmitCard} className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-700">Tus datos están protegidos con encriptación de grado bancario</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Tarjeta
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="number"
                          value={cardForm.number}
                          onChange={handleCardChange}
                          className={`w-full pl-11 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            cardErrors.number ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        <CardIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      {cardErrors.number && (
                        <p className="mt-1 text-xs text-red-600">{cardErrors.number}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Vencimiento
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="expiry"
                            value={cardForm.expiry}
                            onChange={handleCardChange}
                            className={`w-full pl-11 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              cardErrors.expiry ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        {cardErrors.expiry && (
                          <p className="mt-1 text-xs text-red-600">{cardErrors.expiry}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código de Seguridad
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cvv"
                            value={cardForm.cvv}
                            onChange={handleCardChange}
                            className={`w-full pl-11 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              cardErrors.cvv ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="123"
                            maxLength={4}
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        {cardErrors.cvv && (
                          <p className="mt-1 text-xs text-red-600">{cardErrors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre en la Tarjeta
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={cardForm.name}
                          onChange={handleCardChange}
                          className={`w-full pl-11 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            cardErrors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Como aparece en la tarjeta"
                          maxLength={50}
                        />
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      {cardErrors.name && (
                        <p className="mt-1 text-xs text-red-600">{cardErrors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCardForm(false)}
                      className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      disabled={isSubmitting}
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Confirmar Tarjeta</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">¡Pago Configurado Exitosamente!</h3>
                <p className="text-sm text-gray-500 mt-1">Tu membresía está lista para iniciar</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Comprobante de Suscripción</h4>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    Activo
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Titular</span>
                    <span className="font-medium">{titular.firstName} {titular.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{membershipType === 'premium' ? 'Membresía Vida Total' : 'Membresía Vida Esencial'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Método de Pago</span>
                    <span className="font-medium">Débito Automático</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tarjeta</span>
                    <span className="font-medium">•••• {paymentDetails.cardNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto Mensual</span>
                    <span className="font-medium">${costos.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">Próximo Cobro</p>
                      <p className="text-xs text-gray-500">
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Entendido</span>
                </button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </motion.div>
  );
} 