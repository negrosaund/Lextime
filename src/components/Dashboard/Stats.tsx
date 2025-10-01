import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type Props = {
  totalCases: number;
  activeDeadlines: number;
  urgentDeadlines: number;
  completedThisMonth: number;
};

export function Stats({ totalCases, activeDeadlines, urgentDeadlines, completedThisMonth }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Causas Activas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalCases}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Plazos Activos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeDeadlines}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Próximos a Vencer</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{urgentDeadlines}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completados</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{completedThisMonth}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-full">
            <CheckCircle className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
