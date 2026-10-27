import React from 'react';
import { Calendar, MessageCircle, Sparkles, MapPin, LayoutDashboard } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const MobileBottomNav: React.FC = () => {
  const { currentMode, setMode, settings, financialMetrics } = useClinic();

  const scrollToSection = (id: string) => {
    if (currentMode !== 'client') {
      setMode('client');
      // small delay to allow render
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const whatsappUrl = `https://wa.me/${settings.phoneWhatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20agendar%20um%20horário%20na%20Clínica%20Thalia%20Carvalho!`;

  return (
    <nav
      aria-label="Navegação Rápida Mobile"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#27040B]/95 backdrop-blur-md border-t border-[#D4AF37]/40 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] px-2 py-1.5 transition-all"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-5 items-center justify-around gap-1 max-w-md mx-auto">
        {/* Button 1: Serviços */}
        <button
          onClick={() => scrollToSection('servicos')}
          className="flex flex-col items-center justify-center py-1 px-1 text-center group cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#D8B4B8] group-hover:text-[#F8E7C0] transition-colors">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="text-[10px] font-medium text-[#E5D2D5] group-hover:text-white leading-tight">
            Serviços
          </span>
        </button>

        {/* Button 2: WhatsApp Direto */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-1 text-center group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-emerald-400 leading-tight">
            WhatsApp
          </span>
        </a>

        {/* Button 3: Main Action - AGENDAR (Prominent central pill button) */}
        <button
          onClick={() => scrollToSection('agendamento-section')}
          className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F8E7C0] to-[#B8922C] text-[#24040A] flex items-center justify-center shadow-lg ring-3 ring-[#27040B] transform group-active:scale-95 transition-transform">
            <Calendar className="w-5 h-5 font-bold" />
          </div>
          <span className="text-[10px] font-bold text-[#F8E7C0] mt-0.5 leading-tight">
            Agendar
          </span>
        </button>

        {/* Button 4: Como Chegar / Localização */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=Rua+Nicolau+Maevsky+329+Jardim+Lindomar+Jandira+SP"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-1 text-center group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#D8B4B8] group-hover:text-[#F8E7C0] transition-colors">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="text-[10px] font-medium text-[#E5D2D5] group-hover:text-white leading-tight">
            Chegar
          </span>
        </a>

        {/* Button 5: Gestão / Painel */}
        <button
          onClick={() => {
            setMode(currentMode === 'admin' ? 'client' : 'admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 px-1 text-center group cursor-pointer focus:outline-none relative"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#D8B4B8] group-hover:text-white transition-colors relative">
            <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
            {financialMetrics.pendingRemindersCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#27040B] animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-medium text-[#E5D2D5] group-hover:text-white leading-tight">
            {currentMode === 'admin' ? 'Ver Site' : 'Painel'}
          </span>
        </button>
      </div>
    </nav>
  );
};
