import React from 'react';
import { MapPin, Phone, Instagram, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const Footer: React.FC = () => {
  const { settings, setMode, setAdminSection } = useClinic();

  return (
    <footer className="bg-[#1C0206] text-[#EFE9DF] pt-16 pb-12 border-t border-[#D4AF37]/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10 text-xs">
          {/* Brand info with Logo */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-22_at_19.04.15_85f3d573.jpeg"
                alt="Logo Clínica Thalia Carvalho"
                loading="lazy"
                decoding="async"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#D4AF37] shadow-lg shrink-0"
              />
              <div>
                <span className="block font-serif text-xl font-bold tracking-wide text-[#F8E7C0]">
                  Clínica Thalia Carvalho
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] block font-semibold">
                  Estética Avançada & Regenerativa
                </span>
              </div>
            </div>
            <p className="text-[#D8B4B8] leading-relaxed">
              Beleza que transforma. Atendimento exclusivo e procedimentos regenerativos em Jandira e Grande São Paulo.
            </p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${settings.phoneWhatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:text-white transition-colors font-semibold"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: (11) 97833-8257</span>
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h4 className="text-[#F8E7C0] font-semibold uppercase tracking-wider text-[11px]">
              Endereço Oficial
            </h4>
            <div className="flex items-start gap-2 text-[#E5D2D5]">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-white">
                  Rua Nicolau Maevsky, 329
                </span>
                <span className="text-[11px] text-[#D8B4B8] block">
                  Jardim Lindomar · Jandira - SP
                </span>
                <span className="text-[10px] text-[#A68087] block">
                  CEP 06618-000 (Fácil acesso e estacionamento no local)
                </span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rua+Nicolau+Maevsky+329+Jardim+Lindomar+Jandira+SP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-[#D4AF37] hover:underline pt-1 font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Abrir no Google Maps</span>
            </a>
          </div>

          {/* Horários */}
          <div className="space-y-3">
            <h4 className="text-[#F8E7C0] font-semibold uppercase tracking-wider text-[11px]">
              Horário de Atendimento
            </h4>
            <div className="space-y-1.5 text-[#D8B4B8]">
              <div className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span className="text-white font-mono font-medium">08:30 às 19:30</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado:</span>
                <span className="text-white font-mono font-medium">08:30 às 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo:</span>
                <span className="text-[#A68087]">Fechado</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Lembretes via WhatsApp 24h antes ativados</span>
            </div>
          </div>

          {/* Quick links & Admin access */}
          <div className="space-y-3">
            <h4 className="text-[#F8E7C0] font-semibold uppercase tracking-wider text-[11px]">
              Gestão & Navegação
            </h4>
            <ul className="space-y-2 text-[#D8B4B8]">
              <li>
                <button
                  onClick={() => {
                    setMode('client');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Agendamento Online de Horário
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMode('admin');
                    setAdminSection('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer font-semibold text-white flex items-center gap-1"
                >
                  <span>Dashboard Financeiro</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMode('admin');
                    setAdminSection('reminders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Disparo de Lembretes WhatsApp (24h)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMode('admin');
                    setAdminSection('calendar');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Agenda Visual de Atendimentos
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A68087]">
          <p>© {new Date().getFullYear()} Clínica Thalia Carvalho · Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira SP</span>
            <span>CNPJ: 45.182.902/0001-38</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
