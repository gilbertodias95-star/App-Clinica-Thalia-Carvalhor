import React from 'react';
import { Star, Award, ShieldCheck, Heart } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const SpecialistsSection: React.FC = () => {
  const { specialists } = useClinic();

  const scrollToBooking = () => {
    const el = document.getElementById('agendamento-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="especialistas" className="py-16 sm:py-20 bg-[#FAF6F4] border-t border-[#DFD5C6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#A0283E] mb-2">
            <span>Corpo Clínico & Especialistas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#27040B] tracking-tight">
            Mãos experientes dedicadas a você
          </h2>
          <p className="text-sm text-[#582D35] mt-2">
            Profissionais certificadas, com atendimento humanizado na Clínica Thalia Carvalho em Jandira - SP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {specialists.map((specialist) => {
            const isThalia = specialist.id === 'spec-thalia';
            return (
              <div
                key={specialist.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between border ${
                  isThalia ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-md' : 'border-[#D4AF37]/70 ring-2 ring-[#D4AF37]/25 shadow-md'
                }`}
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#2C060D]">
                    <img
                      src={specialist.avatar}
                      alt={specialist.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#27040B]/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 bg-[#2C060D]/90 backdrop-blur-xs rounded-lg border border-[#D4AF37]/50 text-[#F8E7C0]">
                        {specialist.role}
                      </span>
                      {isThalia ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#D4AF37] text-[#24040A] rounded-md shadow-xs">
                          Fundadora & Responsável Técnica
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B8922C] text-[#24040A] rounded-md shadow-xs">
                          Biomédica Esteta
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-serif font-semibold text-[#27040B]">
                      {specialist.name}
                    </h3>
                    <p className="text-xs text-[#582D35] leading-relaxed">
                      {specialist.bio}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {specialist.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-[#73323E] bg-[#FAF2F4] px-2.5 py-1 rounded-lg border border-[#DFD5C6] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={scrollToBooking}
                    className="w-full py-2.5 bg-gradient-to-r from-[#2C060D] to-[#4A0E17] hover:brightness-110 text-[#F8E7C0] text-xs font-semibold rounded-xl transition-all cursor-pointer border border-[#D4AF37]/30 shadow-xs"
                  >
                    Agendar com {specialist.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
