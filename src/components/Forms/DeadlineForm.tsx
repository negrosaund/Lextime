import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { supabase, Case, Holiday } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { addBusinessDays } from '../../utils/dateCalculations';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export function DeadlineForm({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [formData, setFormData] = useState({
    case_id: '',
    title: '',
    deadline_type: 'other',
    start_date: new Date().toISOString().split('T')[0],
    business_days: 10,
    notes: '',
    reminder_days: [10, 3, 1],
  });

  const [calculatedDueDate, setCalculatedDueDate] = useState('');

  useEffect(() => {
    loadCases();
    loadHolidays();
  }, []);

  useEffect(() => {
    if (formData.start_date && formData.business_days > 0 && holidays.length > 0) {
      const startDate = new Date(formData.start_date);
      const dueDate = addBusinessDays(startDate, formData.business_days, holidays);
      setCalculatedDueDate(dueDate.toISOString().split('T')[0]);
    }
  }, [formData.start_date, formData.business_days, holidays]);

  const loadCases = async () => {
    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setCases(data);
      if (data.length > 0 && !formData.case_id) {
        setFormData((prev) => ({ ...prev, case_id: data[0].id }));
      }
    }
  };

  const loadHolidays = async () => {
    const { data } = await supabase
      .from('holidays')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user!.id}`);

    if (data) {
      setHolidays(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!calculatedDueDate) {
      setError('No se pudo calcular la fecha de vencimiento');
      setLoading(false);
      return;
    }

    const { data: deadline, error: deadlineError } = await supabase
      .from('deadlines')
      .insert({
        case_id: formData.case_id,
        user_id: user!.id,
        title: formData.title,
        deadline_type: formData.deadline_type,
        start_date: formData.start_date,
        business_days: formData.business_days,
        due_date: calculatedDueDate,
        notes: formData.notes,
      })
      .select()
      .single();

    if (deadlineError) {
      setError('Error al crear el plazo. Por favor, intenta nuevamente.');
      setLoading(false);
      return;
    }

    const reminders = formData.reminder_days.map((days) => {
      const dueDate = new Date(calculatedDueDate);
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - days);

      return {
        deadline_id: deadline.id,
        user_id: user!.id,
        days_before: days,
        reminder_date: reminderDate.toISOString().split('T')[0],
      };
    });

    const { error: remindersError } = await supabase.from('reminders').insert(reminders);

    if (remindersError) {
      setError('Plazo creado pero error al configurar recordatorios.');
      setLoading(false);
      return;
    }

    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-xl shadow-lg z-50';
    successMessage.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <p class="font-semibold">Plazo creado exitosamente</p>
          <p class="text-sm">${formData.title} - Vence el ${new Date(calculatedDueDate).toLocaleDateString('es-CL')}</p>
          <p class="text-xs mt-1">Se han configurado ${formData.reminder_days.length} recordatorios</p>
        </div>
      </div>
    `;
    document.body.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 5000);

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Nuevo Plazo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {cases.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              Primero debes crear una causa antes de agregar plazos.
            </div>
          )}

          <div>
            <label htmlFor="case_id" className="block text-sm font-medium text-gray-700 mb-1">
              Causa *
            </label>
            <select
              id="case_id"
              value={formData.case_id}
              onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.case_name} - {caseItem.case_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título del Plazo *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Presentación de contestación"
            />
          </div>

          <div>
            <label htmlFor="deadline_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Plazo *
            </label>
            <select
              id="deadline_type"
              value={formData.deadline_type}
              onChange={(e) => setFormData({ ...formData, deadline_type: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="filing">Presentación de Escritos</option>
              <option value="hearing">Audiencia</option>
              <option value="response">Contestación</option>
              <option value="appeal">Apelación</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="business_days" className="block text-sm font-medium text-gray-700 mb-1">
                Días Hábiles *
                <span className="ml-2 text-xs text-gray-500 font-normal">(excluye fines de semana y feriados)</span>
              </label>
              <input
                id="business_days"
                type="number"
                min="1"
                value={formData.business_days}
                onChange={(e) => setFormData({ ...formData, business_days: parseInt(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Ayuda:</span> LEXTIME calculará automáticamente la fecha de vencimiento considerando solo días hábiles y feriados chilenos.
            </p>
          </div>

          {calculatedDueDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                Fecha de Vencimiento Calculada:
              </p>
              <p className="text-lg font-bold text-blue-700 mt-1">
                {new Date(calculatedDueDate).toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recordatorios (días antes del vencimiento)
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 3, 5, 7, 10, 15].map((days) => (
                <label key={days} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.reminder_days.includes(days)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          reminder_days: [...formData.reminder_days, days].sort((a, b) => b - a),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          reminder_days: formData.reminder_days.filter((d) => d !== days),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{days} días</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles adicionales del plazo..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || cases.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Crear Plazo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
