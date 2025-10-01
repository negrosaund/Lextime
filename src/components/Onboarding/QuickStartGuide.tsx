import { Briefcase, Calendar, Info, X } from 'lucide-react';

type Props = {
  onClose: () => void;
  onCreateCase: () => void;
  onCreateDeadline: () => void;
};

export function QuickStartGuide({ onClose, onCreateCase, onCreateDeadline }: Props) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 shadow-soft-lg mb-8 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Info className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Guía de Inicio Rápido
          </h3>
          <p className="text-gray-700">
            Sigue estos pasos simples para comenzar a gestionar tus plazos:
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-soft">
          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
            <span className="text-blue-600 font-bold text-lg">1</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Registra tu primera causa</h4>
            <p className="text-gray-600 text-sm mb-3">
              Ingresa el rol, tribunal, cliente y detalles de la causa que estás llevando.
            </p>
            <button
              onClick={onCreateCase}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Briefcase className="w-4 h-4" />
              <span>Crear Primera Causa</span>
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-soft">
          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
            <span className="text-green-600 font-bold text-lg">2</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Agrega un plazo</h4>
            <p className="text-gray-600 text-sm mb-3">
              Define la fecha de inicio y días hábiles. LEXTIME calculará automáticamente el vencimiento.
            </p>
            <button
              onClick={onCreateDeadline}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              <span>Crear Primer Plazo</span>
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-soft">
          <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
            <span className="text-purple-600 font-bold text-lg">3</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Recibe recordatorios</h4>
            <p className="text-gray-600 text-sm">
              LEXTIME te enviará notificaciones por correo electrónico según los días que hayas configurado. ¡Nunca más olvidarás un plazo!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
