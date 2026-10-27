import React, { useState } from 'react';
import { Clock, Coffee, Save, CheckCircle2, Phone, MapPin, Sliders } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const AdminScheduleSettings: React.FC = () => {
  const { schedule, updateDaySchedule, settings, updateSettings } = useClinic();

  const [slotStep, setSlotStep] = useState<number>(settings.slotIntervalMinutes || 30);
  const [phoneWhatsapp, setPhoneWhatsapp] = useState<string>(settings.phoneWhatsapp || '5511978338257');
  const [address, setAddress] = useState<string>(settings.address || 'Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP');
  const [autoReminder24hEnabled, setAutoReminder24hEnabled] = useState<boolean>(settings.autoReminder24hEnabled ?? true);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      slotIntervalMinutes: Number(slotStep),
      phoneWhatsapp: phoneWhatsapp.trim(),
      address: address.trim(),
      autoReminder24hEnabled,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#E8DEC8]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A87B42]">
          Horários de Atendimento & Configurações
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#241D1E]">
          Definir Horários de Trabalho e Intervalos
        </h2>
        <p className="text-xs text-[#7A6A63]">
          Defina os dias da semana ativos, horários de expediente e pausas de almoço para o cálculo
          automático das vagas livres.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configurações atualizadas com sucesso! Os horários da agenda já foram recalculados.</span>
        </div>
      )}

      {/* Weekdays table */}
      <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#F3EDE4]">
          <h3 className="text-base font-serif font-semibold text-[#241D1E]">
            Dias da Semana & Intervalos de Atendimento
          </h3>
          <p className="text-xs text-[#7A6A63]">
            Ajuste a grade horária da clínica. Dias inativos não exibirão vagas no agendamento.
          </p>
        </div>

        <div className="divide-y divide-[#F3EDE4]">
          {schedule.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs transition-colors ${
                day.isOpen ? 'bg-white' : 'bg-[#FAF8F5]/60'
              }`}
            >
              {/* Day title & open switch */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) =>
                      updateDaySchedule(day.dayOfWeek, { isOpen: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#241D1E]" />
                </label>

                <div>
                  <span className="font-semibold text-sm text-[#241D1E] block">
                    {day.dayName}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      day.isOpen ? 'text-emerald-700' : 'text-[#8C7A70]'
                    }`}
                  >
                    {day.isOpen ? 'Atendimento Aberto' : 'Fechado (Folga)'}
                  </span>
                </div>
              </div>

              {/* Time inputs */}
              {day.isOpen ? (
                <div className="flex flex-wrap items-center gap-4">
                  {/* Expediente */}
                  <div className="flex items-center gap-2 bg-[#FAF8F5] p-2 rounded-xl border border-[#E8DEC8]">
                    <Clock className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span className="text-[#7A6A63]">Expediente:</span>
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) =>
                        updateDaySchedule(day.dayOfWeek, { openTime: e.target.value })
                      }
                      className="bg-white px-2 py-1 rounded-md border border-[#DFD5C6] font-mono text-xs focus:ring-1 focus:ring-[#C59B63]"
                    />
                    <span className="text-[#8C7A70]">às</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) =>
                        updateDaySchedule(day.dayOfWeek, { closeTime: e.target.value })
                      }
                      className="bg-white px-2 py-1 rounded-md border border-[#DFD5C6] font-mono text-xs focus:ring-1 focus:ring-[#C59B63]"
                    />
                  </div>

                  {/* Pausa / Almoço */}
                  <div className="flex items-center gap-2 bg-[#FAF8F5] p-2 rounded-xl border border-[#E8DEC8]">
                    <Coffee className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span className="text-[#7A6A63]">Almoço:</span>
                    <input
                      type="time"
                      value={day.lunchStart}
                      onChange={(e) =>
                        updateDaySchedule(day.dayOfWeek, { lunchStart: e.target.value })
                      }
                      className="bg-white px-2 py-1 rounded-md border border-[#DFD5C6] font-mono text-xs focus:ring-1 focus:ring-[#C59B63]"
                    />
                    <span className="text-[#8C7A70]">às</span>
                    <input
                      type="time"
                      value={day.lunchEnd}
                      onChange={(e) =>
                        updateDaySchedule(day.dayOfWeek, { lunchEnd: e.target.value })
                      }
                      className="bg-white px-2 py-1 rounded-md border border-[#DFD5C6] font-mono text-xs focus:ring-1 focus:ring-[#C59B63]"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#8C7A70] italic">
                  Nenhum horário liberado para agendamentos online.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General Settings: Interval step & WhatsApp number */}
      <div className="bg-white rounded-2xl border border-[#DFD5C6] p-6 shadow-sm">
        <h3 className="text-base font-serif font-semibold text-[#241D1E] mb-1">
          Parâmetros do Sistema & Contato
        </h3>
        <p className="text-xs text-[#7A6A63] mb-6">
          Configuração do WhatsApp oficial e intervalo de cálculo dos horários.
        </p>

        <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs max-w-xl">
          <div>
            <label className="block font-semibold text-[#241D1E] mb-1">
              WhatsApp da Clínica (Telefone para receber confirmações e lembretes) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={phoneWhatsapp}
                onChange={(e) => setPhoneWhatsapp(e.target.value)}
                placeholder="5511978338257"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63] font-mono"
              />
            </div>
            <span className="text-[11px] text-[#8C7A70] block mt-1">
              Telefone padrão solicitado: <strong>5511978338257</strong>. Mensagens do agendamento serão enviadas diretamente para este número.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-[#241D1E] mb-1">
              Intervalo de Passo dos Horários (minutos)
            </label>
            <select
              value={slotStep}
              onChange={(e) => setSlotStep(Number(e.target.value))}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
            >
              <option value={15}>A cada 15 minutos (09:00, 09:15, 09:30...)</option>
              <option value={30}>A cada 30 minutos (09:00, 09:30, 10:00... - Recomendado)</option>
              <option value={45}>A cada 45 minutos</option>
              <option value={60}>A cada 60 minutos (09:00, 10:00, 11:00...)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#27040B] mb-1">
              Endereço Físico da Clínica
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <span className="text-[11px] text-[#73323E] block mt-1">
              Endereço atualizado: <strong>Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP</strong>
            </span>
          </div>

          <div className="p-4 bg-[#FAF2F4] rounded-2xl border border-[#DFD5C6] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#27040B] block text-xs">
                Disparo Automático de Lembretes (24h Antes)
              </span>
              <span className="text-[11px] text-[#73323E]">
                Envia notificação via WhatsApp (5511978338257) com serviço, data e hora para todas as clientes.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
              <input
                type="checkbox"
                checked={autoReminder24hEnabled}
                onChange={(e) => setAutoReminder24hEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#2C060D] to-[#4A0E17] hover:brightness-110 text-[#F8E7C0] font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm border border-[#D4AF37]/40"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>Salvar Parâmetros da Clínica</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
