import React from 'react';
import { Sparkles, Shield, Heart, Coffee, Wifi, Car } from 'lucide-react';

export const ClinicAtmosphere: React.FC = () => {
  return (
    <section id="espaco" className="py-16 sm:py-20 bg-[#F5EFE6] border-t border-[#E8DEC8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image side */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#DFD5C6] aspect-[4/3] bg-[#EFE9DF]">
              <img
                src="/src/assets/images/beauty_treatment_session_1793055402989.jpg"
                alt="Sessão de estética facial e visagismo na Clínica Thalia Carvalho"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                <span className="font-semibold block text-sm">
                  Atendimento Calmo & Reservado
                </span>
                <span className="opacity-90">
                  Cabines individuais climatizadas e biossegurança de nível hospitalar.
                </span>
              </div>
            </div>
          </div>

          {/* Copy & Amenities */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#A0283E]">
              <span>O Espaço em Jandira - SP</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#27040B] tracking-tight">
              Um refúgio de acolhimento no Jardim Lindomar
            </h2>

            <p className="text-sm sm:text-base text-[#582D35] leading-relaxed">
              Desenvolvemos cada detalhe da Clínica Thalia Carvalho na <strong>Rua Nicolau Maevsky 329</strong> para ser uma experiência restauradora e única. Aqui você desfruta de aromaterapia exclusiva, café especial e protocolos estéticos regenerativos de última geração.
            </p>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-[#27040B]">
              <div className="p-3 bg-white rounded-xl border border-[#DFD5C6] flex items-center gap-2.5">
                <Coffee className="w-4 h-4 text-[#A0283E] shrink-0" />
                <span>Café Gourmet & Chás Calmantes</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#DFD5C6] flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-[#A0283E] shrink-0" />
                <span>Wi-Fi de Alta Velocidade</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#DFD5C6] flex items-center gap-2.5">
                <Car className="w-4 h-4 text-[#A0283E] shrink-0" />
                <span>Estacionamento Fácil no Local</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#DFD5C6] flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#A0283E] shrink-0" />
                <span>Esterilização & Biossegurança</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
