import { Calendar, CheckCircle } from 'lucide-react';
import { Deadline, Case } from '../../lib/supabase';
import { formatDate, getDaysUntil, getUrgencyBadge } from '../../utils/dateCalculations';

type DeadlineWithCase = Deadline & {
  case: Case;
};

type Props = {
  deadlines: DeadlineWithCase[];
  onComplete: (deadlineId: string) => void;
};

export function UpcomingDeadlines({ deadlines, onComplete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Próximos Vencimientos</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {deadlines.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Todo bajo control
            </h3>
            <p className="text-gray-600 mb-4">
              No tienes plazos próximos en este momento
            </p>
            <p className="text-sm text-gray-500">
              Cuando agregues nuevos plazos, aparecerán aquí ordenados por urgencia
            </p>
          </div>
        ) : (
          deadlines.map((deadline) => {
            const daysUntil = getDaysUntil(deadline.due_date);
            const urgencyClass = getUrgencyBadge(daysUntil);

            return (
              <div key={deadline.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${urgencyClass}`}>
                        {daysUntil < 0
                          ? `Vencido hace ${Math.abs(daysUntil)} días`
                          : daysUntil === 0
                          ? 'Vence hoy'
                          : `${daysUntil} días`}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {deadline.deadline_type}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {deadline.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-1">
                      Causa: {deadline.case.case_name} ({deadline.case.case_number})
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Vencimiento: {formatDate(deadline.due_date)}</span>
                      <span>Tribunal: {deadline.case.court}</span>
                    </div>

                    {deadline.notes && (
                      <p className="mt-2 text-sm text-gray-600">{deadline.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onComplete(deadline.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Marcar como completado"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
