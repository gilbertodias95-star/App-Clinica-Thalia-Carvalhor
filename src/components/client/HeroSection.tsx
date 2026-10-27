import React from 'react';
import { Sparkles, MapPin, Clock, Star, Phone, ArrowDown } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const HeroSection: React.FC = () => {
  const { settings } = useClinic();

  const scrollToBooking = () => {
    const el = document.getElementById('agendamento-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-8 pb-16 lg:py-20 border-b border-[#E8DEC8]/60">
      {/* Background aesthetic glow */}
      <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-[#EBD8C1]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#E2D2C0]/25 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Brand Headline & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Quiet kicker with typographic dot separator */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#73323E]">
              <span className="text-[#A0283E] font-bold">Jandira · Jardim Lindomar</span>
              <span aria-hidden="true">·</span>
              <span>Estética Avançada & Regenerativa</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700">Lembrete WhatsApp 24h</span>
            </div>

            {/* Main Required Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-[#27040B] leading-[1.12] tracking-tight text-balance">
              Beleza que transforma.
            </h1>

            {/* Main Required Subheadline */}
            <p className="text-lg sm:text-xl text-[#582D35] font-light leading-relaxed max-w-2xl text-balance">
              Agende seu horário com as melhores especialistas de São Paulo e região na{' '}
              <strong className="font-semibold text-[#27040B]">Clínica Thalia Carvalho</strong>. Procedimentos avançados para realçar sua harmonia e autoestima.
            </p>

            {/* Proof Points & Location strip */}
            <div className="pt-2 pb-1 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-[#6B3F48]">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-[#A0283E] shrink-0" />
                <span>Rua Nicolau Maevsky 329 · Jardim Lindomar, Jandira - SP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Seg a Sáb · 08:30 às 19:30</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>4.9 / 5.0 (Mais de 1.400 clientes atendidas)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={scrollToBooking}
                className="px-7 py-3.5 bg-gradient-to-r from-[#2C060D] via-[#4A0E17] to-[#2C060D] hover:from-[#3D0B12] hover:to-[#5E121E] text-[#FDF9F0] text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer border border-[#D4AF37]/40"
              >
                <span>Agendar Meu Horário</span>
                <ArrowDown className="w-4 h-4 text-[#D4AF37] group-hover:translate-y-0.5 transition-transform" />
              </button>

              <a
                href={`https://wa.me/${settings.phoneWhatsapp.replace(/\D/g, '')}?text=Olá%20Thalia!%20Gostaria%20de%20mais%20informações%20sobre%20os%20procedimentos.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-white hover:bg-[#FAF2F4] text-[#27040B] text-sm font-semibold rounded-xl border border-[#D4AF37]/40 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp (11) 97833-8257</span>
              </a>
            </div>

            {/* Quick benefits highlight */}
            <div className="pt-6 border-t border-[#E5CAD0] grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <span className="block text-xl sm:text-2xl font-serif font-semibold text-[#27040B] tabular-nums">
                  +2 Anos
                </span>
                <span className="block text-xs text-[#73323E] mt-0.5 font-medium">
                  Há mais de 2 anos transformando autoestima
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-serif font-semibold text-[#27040B] tabular-nums">
                  24h Antes
                </span>
                <span className="block text-xs text-[#73323E] mt-0.5 font-medium">
                  Lembrete no WhatsApp
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-serif font-semibold text-[#27040B] tabular-nums">
                  100%
                </span>
                <span className="block text-xs text-[#73323E] mt-0.5 font-medium">
                  Biossegurança & Conforto
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Photography Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 bg-[#27040B] aspect-[4/3] lg:aspect-[5/6] max-w-lg mx-auto ring-4 ring-[#2C060D]/20">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-26_at_20.25.16_b01a5f95.jpeg"
                alt="Thalia Carvalho - Fundadora & Especialista Master em Estética Avançada em Jandira SP"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#27040B]/90 via-[#27040B]/20 to-transparent" />

              {/* Floating Specialist Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#2C060D]/95 backdrop-blur-md rounded-2xl border border-[#D4AF37]/50 shadow-2xl flex items-center gap-3.5">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-10-22_at_19.04.15_85f3d573.jpeg"
                  alt="Logo Clínica Thalia Carvalho"
                  loading="eager"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shrink-0 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-[#F8E7C0] truncate">
                    Clínica Thalia Carvalho
                  </h4>
                  <p className="text-xs text-[#D8B4B8] truncate">
                    Estética Avançada & Regenerativa · Jandira SP
                  </p>
                </div>
                <button
                  onClick={scrollToBooking}
                  className="px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8922C] text-[#24040A] rounded-xl hover:brightness-110 transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
