import React from 'react';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Clock,
  RotateCcw,
  ArrowLeft,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminCalendar } from './AdminCalendar';
import { AdminServices } from './AdminServices';
import { AdminScheduleSettings } from './AdminScheduleSettings';
import { AdminReminders } from './AdminReminders';

export const AdminLayout: React.FC = () => {
  const { adminSection, setAdminSection, setMode, resetToDefaults, financialMetrics } = useClinic();

  const handleReset = () => {
    if (confirm('Deseja restaurar os dados iniciais de demonstração da clínica?')) {
      resetToDefaults();
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Financeiro',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'reminders',
      label: 'Lembretes WhatsApp 24h',
      icon: Bell,
      badge: financialMetrics.pendingRemindersCount > 0 ? `${financialMetrics.pendingRemindersCount} pendentes` : null,
    },
    {
      id: 'calendar',
      label: 'Agenda Visual',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'services',
      label: 'Serviços & Preços',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'schedule',
      label: 'Horários & Intervalos',
      icon: Clock,
      badge: null,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAF6F4]">
      {/* Admin Subheader Bar */}
      <div className="bg-[#24040A] text-white border-b border-[#D4AF37]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode('client')}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Site do Cliente</span>
            </button>
            <span className="text-white/30 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-22_at_19.04.15_85f3d573.jpeg"
                alt="Logo"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#D4AF37]"
              />
              <span className="text-[#F8E7C0] font-serif font-semibold text-sm">
                Clínica Thalia Carvalho · Jandira SP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#D8B4B8]">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp de Disparo: <strong>5511978338257</strong></span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Restaura os serviços e agendamentos padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Demonstração</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs (Functional Button Segmented Control) */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#2C060D] text-[#F8E7C0] ring-2 ring-[#D4AF37]/50 shadow-md'
                    : 'bg-white text-[#73323E] border border-[#DFD5C6] hover:bg-[#FAF2F4] hover:text-[#27040B]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#D4AF37]' : 'text-[#A0283E]'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {adminSection === 'dashboard' && <AdminDashboard />}
        {adminSection === 'reminders' && <AdminReminders />}
        {adminSection === 'calendar' && <AdminCalendar />}
        {adminSection === 'services' && <AdminServices />}
        {adminSection === 'schedule' && <AdminScheduleSettings />}
      </div>
    </div>
  );
};
