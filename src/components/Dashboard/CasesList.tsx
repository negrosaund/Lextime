import { Briefcase, Plus } from 'lucide-react';
import { Case } from '../../lib/supabase';

type Props = {
  cases: Case[];
  onNewCase: () => void;
};

export function CasesList({ cases, onNewCase }: Props) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mis Causas</h2>
        <button
          onClick={onNewCase}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Causa</span>
        </button>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {cases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comienza agregando causas
            </h3>
            <p className="text-gray-600 mb-4">
              Registra las causas que estás llevando para poder gestionar sus plazos
            </p>
            <button
              onClick={onNewCase}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg"
            >
              Crear Primera Causa
            </button>
          </div>
        ) : (
          cases.map((caseItem) => (
            <div key={caseItem.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      caseItem.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : caseItem.status === 'archived'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {caseItem.status === 'active' ? 'Activa' : caseItem.status === 'archived' ? 'Archivada' : 'Cerrada'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {caseItem.case_name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-1">
                    Rol: {caseItem.case_number}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Cliente: {caseItem.client_name}</span>
                    <span>Tribunal: {caseItem.court}</span>
                  </div>

                  {caseItem.description && (
                    <p className="mt-2 text-sm text-gray-600">{caseItem.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
