import { useState } from 'react';
import { CheckCircle, Calendar, Bell, Briefcase, X } from 'lucide-react';

type Props = {
  onComplete: () => void;
};

export function WelcomeTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: CheckCircle,
      title: '¡Bienvenido a LEXTIME!',
      description: 'Tu asistente confiable para gestionar plazos legales. Nunca más te preocupes por olvidar un vencimiento importante.',
      color: 'bg-green-500',
    },
    {
      icon: Briefcase,
      title: 'Registra tus Causas',
      description: 'Comienza agregando las causas que estás llevando. Incluye el rol, tribunal, cliente y toda la información relevante.',
      color: 'bg-blue-500',
    },
    {
      icon: Calendar,
      title: 'Crea tus Plazos',
      description: 'Agrega plazos con solo indicar la fecha de inicio y días hábiles. LEXTIME calculará automáticamente la fecha de vencimiento, considerando feriados y fines de semana.',
      color: 'bg-orange-500',
    },
    {
      icon: Bell,
      title: 'Recordatorios Automáticos',
      description: 'Configura cuándo quieres ser notificado: 10 días antes, 3 días antes, o el mismo día. Recibirás alertas por correo electrónico para que nunca te pierdas un plazo.',
      color: 'bg-purple-500',
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="pt-12 pb-8 px-8 text-center">
            <div className={`${currentStep.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentStep.title}
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <div className="px-8 pb-8">
            <div className="flex justify-center space-x-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === step
                      ? 'w-8 bg-blue-600'
                      : index < step
                      ? 'w-2 bg-blue-400'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
              >
                {step < steps.length - 1 ? 'Siguiente' : '¡Comenzar!'}
              </button>
            </div>

            {step === 0 && (
              <button
                onClick={handleSkip}
                className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
              >
                Saltar tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
