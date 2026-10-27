import React from 'react';
import { Calendar, LayoutDashboard, Sparkles } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const Header: React.FC = () => {
  const {
    currentMode,
    setMode,
    appointments,
    settings,
    financialMetrics,
  } = useClinic();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(
    (a) => a.date === todayStr && a.status !== 'cancelled'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-[#27040B]/98 text-white backdrop-blur-md border-b border-[#D4AF37]/30 transition-colors shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand with Image Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMode('client')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg p-1"
          >
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-22_at_19.04.15_85f3d573.jpeg"
              alt="Logo Clínica Thalia Carvalho"
              loading="eager"
              decoding="async"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D4AF37] shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="min-w-0">
              <span className="block text-xl sm:text-2xl font-serif font-semibold tracking-wide text-[#F8E7C0] group-hover:text-white transition-colors whitespace-nowrap">
                Clínica Thalia Carvalho
              </span>
              <span className="block text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.22em] text-[#D4AF37] font-medium -mt-0.5">
                Estética Avançada & Regenerativa
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-[#E5D2D5]">
          <button
            onClick={() => {
              setMode('client');
              const el = document.getElementById('servicos');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#F8E7C0] transition-colors whitespace-nowrap cursor-pointer"
          >
            Serviços & Preços
          </button>
          <button
            onClick={() => {
              setMode('client');
              const el = document.getElementById('especialistas');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#F8E7C0] transition-colors whitespace-nowrap cursor-pointer"
          >
            Especialistas
          </button>
          <button
            onClick={() => {
              setMode('client');
              const el = document.getElementById('espaco');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#F8E7C0] transition-colors whitespace-nowrap cursor-pointer"
          >
            A Clínica (Jandira)
          </button>
          <a
            href={`https://wa.me/${settings.phoneWhatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida!`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F8E7C0] transition-colors whitespace-nowrap text-[#D4AF37]"
          >
            WhatsApp (11) 97833-8257
          </a>
        </nav>

        {/* Zone 3: Primary Action & Role Switch */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Switch Mode: Client Agendamento vs Admin Gestão */}
          <div className="flex items-center bg-[#170104] p-1 rounded-xl border border-[#D4AF37]/40 shadow-inner">
            <button
              onClick={() => setMode('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentMode === 'client'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8922C] text-[#24040A] font-bold shadow-sm'
                  : 'text-[#D0BAC0] hover:text-white'
              }`}
              title="Visão do Cliente para agendar horários"
            >
              <Calendar className="w-3.5 h-3.5 text-current" />
              <span className="hidden sm:inline">Agendar</span>
              <span className="sm:hidden">Cliente</span>
            </button>

            <button
              onClick={() => setMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentMode === 'admin'
                  ? 'bg-[#4A0E17] text-white shadow-sm font-bold border border-[#D4AF37]/50'
                  : 'text-[#D0BAC0] hover:text-white'
              }`}
              title="Painel de controle com Dashboard Financeiro e Lembretes WhatsApp 24h"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Painel</span>
              {financialMetrics.pendingRemindersCount > 0 ? (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] rounded-full font-bold animate-pulse">
                  {financialMetrics.pendingRemindersCount} lembretes
                </span>
              ) : todayAppointmentsCount > 0 ? (
                <span className="ml-1 px-1.5 py-0.2 bg-[#D4AF37] text-[#24040A] text-[10px] rounded-full font-bold">
                  {todayAppointmentsCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
