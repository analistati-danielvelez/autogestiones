import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { motion } from "framer-motion";
import { User, ArrowRight, Shield, CheckCircle2, Receipt } from 'lucide-react';
import TotalPrice from '@/components/TotalPrice';

interface TitularStepProps {
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
  setTitular: (titular: TitularStepProps['titular']) => void;
  onNext: () => void;
  onSkipToSummary: () => void;
  costos: {
    total: number;
  };
}

export default function TitularStep({ titular, setTitular, onNext, onSkipToSummary, costos }: TitularStepProps) {
  const handleInputChange = (field: string, value: string) => {
    setTitular({ ...titular, [field]: value });
  };

  const isFormComplete = titular.documentNumber && 
    titular.firstName && 
    titular.lastName && 
    titular.email && 
    titular.phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto w-full px-4 sm:px-0"
    >
      <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Información del Titular</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Ingresa los datos del titular del plan
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Select 
              label="Tipo de Documento" 
              value={titular.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              className="bg-white"
              required
            >
              <SelectItem key="CC">Cédula de Ciudadanía</SelectItem>
              <SelectItem key="CE">Cédula de Extranjería</SelectItem>
              <SelectItem key="PA">Pasaporte</SelectItem>
            </Select>

            <Input
              label="Número de Documento"
              value={titular.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              required
            />

            <Input
              label="Primer Nombre"
              value={titular.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />

            <Input
              label="Segundo Nombre"
              value={titular.secondName}
              onChange={(e) => handleInputChange('secondName', e.target.value)}
            />

            <Input
              label="Primer Apellido"
              value={titular.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />

            <Input
              label="Segundo Apellido"
              value={titular.secondLastName}
              onChange={(e) => handleInputChange('secondLastName', e.target.value)}
            />

            <Select 
              label="Género" 
              value={titular.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              required
            >
              <SelectItem key="M">Masculino</SelectItem>
              <SelectItem key="F">Femenino</SelectItem>
              <SelectItem key="O">Otro</SelectItem>
            </Select>

            <Select 
              label="Estado Civil" 
              value={titular.maritalStatus}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              required
            >
              <SelectItem key="S">Soltero/a</SelectItem>
              <SelectItem key="C">Casado/a</SelectItem>
              <SelectItem key="D">Divorciado/a</SelectItem>
              <SelectItem key="V">Viudo/a</SelectItem>
              <SelectItem key="U">Unión Libre</SelectItem>
            </Select>

            <Input
              type="email"
              label="Correo Electrónico"
              value={titular.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />

            <Input
              type="tel"
              label="Celular"
              value={titular.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />

            <Select 
              label="Estrato Social" 
              value={titular.socialStratum}
              onChange={(e) => handleInputChange('socialStratum', e.target.value)}
              required
            >
              {["1", "2", "3", "4", "5", "6"].map(strata => (
                <SelectItem key={strata}>{strata}</SelectItem>
              ))}
            </Select>

            <Select 
              label="Grado de Escolaridad" 
              value={titular.educationLevel}
              onChange={(e) => handleInputChange('educationLevel', e.target.value)}
              required
            >
              <SelectItem key="PR">Primaria</SelectItem>
              <SelectItem key="SE">Secundaria</SelectItem>
              <SelectItem key="TE">Técnico</SelectItem>
              <SelectItem key="UN">Universitario</SelectItem>
              <SelectItem key="PO">Posgrado</SelectItem>
            </Select>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isFormComplete && (
          <div className="flex justify-end mb-4">
            <TotalPrice total={costos.total} />
          </div>
        )}
        <div className="flex flex-col xs:flex-row gap-2">
          {isFormComplete && (
            <motion.button
              onClick={onSkipToSummary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>Ir al Resumen</span>
            </motion.button>
          )}

          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!isFormComplete}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFormComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm focus:ring-green-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Continuar</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
} 