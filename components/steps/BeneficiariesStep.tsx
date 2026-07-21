import { useState, Dispatch, SetStateAction } from 'react';
import { Beneficiary, Pet } from '@/types';
import { 
  UserPlus, 
  User, 
  FileText,
  Trash2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  UserCog,
  ArrowLeft,
  Heart,
  Globe,
  Receipt,
  PawPrint,
  Dog,
  Cat,
  PlusCircle
} from 'lucide-react';
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import { 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import type { AssistanceWithBeneficiaries, AssistanceWithPets } from '@/app/buy/premium/types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import TotalPrice from '@/components/TotalPrice';
import { RELATIONSHIPS } from '@/app/buy/premium/constants';

interface BeneficiariesStepProps {
  beneficiaries?: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  onNext: () => void;
  onPrev: () => void;
  selectedHumanAssistance?: AssistanceWithBeneficiaries[];
  setSelectedHumanAssistance: Dispatch<SetStateAction<AssistanceWithBeneficiaries[]>>;
  selectedGlobalBeneficiaries?: Beneficiary[];
  setSelectedGlobalBeneficiaries: Dispatch<SetStateAction<Beneficiary[]>>;
  onSkipToSummary: () => void;
  costos: {
    total: number;
  };
  pets?: Pet[];
  setPets: Dispatch<SetStateAction<Pet[]>>;
  selectedPetAssistance?: AssistanceWithPets[];
  setSelectedPetAssistance: Dispatch<SetStateAction<AssistanceWithPets[]>>;
}

export default function BeneficiariesStep({
  beneficiaries = [],
  setBeneficiaries,
  onNext,
  onPrev,
  selectedHumanAssistance = [],
  setSelectedHumanAssistance,
  selectedGlobalBeneficiaries = [],
  setSelectedGlobalBeneficiaries,
  onSkipToSummary,
  costos,
  pets = [],
  setPets,
  selectedPetAssistance = [],
  setSelectedPetAssistance,
}: BeneficiariesStepProps) {
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'CC',
    documentNumber: '',
    age: '',
    relationship: ''
  });

  // Agregar estados para la modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<string | null>(null);

  // Agregar estado para mascotas
  const [petFormData, setPetFormData] = useState<{
    name: string;
    species: 'PERRO' | 'GATO';
    color: string;
    age: string;
  }>({
    name: '',
    species: 'PERRO',
    color: '',
    age: ''
  });

  const [petToDelete, setPetToDelete] = useState<string | null>(null);

  const addBeneficiary = () => {
    if (formData.name && formData.documentNumber && formData.age && formData.relationship) {
      setBeneficiaries([...beneficiaries, {
        id: Date.now().toString(),
        ...formData,
        age: parseInt(formData.age)
      }]);
      setFormData({
        name: '',
        documentType: 'CC',
        documentNumber: '',
        age: '',
        relationship: ''
      });
      toast.success('¡Beneficiario agregado exitosamente!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: <CheckCircle2 className="h-5 w-5" />
      });
    } else {
      toast.error('Por favor complete todos los campos requeridos', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: <AlertCircle className="h-5 w-5" />
      });
    }
  };

  const handleRemoveBeneficiary = (beneficiaryId: string) => {
    const hasAssistances = selectedHumanAssistance?.some(a => 
      a.selectedBeneficiaries?.some(b => b.id === beneficiaryId)
    ) || false;
    const hasGlobal = selectedGlobalBeneficiaries?.some(b => b.id === beneficiaryId) || false;

    if (hasAssistances || hasGlobal) {
      setBeneficiaryToDelete(beneficiaryId);
      setShowConfirmModal(true);
    } else {
      setBeneficiaries(beneficiaries.filter(b => b.id !== beneficiaryId));
      toast.info('Beneficiario eliminado correctamente', {
        icon: <Trash2 className="h-4 w-4" />
      });
    }
  };

  const confirmDelete = () => {
    if (beneficiaryToDelete) {
      setBeneficiaries(beneficiaries.filter(b => b.id !== beneficiaryToDelete));
      
      setSelectedHumanAssistance((prevAssistance = []) => 
        prevAssistance.map(assistance => ({
          ...assistance,
          selectedBeneficiaries: assistance.selectedBeneficiaries?.filter(b => b.id !== beneficiaryToDelete) || []
        }))
      );

      setSelectedGlobalBeneficiaries(
        (prevBeneficiaries: Beneficiary[]) => prevBeneficiaries.filter(b => b.id !== beneficiaryToDelete)
      );

      toast.info('Beneficiario y sus asistencias eliminados correctamente', {
        icon: <Trash2 className="h-4 w-4" />
      });
    }

    if (petToDelete) {
      setPets(pets.filter(p => p.id !== petToDelete));
      
      setSelectedPetAssistance(
        (prevAssistance: AssistanceWithPets[]) => prevAssistance.map(assistance => ({
          ...assistance,
          selectedPets: assistance.selectedPets?.filter(p => p.id !== petToDelete) || []
        }))
      );

      toast.info('Mascota y sus asistencias eliminadas correctamente', {
        icon: <Trash2 className="h-4 w-4" />
      });
    }

    setShowConfirmModal(false);
    setBeneficiaryToDelete(null);
    setPetToDelete(null);
  };

  // Agregar funciones para mascotas
  const addPet = () => {
    if (petFormData.name && petFormData.color && petFormData.age) {
      setPets([...pets, {
        id: Date.now().toString(),
        ...petFormData,
        age: parseInt(petFormData.age)
      }]);
      setPetFormData({
        name: '',
        species: 'PERRO',
        color: '',
        age: ''
      });
      toast.success('¡Mascota agregada exitosamente!', {
        icon: <CheckCircle2 className="h-4 w-4" />
      });
    } else {
      toast.error('Por favor complete todos los campos requeridos', {
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
  };

  const handleRemovePet = (petId: string) => {
    // Agregar validación para evitar error si selectedPetAssistance es undefined
    const hasAssistances = selectedPetAssistance?.some(a => 
      a.selectedPets?.some(p => p.id === petId)
    ) || false;

    if (hasAssistances) {
      setPetToDelete(petId);
      setShowConfirmModal(true);
    } else {
      setPets(pets.filter(p => p.id !== petId));
      toast.info('Mascota eliminada correctamente', {
        icon: <Trash2 className="h-4 w-4" />
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto w-full"
    >
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 relative overflow-hidden"
        whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Agregar Beneficiarios</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            label="Nombre completo"
            placeholder="Ingrese el nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            startContent={<User className="h-5 w-5 text-gray-400" />}
          />

          <Select
            label="Tipo de documento"
            placeholder="Seleccione el tipo"
            value={formData.documentType}
            onChange={(e) => setFormData({...formData, documentType: e.target.value})}
            startContent={<FileText className="h-5 w-5 text-gray-400" />}
          >
            <SelectItem key="CC">Cédula de Ciudadanía</SelectItem>
            <SelectItem key="TI">Tarjeta de Identidad</SelectItem>
            <SelectItem key="CE">Cédula de Extranjería</SelectItem>
          </Select>

          <Input
            type="text"
            label="Número de documento"
            placeholder="Ingrese el número"
            value={formData.documentNumber}
            onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
          />

          <Input
            type="number"
            label="Edad"
            placeholder="Ingrese la edad"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
          />

          <Select
            label="Parentesco"
            placeholder="Seleccione el parentesco"
            value={formData.relationship}
            onChange={(e) => setFormData({...formData, relationship: e.target.value})}
            className="col-span-2"
          >
            {RELATIONSHIPS.map(({ value, label }) => (
              <SelectItem key={value}>{label}</SelectItem>
            ))}
          </Select>
        </div>

        <motion.button
          onClick={addBeneficiary}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Agregar Beneficiario</span>
        </motion.button>
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-green-600" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Beneficiarios Registrados</h3>
          </div>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Total: {beneficiaries.length}
            </span>
          </div>
        </div>

        {beneficiaries.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table aria-label="Tabla de beneficiarios registrados">
                  <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>DOCUMENTO</TableColumn>
                    <TableColumn>EDAD</TableColumn>
                    <TableColumn>PARENTESCO</TableColumn>
                    <TableColumn>ASISTENCIAS</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell>{beneficiary.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {beneficiary.documentType} {beneficiary.documentNumber}
                          </span>
                        </TableCell>
                        <TableCell>{beneficiary.age}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {RELATIONSHIPS.find(r => r.value === beneficiary.relationship)?.label || beneficiary.relationship}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {selectedHumanAssistance?.some(a => 
                              a.selectedBeneficiaries?.some(b => b.id === beneficiary.id)
                            ) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Heart className="w-3 h-3 mr-1" />
                                Asistencia
                              </span>
                            )}
                            {selectedGlobalBeneficiaries?.some(b => b.id === beneficiary.id) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                <Globe className="w-3 h-3 mr-1" />
                                Global
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              handleRemoveBeneficiary(beneficiary.id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </motion.button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay beneficiarios agregados
          </div>
        )}
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 relative overflow-hidden"
        whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-600" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 rounded-lg">
            <PawPrint className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold">Agregar Mascotas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            label="Nombre de la mascota"
            placeholder="Ingrese el nombre"
            value={petFormData.name}
            onChange={(e) => setPetFormData({...petFormData, name: e.target.value})}
            startContent={<Heart className="h-5 w-5 text-gray-400" />}
          />

          <Select
            label="Especie"
            placeholder="Seleccione la especie"
            value={petFormData.species}
            onChange={(e) => setPetFormData({...petFormData, species: e.target.value as 'PERRO' | 'GATO'})}
            startContent={petFormData.species === 'PERRO' ? 
              <Dog className="h-5 w-5 text-gray-400" /> : 
              <Cat className="h-5 w-5 text-gray-400" />
            }
          >
            <SelectItem key="PERRO">Perro</SelectItem>
            <SelectItem key="GATO">Gato</SelectItem>
          </Select>

          <Input
            type="text"
            label="Color"
            placeholder="Ingrese el color"
            value={petFormData.color}
            onChange={(e) => setPetFormData({...petFormData, color: e.target.value})}
          />

          <Input
            type="number"
            label="Edad (años)"
            placeholder="Ingrese la edad"
            value={petFormData.age}
            onChange={(e) => setPetFormData({...petFormData, age: e.target.value})}
          />
        </div>

        <motion.button
          onClick={addPet}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Agregar Mascota</span>
        </motion.button>
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-600" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Mascotas Registradas</h3>
          </div>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Total: {pets.length}
            </span>
          </div>
        </div>

        {pets.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table aria-label="Tabla de mascotas registradas">
                  <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>ESPECIE</TableColumn>
                    <TableColumn>COLOR</TableColumn>
                    <TableColumn>EDAD</TableColumn>
                    <TableColumn>ASISTENCIAS</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell>{pet.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {pet.species === 'PERRO' ? 'Perro' : 'Gato'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {pet.color}
                          </span>
                        </TableCell>
                        <TableCell>{pet.age}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {selectedPetAssistance?.some(a => 
                              a.selectedPets?.some(p => p.id === pet.id)
                            ) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Heart className="w-3 h-3 mr-1" />
                                Asistencia
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              handleRemovePet(pet.id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </motion.button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay mascotas agregadas
          </div>
        )}
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <motion.button
              onClick={onPrev}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </motion.button>
            
            {beneficiaries.length > 0 && (
              <div className="flex-1 flex items-center justify-center sm:justify-start">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                    <UserCog className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600">Total</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-blue-600">
                        {beneficiaries.length} {beneficiaries.length === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          <div className="flex flex-col xs:flex-row gap-2">
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
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                beneficiaries.length === 0
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm focus:ring-blue-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm focus:ring-green-500'
              }`}
            >
              {beneficiaries.length === 0 ? (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>Continuar sin beneficiarios</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Continuar con {beneficiaries.length} {beneficiaries.length === 1 ? 'beneficiario' : 'beneficiarios'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <TotalPrice total={costos.total} />
        </div>

      </motion.div>

      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        size="sm"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Confirmar eliminación</h3>
                <p className="text-sm text-gray-500">
                  Este beneficiario tiene asistencias asociadas
                </p>
              </ModalHeader>
              <ModalBody className="py-6">
                <p className="text-gray-600">
                  ¿Desea eliminarlo y removerlo de todas las asistencias?
                </p>
              </ModalBody>
              <div className="flex justify-end gap-3 p-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
} 