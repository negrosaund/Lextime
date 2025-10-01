import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase, Case, Deadline } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { Stats } from '../components/Dashboard/Stats';
import { UpcomingDeadlines } from '../components/Dashboard/UpcomingDeadlines';
import { CasesList } from '../components/Dashboard/CasesList';
import { CaseForm } from '../components/Forms/CaseForm';
import { DeadlineForm } from '../components/Forms/DeadlineForm';
import { WelcomeTutorial } from '../components/Onboarding/WelcomeTutorial';
import { QuickStartGuide } from '../components/Onboarding/QuickStartGuide';
import { getDaysUntil } from '../utils/dateCalculations';

type DeadlineWithCase = Deadline & {
  case: Case;
};

export function Dashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineWithCase[]>([]);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);

  useEffect(() => {
    loadData();
    const hasSeenTutorial = localStorage.getItem('lextime_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    if (cases.length === 0 && deadlines.length === 0 && !showTutorial) {
      setShowQuickStart(true);
    }
  }, [cases, deadlines, showTutorial]);

  const loadData = async () => {
    const { data: casesData } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (casesData) {
      setCases(casesData);
    }

    const { data: deadlinesData } = await supabase
      .from('deadlines')
      .select(`
        *,
        case:cases(*)
      `)
      .eq('user_id', user!.id)
      .eq('is_completed', false)
      .order('due_date', { ascending: true });

    if (deadlinesData) {
      setDeadlines(deadlinesData as any);
    }
  };

  const handleCompleteTutorial = () => {
    localStorage.setItem('lextime_tutorial_seen', 'true');
    setShowTutorial(false);
    if (cases.length === 0 && deadlines.length === 0) {
      setShowQuickStart(true);
    }
  };

  const handleCompleteDeadline = async (deadlineId: string) => {
    const deadline = deadlines.find(d => d.id === deadlineId);
    if (!deadline) return;

    const { error } = await supabase
      .from('deadlines')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', deadlineId);

    if (!error) {
      loadData();

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-xl shadow-lg z-50';
      successMessage.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="font-semibold">Plazo completado</p>
            <p class="text-sm">${deadline.title} marcado como completado</p>
          </div>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 4000);
    }
  };

  const activeDeadlines = deadlines.filter(d => !d.is_completed);
  const urgentDeadlines = activeDeadlines.filter(d => getDaysUntil(d.due_date) <= 7);
  const completedThisMonth = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h2>
          <p className="text-gray-600">Gestiona tus causas y plazos legales con confianza</p>
        </div>

        {showQuickStart && (
          <QuickStartGuide
            onClose={() => setShowQuickStart(false)}
            onCreateCase={() => {
              setShowQuickStart(false);
              setShowCaseForm(true);
            }}
            onCreateDeadline={() => {
              setShowQuickStart(false);
              setShowDeadlineForm(true);
            }}
          />
        )}

        <Stats
          totalCases={cases.length}
          activeDeadlines={activeDeadlines.length}
          urgentDeadlines={urgentDeadlines.length}
          completedThisMonth={completedThisMonth}
        />

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeadlineForm(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Plazo</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UpcomingDeadlines
            deadlines={activeDeadlines.slice(0, 10)}
            onComplete={handleCompleteDeadline}
          />

          <CasesList
            cases={cases}
            onNewCase={() => setShowCaseForm(true)}
          />
        </div>
      </main>

      {showCaseForm && (
        <CaseForm
          onClose={() => setShowCaseForm(false)}
          onSuccess={() => {
            setShowCaseForm(false);
            loadData();
          }}
        />
      )}

      {showDeadlineForm && (
        <DeadlineForm
          onClose={() => setShowDeadlineForm(false)}
          onSuccess={() => {
            setShowDeadlineForm(false);
            loadData();
          }}
        />
      )}

      {showTutorial && (
        <WelcomeTutorial onComplete={handleCompleteTutorial} />
      )}
    </div>
  );
}
