import { Assistance } from '@/types';
import type { Beneficiary, Titular } from '@/app/buy/premium/types';
import { 
  Heart, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Shield,
  Plus,
  Minus,
  Check,
  X,
  Receipt,
  Home,
  Flower2,
  Scale,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { motion } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { useState } from "react";
import Image from 'next/image';
import { Switch } from '@heroui/switch';
import TotalPrice from '@/components/TotalPrice';
import { getPriceByQuantity } from '@/app/buy/premium/constants';
import { PriceStructure } from '@/app/buy/premium/types';
import { validateBeneficiaryForAssistance, RELATIONSHIPS, CATEGORY_RESTRICTIONS, AssistanceWithRestrictions } from '@/app/buy/premium/constants';
import { toast } from 'react-toastify';

interface ExtendedAssistance extends Assistance {
  titularOnly?: boolean;
}

interface HumanAssistanceStepProps {
  beneficiaries: Beneficiary[];
  selectedAssistance: AssistanceWithBeneficiaries[];
  setSelectedAssistance: React.Dispatch<React.SetStateAction<AssistanceWithBeneficiaries[]>>;
  availableAssistance: ExtendedAssistance[];
  onNext: () => void;
  onPrev: () => void;
  titular: Titular;
  onSkipToSummary: () => void;
  costos: {
    total: number;
  };
}

interface AssistanceWithBeneficiaries extends Assistance {
  selectedBeneficiaries: Beneficiary[];
  includeTitular: boolean;
  titularOnly?: boolean;
}

interface TitularData {
  id: string;
  name: string;
  age: number;
}

export default function HumanAssistanceStep({
  beneficiaries,
  selectedAssistance,
  setSelectedAssistance,
  availableAssistance,
  onNext,
  onPrev,
  titular,
  onSkipToSummary,
  costos,
}: HumanAssistanceStepProps) {
  const [selectedDetails, setSelectedDetails] = useState<Assistance | null>(null);
  const [showBeneficiariesModal, setShowBeneficiariesModal] = useState(false);
  const [currentAssistance, setCurrentAssistance] = useState<AssistanceWithRestrictions | null>(null);
  const [tempSelectedBeneficiaries, setTempSelectedBeneficiaries] = useState<Beneficiary[]>([]);
  const [tempIncludeTitular, setTempIncludeTitular] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBeneficiaryChange, setPendingBeneficiaryChange] = useState<{
    beneficiary: Beneficiary;
    fromAssistance: string;
    toAssistance: string;
  } | null>(null);

  const handleOpenModal = (assistance: AssistanceWithRestrictions) => {
    if (assistance.titularOnly) {
      const existing = selectedAssistance.find(a => a.id === assistance.id);
      if (existing) {
        setSelectedAssistance(prev => prev.filter(a => a.id !== assistance.id));
      } else {
        setSelectedAssistance(prev => [...prev, {
          ...assistance,
          selectedBeneficiaries: [],
          includeTitular: true
        } as AssistanceWithBeneficiaries]);
      }
      return;
    }

    setCurrentAssistance(assistance);
    const existingAssistance = selectedAssistance.find(a => a.id === assistance.id);
    if (existingAssistance) {
      setTempSelectedBeneficiaries(existingAssistance.selectedBeneficiaries);
      setTempIncludeTitular(existingAssistance.includeTitular);
    } else {
      setTempSelectedBeneficiaries([]);
      setTempIncludeTitular(false);
    }
    setShowBeneficiariesModal(true);
  };

  const getBeneficiaryCurrentAssistance = (
    beneficiary: Beneficiary,
    selectedAssistance: AssistanceWithBeneficiaries[],
    currentAssistanceId: string
  ): { assistanceName: string; category: string } | null => {
    if (!currentAssistance) return null;

    if (CATEGORY_RESTRICTIONS[currentAssistance.category]?.allowMultipleAssistances) {
      return null;
    }

    const otherAssistance = selectedAssistance.find(assistance => 
      assistance.id !== currentAssistanceId &&
      assistance.category === currentAssistance.category &&
      (assistance.selectedBeneficiaries.some(b => b.id === beneficiary.id) ||
      (assistance.includeTitular && beneficiary.isTitular))
    );

    if (otherAssistance) {
      return {
        assistanceName: otherAssistance.name,
        category: otherAssistance.category
      };
    }

    return null;
  };

  const toggleBeneficiary = (beneficiary: Beneficiary) => {
    if (!currentAssistance) return;

    const validation = validateBeneficiaryForAssistance(beneficiary, currentAssistance);
    if (!validation.isValid) {
      toast.error(validation.message, {
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    const existingAssistance = getBeneficiaryCurrentAssistance(
      beneficiary,
      selectedAssistance,
      currentAssistance.id
    );

    if (!existingAssistance || 
        CATEGORY_RESTRICTIONS[currentAssistance.category]?.allowMultipleAssistances) {
      setTempSelectedBeneficiaries(prev => {
        const isSelected = prev.some(b => b.id === beneficiary.id);
        if (isSelected) {
          return prev.filter(b => b.id !== beneficiary.id);
        } else {
          return [...prev, beneficiary];
        }
      });
      return;
    }

    setPendingBeneficiaryChange({
      beneficiary,
      fromAssistance: existingAssistance.assistanceName,
      toAssistance: currentAssistance.name
    });
    setShowConfirmModal(true);
  };

  const handleConfirmBeneficiaryChange = () => {
    if (!pendingBeneficiaryChange || !currentAssistance) return;

    setSelectedAssistance(prev => prev.map(assistance => {
      if (assistance.category === currentAssistance.category && 
          assistance.id !== currentAssistance.id) {
        return {
          ...assistance,
          selectedBeneficiaries: assistance.selectedBeneficiaries.filter(
            b => b.id !== pendingBeneficiaryChange.beneficiary.id
          )
        };
      }
      return assistance;
    }));

    setTempSelectedBeneficiaries(prev => [...prev, pendingBeneficiaryChange.beneficiary]);
    setShowConfirmModal(false);
    setPendingBeneficiaryChange(null);
  };

  const handleConfirmBeneficiaries = () => {
    if (currentAssistance) {
      setSelectedAssistance((prev: AssistanceWithBeneficiaries[]) => {
        const otherAssistances = prev.filter(a => {
          if (a.id !== currentAssistance.id) {
            return a.selectedBeneficiaries.length > 0 || a.includeTitular;
          }
          return false;
        });

        if (tempSelectedBeneficiaries.length > 0 || tempIncludeTitular) {
          return [...otherAssistances, {
            ...currentAssistance,
            selectedBeneficiaries: tempSelectedBeneficiaries,
            includeTitular: tempIncludeTitular
          } as AssistanceWithBeneficiaries];
        }
        return otherAssistances;
      });
      setShowBeneficiariesModal(false);
    }
  };

  const calculateAssistanceCost = (assistance: Assistance) => {
    const found = selectedAssistance.find(a => a.id === assistance.id);
    if (!found) return 0;
    
    const totalCount = found.selectedBeneficiaries.length + (found.includeTitular ? 1 : 0);
    
    // Si hay un precio específico para esta cantidad, usarlo
    if (totalCount in assistance.price) {
      return assistance.price[totalCount];
    }
    
    // Si no, usar el precio base
    return assistance.price.base || 0;
  };

  const totalCost = selectedAssistance.reduce((acc, assistance) => {
    const totalBeneficiaries = assistance.selectedBeneficiaries.length + (assistance.includeTitular ? 1 : 0);
    
    // Si es un precio fijo (como en mascotas), multiplicar por la cantidad
    if (assistance.price.fixed) {
      return acc + (assistance.price.fixed * totalBeneficiaries);
    }
    
    // Si hay un precio específico para esta cantidad, usarlo
    if (totalBeneficiaries in assistance.price) {
      return acc + assistance.price[totalBeneficiaries];
    }
    
    // Si no, usar el precio base
    return acc + (assistance.price.base || 0);
  }, 0);

  // Group assistances by category
  const assistancesByCategory = availableAssistance.reduce((acc, assistance) => {
    const category = assistance.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(assistance);
    return acc;
  }, {} as Record<string, Assistance[]>);

  // Add this constant at the component level
  const CATEGORIES_MAP = {
    HEALTH: 'Salud',
    HOME: 'Hogar',
    EXEQUIAL: 'Exequial',
    EDUCATION: 'Educación',
    LEGAL: 'Legal',
  } as const;

  // For currentAssistance?.price checks
  const defaultPrice = { base: 0 };

  // Agregar esta función helper al inicio del componente
  const getMinPrice = (priceStructure: PriceStructure): number => {
    if (priceStructure.fixed) {
      return priceStructure.fixed;
    }
    
    // Solo considerar los precios numéricos de esta asistencia específica
    const prices = Object.entries(priceStructure)
      .filter(([key]) => key !== 'base' && !isNaN(Number(key)))
      .map(([_, value]) => value);
    
    return prices.length > 0 ? Math.min(...prices) : priceStructure.base || 0;
  };

  const validateTitularForAssistance = (
    titular: TitularData,
    assistance: AssistanceWithRestrictions
  ): { isValid: boolean; message?: string } => {
    if (!assistance.restrictions?.includeTitular) {
      return {
        isValid: false,
        message: 'Esta asistencia no permite incluir al titular'
      };
    }
    return { isValid: true };
  };

  const toggleTitular = () => {
    if (currentAssistance) {
      const titularData: TitularData = {
        id: titular.documentNumber,
        name: `${titular.firstName} ${titular.lastName}`,
        age: 30
      };
      const validation = validateTitularForAssistance(titularData, currentAssistance);
      if (!validation.isValid) {
        toast.error(validation.message, {
          icon: <AlertCircle className="h-4 w-4" />
        });
        return;
      }
    }
    setTempIncludeTitular(prev => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto w-full px-4 sm:px-0"
    >
      <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Asistencias Disponibles</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Selecciona las asistencias que desees agregar a tu plan</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-50 px-3 sm:px-4 py-2 rounded-lg">
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                <span className="text-sm sm:text-base font-medium text-purple-600">
                  {beneficiaries.length} beneficiario{beneficiaries.length !== 1 ? 's' : ''}
                </span>
              </div>
              {selectedAssistance.length > 0 && (
                <div className="bg-green-50 px-3 sm:px-4 py-2 rounded-lg">
                  <span className="text-sm sm:text-base font-medium text-green-600">
                    {selectedAssistance.length} seleccionada{selectedAssistance.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-8">
            {Object.entries(assistancesByCategory).map(([category, assistances]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="p-1.5 bg-purple-50 rounded">
                    {category === 'HEALTH' && <Heart className="h-5 w-5 text-purple-600" />}
                    {category === 'HOME' && <Home className="h-5 w-5 text-purple-600" />}
                    {category === 'EXEQUIAL' && <Flower2 className="h-5 w-5 text-purple-600" />}
                    {category === 'LEGAL' && <Scale className="h-5 w-5 text-purple-600" />}
                    {category === 'EDUCATION' && <GraduationCap className="h-5 w-5 text-purple-600" />}
                  </span>
                  {CATEGORIES_MAP[category as keyof typeof CATEGORIES_MAP]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {assistances.map((assistance) => {
                    const isSelected = selectedAssistance.some(a => a.id === assistance.id);
                    return (
                      <motion.div
                        key={assistance.id}
                        className={`bg-white p-4 rounded-lg border-2 transition-colors ${
                          isSelected ? 'border-purple-500' : 'border-gray-100'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal(assistance)}
                      >
                        <div className="aspect-[16/9] relative">
                          <Image
                            src={assistance.image}
                            alt={assistance.name}
                            className="w-full h-full object-cover rounded-t-lg"
                            width={400}
                            height={225}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold text-white drop-shadow-sm">
                                {assistance.name}
                              </h3>
                              <p className="text-sm text-gray-100 line-clamp-2 drop-shadow">
                                {assistance.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Precio mensual desde</p>
                              <p className="text-xl font-bold text-purple-600">
                                ${getMinPrice(assistance.price).toLocaleString()}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(assistance);
                              }}
                              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                                selectedAssistance.find(a => a.id === assistance.id)
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                              }`}
                            >
                              {selectedAssistance.find(a => a.id === assistance.id) ? (
                                <>
                                  <Minus className="h-4 w-4" />
                                  <span>Remover</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  <span>Agregar</span>
                                </>
                              )}
                            </motion.button>
                          </div>

                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetails(assistance);
                              setShowDetailsModal(true);
                            }}
                            className="w-full py-2 text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm"
                          >
                            Ver detalles
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                        </div>

                        {assistance.titularOnly && (
                          <div className="mt-2 text-sm text-purple-600">
                            Solo disponible para el titular
                          </div>
                        )}
                        {isSelected && (
                          <div className="mt-2 text-sm font-medium text-purple-700">
                            {assistance.titularOnly ? 'Asistencia activada' : `${
                              selectedAssistance.find(a => a.id === assistance.id)?.selectedBeneficiaries.length || 0
                            } beneficiarios seleccionados`}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <Modal 
        isOpen={showDetailsModal} 
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetails(null);
        }}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Heart className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedDetails?.name}</h3>
                <p className="text-sm text-gray-500">{selectedDetails?.description}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-4">
            <div className="space-y-3">
              {selectedDetails?.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-purple-50"
                >
                  <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{feature}</p>
                </motion.div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={showBeneficiariesModal} 
        onClose={() => setShowBeneficiariesModal(false)}
        size="xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="border-b border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-4">
                {currentAssistance?.restrictions?.includeTitular && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <span className="text-gray-700">Titular: {titular.firstName} {titular.lastName}</span>
                          </div>
                        </div>
                        <Switch
                          key="titular"
                          isSelected={tempIncludeTitular}
                          onChange={toggleTitular}
                          size="sm"
                          startContent={<Check className="w-4 h-4" />}
                          endContent={<X className="w-4 h-4" />}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {beneficiaries
                    .filter(beneficiary => {
                      if (!currentAssistance?.restrictions) return true;
                      
                      const validation = validateBeneficiaryForAssistance(beneficiary, currentAssistance);
                      return validation.isValid;
                    })
                    .map((beneficiary) => {
                      const existingAssistance = getBeneficiaryCurrentAssistance(
                        beneficiary,
                        selectedAssistance,
                        currentAssistance?.id || ''
                      );

                      return (
                        <div key={beneficiary.id} 
                          className={`bg-blue-50 p-4 rounded-lg ${
                            existingAssistance ? 'border-2 border-yellow-300' : ''
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-blue-600" />
                              <div>
                                <span className="text-gray-700">{beneficiary.name}</span>
                                <span className="text-xs text-blue-600 ml-2">
                                  ({RELATIONSHIPS.find(r => r.value === beneficiary.relationship)?.label})
                                </span>
                                {existingAssistance && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Ya incluido en {existingAssistance.assistanceName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Switch
                              key={beneficiary.id}
                              isSelected={tempSelectedBeneficiaries.some(b => b.id === beneficiary.id)}
                              onChange={() => toggleBeneficiary(beneficiary)}
                              size="sm"
                              startContent={<Check className="w-4 h-4" />}
                              endContent={<X className="w-4 h-4" />}
                            />
                          </label>
                        </div>
                      );
                    })
                  }

                  {(tempSelectedBeneficiaries.length > 0 || tempIncludeTitular) && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-purple-700">
                            {tempSelectedBeneficiaries.length} beneficiario{tempSelectedBeneficiaries.length !== 1 ? 's' : ''} seleccionado{tempSelectedBeneficiaries.length !== 1 ? 's' : ''}
                            {tempIncludeTitular && (
                              <span className="text-purple-600">
                                {tempSelectedBeneficiaries.length > 0 ? ' + ' : ''}
                                titular como beneficiario
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-purple-600">
                            Costo por beneficiario: ${(() => {
                              const totalCount = tempSelectedBeneficiaries.length + (tempIncludeTitular ? 1 : 0);
                              const { pricePerUnit, isFixed } = getPriceByQuantity(currentAssistance?.price || defaultPrice, totalCount);
                              return (isFixed ? pricePerUnit : pricePerUnit / totalCount).toLocaleString();
                            })()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-700">
                            Total: ${(() => {
                              const { pricePerUnit, isFixed } = getPriceByQuantity(currentAssistance?.price || defaultPrice, 
                                tempSelectedBeneficiaries.length + (tempIncludeTitular ? 1 : 0));
                              const total = isFixed ? pricePerUnit * (tempSelectedBeneficiaries.length + (tempIncludeTitular ? 1 : 0)) : pricePerUnit;
                              return total.toLocaleString();
                            })()}
                          </p>
                          <p className="text-xs text-purple-600">
                            {tempIncludeTitular ? 'Incluye al titular como beneficiario' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowBeneficiariesModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmBeneficiaries}
                      className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingBeneficiaryChange(null);
        }}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cambio de Asistencia</h3>
                {currentAssistance && (
                  <p className="text-sm text-gray-500">
                    Categoría: {CATEGORY_RESTRICTIONS[currentAssistance.category]?.name}
                  </p>
                )}
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-4">
            {pendingBeneficiaryChange && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  <span className="font-semibold">{pendingBeneficiaryChange.beneficiary.name}</span> ya 
                  está incluido en la asistencia:
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-700 font-medium">
                    {pendingBeneficiaryChange.fromAssistance}
                  </p>
                </div>
                <p className="text-gray-700">
                  Si continúas, será movido a:
                </p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-700 font-medium">
                    {pendingBeneficiaryChange.toAssistance}
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingBeneficiaryChange(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmBeneficiaryChange}
                    className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    Confirmar Cambio
                  </button>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <motion.div 
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <motion.button
              onClick={onPrev}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </motion.button>

            {selectedAssistance.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 px-5">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <div className="p-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600">Total Mensual</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-blue-700">
                        ${totalCost.toLocaleString()}
                      </p>
                      <span className="text-xs text-blue-600">
                        · {beneficiaries.length} beneficiario{beneficiaries.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col xs:flex-row items-stretch gap-2 sm:w-auto">
            <motion.button
              onClick={onSkipToSummary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>Ir al Resumen</span>
            </motion.button>

            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {selectedAssistance.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100"
        >
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Puedes continuar sin seleccionar asistencias o elegir las que desees</span>
          </div>
        </motion.div>
      )}

      {selectedAssistance.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Asistencias Seleccionadas</h3>
          <div className="space-y-4">
            {selectedAssistance.map((assistance: AssistanceWithBeneficiaries) => (
              <div key={assistance.id} className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-purple-700">{assistance.name}</h4>
                    <p className="text-sm text-purple-600">
                      {assistance.titularOnly 
                        ? 'Solo titular'
                        : assistance.includeTitular && assistance.selectedBeneficiaries.length === 0
                          ? 'Solo titular como beneficiario'
                          : assistance.includeTitular
                            ? `Titular y ${assistance.selectedBeneficiaries.length} beneficiario${assistance.selectedBeneficiaries.length !== 1 ? 's' : ''}`
                            : `${assistance.selectedBeneficiaries.length} beneficiario${assistance.selectedBeneficiaries.length !== 1 ? 's' : ''}`
                      }
                    </p>
                    <div className="mt-2">
                      {assistance.selectedBeneficiaries.map((ben) => (
                        <span key={ben.id} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-2 mb-2">
                          {ben.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-600">
                      ${assistance.price.toLocaleString()} c/u
                    </p>
                    <p className="font-bold text-purple-700">
                      Total: ${calculateAssistanceCost(assistance).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <TotalPrice total={costos.total} />
      </div>
    </motion.div>
  );
} 