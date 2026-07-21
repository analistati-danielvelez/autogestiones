import { User, Users, Heart, PawPrint, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Titular', icon: User },
  { id: 2, name: 'Beneficiarios', icon: Users },
  { id: 3, name: 'Asist. Personas', icon: Heart },
  { id: 4, name: 'Asist. Mascotas', icon: PawPrint },
  { id: 5, name: 'Resumen', icon: CheckCircle2 },
];

interface StepsNavigationProps {
  currentStep: number;
  onNavigateToStep: (step: number | 'next' | 'prev') => void;
}

export function StepsNavigation({ currentStep, onNavigateToStep }: StepsNavigationProps) {
  return (
    <div className="sticky top-16 z-40 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex justify-center items-center bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Versión móvil */}
          <div className="flex md:hidden items-center justify-center w-full overflow-x-auto hide-scrollbar p-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;
              const isAdjacent = Math.abs(step.id - currentStep) <= 1;
              
              if (!isAdjacent && !isActive) return null;

              return (
                <button
                  key={step.id}
                  onClick={() => onNavigateToStep(step.id)}
                  className={`
                    flex items-center shrink-0 gap-1.5 px-3 py-1.5 
                    rounded-lg text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm' 
                      : isPast
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">{step.name}</span>
                </button>
              );
            })}
          </div>

          {/* Versión tablet/desktop */}
          <div className="hidden md:grid md:grid-cols-5 w-full max-w-4xl gap-px bg-gray-100 p-1.5 rounded-xl">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isPast = step.id < currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => onNavigateToStep(step.id)}
                  className={`
                    flex items-center justify-center gap-1.5 px-2 py-2
                    rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm' 
                      : isPast
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline whitespace-nowrap">{step.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
} 