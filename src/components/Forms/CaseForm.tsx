import { useState } from 'react';
import { X, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export function CaseForm({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    case_number: '',
    case_name: '',
    court: '',
    client_name: '',
    description: '',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.from('cases').insert({
      ...formData,
      user_id: user!.id,
    });

    if (error) {
      setError('Error al crear la causa. Por favor, intenta nuevamente.');
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
          <p class="font-semibold">Causa creada exitosamente</p>
          <p class="text-sm">${formData.case_name} ha sido guardada</p>
        </div>
      </div>
    `;
    document.body.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 4000);

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Nueva Causa</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="case_number" className="block text-sm font-medium text-gray-700 mb-1">
                Rol / Número de Causa *
              </label>
              <input
                id="case_number"
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="C-123-2025"
              />
            </div>

            <div>
              <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <input
                id="client_name"
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del cliente"
              />
            </div>
          </div>

          <div>
            <label htmlFor="case_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Causa *
            </label>
            <input
              id="case_name"
              type="text"
              value={formData.case_name}
              onChange={(e) => setFormData({ ...formData, case_name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juicio de Cobro"
            />
          </div>

          <div>
            <label htmlFor="court" className="block text-sm font-medium text-gray-700 mb-1">
              Tribunal *
            </label>
            <input
              id="court"
              type="text"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juzgado Civil de Santiago"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles adicionales de la causa..."
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Crear Causa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
