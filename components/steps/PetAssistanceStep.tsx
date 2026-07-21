import React, { Dispatch, SetStateAction } from "react";
import { Assistance, Pet } from '@/types';
import { 
  PawPrint, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Shield,
  Plus,
  Minus,
  Star,
  X,
  Check,
  Receipt,
  Heart,
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
import { Switch } from "@heroui/switch";
import TotalPrice from "../TotalPrice";
import { getPriceByQuantity } from '@/app/buy/premium/constants';
import { PriceStructure } from "@/app/buy/premium/types";
import { PET_CATEGORY_RESTRICTIONS } from '@/app/buy/premium/constants';
import { toast } from 'react-toastify';

interface PetAssistanceStepProps {
  selectedAssistance: AssistanceWithPets[];
  setSelectedAssistance: Dispatch<SetStateAction<AssistanceWithPets[]>>;
  availableAssistance: Assistance[];
  onNext: () => void;
  onPrev: () => void;
  pets: Pet[];
  onSkipToSummary: () => void;
  costos: {
    total: number;
    costoAsistenciasMascotas: number;
  };
}

interface AssistanceWithPets extends Assistance {
  selectedPets: Pet[];
}

const PET_ASSISTANCE_CATEGORIES = {
  PET_HEALTH: 'Salud Mascotas',
  PET_GROOMING: 'Peluquería',
  PET_EMERGENCY: 'Emergencias',
  PET_EXEQUIAL: 'Exequial',
} as const;

const defaultPrice = { base: 0 };

const getMinPrice = (priceStructure: PriceStructure): number => {
  if (priceStructure.fixed) {
    return priceStructure.fixed;
  }
  
  // Buscar el primer precio numérico (excluyendo 'base')
  const firstPrice = Object.entries(priceStructure)
    .find(([key, _]) => key !== 'base' && !isNaN(Number(key)))?.[1];
  
  // Si no hay precios numéricos, usar el precio base
  return firstPrice || priceStructure.base || 0;
};

const getPetCurrentAssistance = (
  pet: Pet,
  selectedAssistance: AssistanceWithPets[],
  currentAssistanceId: string,
  category: string
): { assistanceName: string; category: string } | null => {
  if (PET_CATEGORY_RESTRICTIONS[category]?.allowMultipleAssistances) {
    return null;
  }

  const otherAssistance = selectedAssistance.find(assistance => 
    assistance.id !== currentAssistanceId &&
    assistance.category === category &&
    assistance.selectedPets.some(p => p.id === pet.id)
  );

  if (otherAssistance) {
    return {
      assistanceName: otherAssistance.name,
      category: otherAssistance.category
    };
  }

  return null;
};

export default function PetAssistanceStep({
  selectedAssistance,
  setSelectedAssistance,
  availableAssistance,
  onNext,
  onPrev,
  pets,
  onSkipToSummary,
  costos,
}: PetAssistanceStepProps) {
  const [selectedDetails, setSelectedDetails] = useState<Assistance | null>(null);
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [currentAssistance, setCurrentAssistance] = useState<Assistance | null>(null);
  const [tempSelectedPets, setTempSelectedPets] = useState<Pet[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPetChange, setPendingPetChange] = useState<{ pet: Pet; fromAssistance: string; toAssistance: string } | null>(null);

  const toggleAssistance = (assistance: Assistance) => {
    const existing = selectedAssistance.find(a => a.id === assistance.id);
    setCurrentAssistance(assistance);
    setTempSelectedPets(existing?.selectedPets || []);
    setShowPetsModal(true);
  };

  const handleConfirmPets = () => {
    if (currentAssistance) {
      setSelectedAssistance(prev => {
        const otherAssistances = prev.filter(a => a.id !== currentAssistance.id);
        
        if (tempSelectedPets.length > 0) {
          return [...otherAssistances, {
            ...currentAssistance,
            selectedPets: tempSelectedPets
          }];
        }
        return otherAssistances;
      });
      setShowPetsModal(false);
    }
  };

  const handleConfirmPetChange = () => {
    if (!pendingPetChange || !currentAssistance) return;

    // Remove pet from other assistance in the same category and filter out empty assistances
    setSelectedAssistance(prev => {
      const updatedAssistances = prev.map(assistance => {
        if (assistance.category === currentAssistance.category && 
            assistance.id !== currentAssistance.id) {
          // Remove the pet from this assistance
          const updatedPets = assistance.selectedPets.filter(
            p => p.id !== pendingPetChange.pet.id
          );
          
          return {
            ...assistance,
            selectedPets: updatedPets
          };
        }
        return assistance;
      });

      // Filter out assistances that have no pets selected
      return updatedAssistances.filter(assistance => 
        assistance.selectedPets.length > 0 || assistance.id === currentAssistance.id
      );
    });

    // Add pet to current assistance
    setTempSelectedPets(prev => [...prev, pendingPetChange.pet]);
    setShowConfirmModal(false);
    setPendingPetChange(null);
  };

  const calculateAssistanceCost = (assistance: Assistance) => {
    const found = selectedAssistance.find(a => a.id === assistance.id);
    if (!found) return 0;
    
    const petsCount = found.selectedPets.length;
    
    // Si es un precio fijo (como en servicios de salud para mascotas)
    if (assistance.price.fixed) {
      return assistance.price.fixed * petsCount;
    }
    
    // Si hay un precio específico para esta cantidad de mascotas, usarlo
    if (petsCount in assistance.price) {
      return assistance.price[petsCount];
    }
    
    // Si no, usar el precio base
    return assistance.price.base || 0;
  };

  // Group assistances by category
  const assistancesByCategory = availableAssistance.reduce((acc, assistance) => {
    const category = assistance.category || 'HEALTH';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(assistance);
    return acc;
  }, {} as Record<string, Assistance[]>);

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
              <div className="p-3 bg-orange-50 rounded-lg">
                <PawPrint className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Asistencias para Mascotas</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Selecciona las asistencias para tus mascotas</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-50 px-3 sm:px-4 py-2 rounded-lg">
                <PawPrint className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600" />
                <span className="text-sm sm:text-base font-medium text-orange-600">
                  {pets?.length || 0} mascota{(pets?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              {selectedAssistance.length > 0 && (
                <div className="bg-green-50 px-3 sm:px-4 py-2 rounded-lg">
                  <span className="text-sm sm:text-base font-medium text-green-600">
                    {selectedAssistance.length} seleccionado{selectedAssistance.length !== 1 ? 's' : ''}
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
                  <span className="p-1.5 bg-orange-50 rounded">
                    <PawPrint className="h-5 w-5 text-orange-600" />
                  </span>
                  {PET_ASSISTANCE_CATEGORIES[category as keyof typeof PET_ASSISTANCE_CATEGORIES] || category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {assistances.map((assistance) => (
                    <motion.div
                      key={assistance.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative w-full bg-white rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedAssistance.find(a => a.id === assistance.id)
                          ? 'ring-2 ring-orange-500 shadow-orange-100'
                          : 'border border-gray-200 hover:border-orange-200 hover:shadow-lg'
                      }`}
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
                            <p className="text-xl font-bold text-orange-600">
                              ${getMinPrice(assistance.price).toLocaleString()}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAssistance(assistance)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                              selectedAssistance.find(a => a.id === assistance.id)
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
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
                          onClick={() => setSelectedDetails(assistance)}
                          className="w-full py-2 text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-sm"
                        >
                          Ver detalles
                          <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <Modal 
        isOpen={!!selectedDetails} 
        onClose={() => setSelectedDetails(null)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="border-b border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Star className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedDetails?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedDetails?.description}</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <div className="space-y-4">
                  {selectedDetails?.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{feature}</p>
                    </motion.div>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={showPetsModal} 
        onClose={() => setShowPetsModal(false)}
        size="xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="border-b border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <PawPrint className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Seleccionar Mascotas</h3>
                    <p className="text-sm text-gray-500">
                      {`Precio por mascota: $${(() => {
                        const { pricePerUnit, isFixed } = getPriceByQuantity(currentAssistance?.price || defaultPrice, tempSelectedPets.length);
                        return (isFixed ? pricePerUnit : pricePerUnit / tempSelectedPets.length).toLocaleString();
                      })()}`}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-4">
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Seleccionar
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nombre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Especie
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Costo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pets.map((pet) => (
                          <tr key={pet.id}>
                            <td className="px-6 py-4">
                                <Switch
                                  isSelected={tempSelectedPets.some(p => p.id === pet.id)}
                                  onChange={(e) => {
                                    if (!currentAssistance) return;

                                    if (e.target.checked) {
                                      const existingAssistance = getPetCurrentAssistance(
                                        pet,
                                        selectedAssistance,
                                        currentAssistance.id,
                                        currentAssistance.category
                                      );

                                      if (existingAssistance) {
                                        setPendingPetChange({
                                          pet,
                                          fromAssistance: existingAssistance.assistanceName,
                                          toAssistance: currentAssistance.name
                                        });
                                        setShowConfirmModal(true);
                                        return;
                                      }
                                    }
                                    
                                    setTempSelectedPets(prev => {
                                      if (e.target.checked) {
                                        return [...prev, pet];
                                      } else {
                                        return prev.filter(p => p.id !== pet.id);
                                      }
                                    });
                                  }}
                                  size="sm"
                                  startContent={<Check className="w-4 h-4" />}
                                  endContent={<X className="w-4 h-4" />}
                                >
                                </Switch>
                            </td>
                            <td className="px-6 py-4">{pet.name}</td>
                            <td className="px-6 py-4">{pet.species}</td>
                            <td className="px-6 py-4 text-right text-sm font-medium text-orange-600">
                              {tempSelectedPets.some(p => p.id === pet.id) && 
                                `$${(() => {
                                  const { pricePerUnit, isFixed } = getPriceByQuantity(currentAssistance?.price || defaultPrice, tempSelectedPets.length);
                                  return (isFixed ? pricePerUnit : pricePerUnit / tempSelectedPets.length).toLocaleString();
                                })()}`
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {tempSelectedPets.length > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-orange-700">
                            {tempSelectedPets.length} mascota{tempSelectedPets.length !== 1 ? 's' : ''} seleccionada{tempSelectedPets.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-orange-600">
                            {`Costo por mascota: $${(() => {
                              const { pricePerUnit, isFixed } = getPriceByQuantity(currentAssistance?.price || defaultPrice, tempSelectedPets.length);
                              return (isFixed ? pricePerUnit : pricePerUnit / tempSelectedPets.length).toLocaleString();
                            })()}`}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-orange-700">
                          Total: ${(() => {
                            const { pricePerUnit, isFixed } = getPriceByQuantity(currentAssistance?.price || defaultPrice, tempSelectedPets.length);
                            const total = isFixed ? pricePerUnit * tempSelectedPets.length : pricePerUnit;
                            return total.toLocaleString();
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowPetsModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmPets}
                      className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
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
          setPendingPetChange(null);
        }}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold">Cambio de Asistencia</h3>
            </div>
          </ModalHeader>
          <ModalBody className="p-4">
            {pendingPetChange && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  <span className="font-semibold">{pendingPetChange.pet.name}</span> ya 
                  está incluido en la asistencia:
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-700 font-medium">
                    {pendingPetChange.fromAssistance}
                  </p>
                </div>
                <p className="text-gray-700">
                  ¿Deseas cambiarlo a la asistencia?:
                </p>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-orange-700 font-medium">
                    {pendingPetChange.toAssistance}
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingPetChange(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPetChange}
                    className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
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
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <motion.button
              onClick={onPrev}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </motion.button>

            {selectedAssistance.length > 0 && (
              <div className="flex-1 flex items-center justify-center sm:justify-start">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600">Total Asistencias</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-red-600">
                          ${costos.costoAsistenciasMascotas.toLocaleString()}
                        </span>
                      </div>
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
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>Ir al Resumen</span>
            </motion.button>

            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <TotalPrice total={costos.total} />
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
            {selectedAssistance.map((assistance) => (
              <div key={assistance.id} className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-orange-700">{assistance.name}</h4>
                    <p className="text-sm text-orange-600">
                      Mascotas seleccionadas: {assistance.selectedPets.length}
                    </p>
                    <div className="mt-2">
                      {assistance.selectedPets.map((pet) => (
                        <span key={pet.id} className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-2 mb-2">
                          {pet.name} ({pet.species})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-orange-600">
                      {`$${(() => {
                        const { pricePerUnit, isFixed } = getPriceByQuantity(assistance.price, assistance.selectedPets.length);
                        return (isFixed ? pricePerUnit : pricePerUnit / assistance.selectedPets.length).toLocaleString();
                      })()} c/u`}
                    </p>
                    <p className="font-bold text-orange-700">
                      Total: ${(() => {
                        const { pricePerUnit, isFixed } = getPriceByQuantity(assistance.price, assistance.selectedPets.length);
                        const total = isFixed ? pricePerUnit * assistance.selectedPets.length : pricePerUnit;
                        return total.toLocaleString();
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
} 