import React, { useState } from 'react';
import {
  Bell,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Sliders,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import {
  formatCurrency,
  formatDuration,
  formatFriendlyDate,
  generate24hReminderWhatsAppLink,
  isAppointmentDueFor24hReminder,
} from '../../utils/bookingUtils';

export const AdminReminders: React.FC = () => {
  const {
    appointments,
    settings,
    send24hReminder,
    sendAllPending24hReminders,
    updateSettings,
  } = useClinic();

  const [testNotice, setTestNotice] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'pending' | 'sent' | 'all'>('pending');

  // Appointments due within 24h
  const pendingReminders = appointments.filter(isAppointmentDueFor24hReminder);
  const sentReminders = appointments.filter((a) => a.reminderSent24h);

  const displayedList = appointments.filter((a) => {
    if (a.status === 'cancelled') return false;
    if (filterMode === 'pending') return isAppointmentDueFor24hReminder(a);
    if (filterMode === 'sent') return a.reminderSent24h;
    return isAppointmentDueFor24hReminder(a) || a.reminderSent24h;
  });

  const handleSendSingle = (appointmentId: string) => {
    send24hReminder(appointmentId, true);
    setTestNotice('Lembrete de 24h preparado e aberto no WhatsApp com sucesso!');
    setTimeout(() => setTestNotice(''), 4000);
  };

  const handleSendAll = () => {
    const total = sendAllPending24hReminders();
    if (total > 0) {
      setTestNotice(`${total} lembrete(s) de 24 horas disparados com sucesso!`);
      setTimeout(() => setTestNotice(''), 4500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DEC8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A0283E]">
              Automação WhatsApp · 24 Horas Antes
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#27040B]">
            Envio Automático de Lembretes de Agendamento
          </h2>
          <p className="text-xs text-[#73323E]">
            Lembretes enviados 24 horas antes do horário agendado com detalhes do serviço, data, hora e endereço.
          </p>
        </div>

        {/* Central Sender Badge */}
        <div className="bg-[#2C060D] text-white p-3 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#D8B4B8] block uppercase tracking-wider">
              Número de Envio Oficial:
            </span>
            <span className="font-mono text-sm font-bold text-[#F8E7C0]">
              5511978338257
            </span>
          </div>
        </div>
      </div>

      {testNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testNotice}</span>
        </div>
      )}

      {/* Configuration & Rule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#DFD5C6] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-semibold text-[#27040B]">
                Regra de Envio Automático (24 Horas Antes)
              </h3>
              <p className="text-xs text-[#73323E]">
                Configuração ativa para todas as clientes da Clínica Thalia Carvalho.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ativo</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 bg-[#FAF2F4] rounded-2xl border border-[#DFD5C6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#27040B] block">
                  Antecedência do Disparo:
                </span>
                <span className="text-[#73323E]">
                  Envia automaticamente exatamente 24 horas antes do início do procedimento.
                </span>
              </div>
              <span className="font-mono font-bold text-sm text-[#A0283E]">
                24h antes
              </span>
            </div>

            <div className="p-3.5 bg-[#FAF2F4] rounded-2xl border border-[#DFD5C6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#27040B] block">
                  Número de Contato Configurado:
                </span>
                <span className="text-[#73323E]">
                  Telefone oficial configurado para envio e recebimento de confirmações.
                </span>
              </div>
              <span className="font-mono font-bold text-sm text-[#27040B]">
                5511978338257
              </span>
            </div>

            <div className="p-3.5 bg-[#FAF2F4] rounded-2xl border border-[#DFD5C6] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#27040B] block">
                  Endereço do Procedimento Incluído no Lembrete:
                </span>
                <span className="text-[#73323E]">
                  Localização exata da clínica para a cliente navegar com facilidade.
                </span>
              </div>
              <span className="font-medium text-xs text-[#27040B] text-right max-w-[200px]">
                Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Message Preview Box */}
        <div className="lg:col-span-5 bg-[#2C060D] text-white p-6 rounded-3xl border border-[#D4AF37]/50 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                Modelo da Mensagem WhatsApp
              </span>
              <span className="text-[10px] text-white/60">Disparo Oficial</span>
            </div>

            <div className="mt-3 p-4 bg-white/10 rounded-2xl border border-white/10 text-xs space-y-2 font-sans leading-relaxed text-[#FDF9F0]">
              <p className="font-semibold text-[#F8E7C0]">
                🌸 *LEMBRETE DE AGENDAMENTO (24H ANTES) - CLÍNICA THALIA CARVALHO* 🌸
              </p>
              <p>
                Olá, *[Nome da Cliente]*! Tudo bem? Passando para lembrar com muito carinho do seu procedimento agendado para amanhã:
              </p>
              <div className="space-y-0.5 text-[11px] text-[#F3E5AB]">
                <p>💆‍♀️ *Procedimento:* [Nome do Serviço]</p>
                <p>🗓️ *Data:* [Data Formatada - Amanhã]</p>
                <p>⏰ *Horário:* [Hora Início] às [Hora Término]</p>
                <p>👩‍⚕️ *Especialista:* [Thalia Carvalho]</p>
                <p>📍 *Local:* Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP</p>
                <p>💰 *Valor:* [R$ Total]</p>
              </div>
              <p className="text-[11px] text-white/80 pt-1">
                👉 Responda 1 para CONFIRMAR ou 2 para REAGENDAR.
              </p>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#D8B4B8] flex items-center justify-between">
            <span>Inclui todos os detalhes requeridos</span>
            <span className="text-[#D4AF37] font-semibold">100% Personalizado</span>
          </div>
        </div>
      </div>

      {/* Queue & Dispatch List */}
      <div className="bg-white p-6 rounded-3xl border border-[#DFD5C6] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif font-semibold text-[#27040B]">
              Fila de Lembretes para os Próximos Agendamentos
            </h3>
            <p className="text-xs text-[#73323E]">
              Clientes com horário marcado nas próximas 24 horas e histórico de envios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#FAF2F4] p-1 rounded-xl border border-[#DFD5C6] text-xs">
              <button
                onClick={() => setFilterMode('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'pending'
                    ? 'bg-[#2C060D] text-white shadow-xs'
                    : 'text-[#73323E] hover:text-[#27040B]'
                }`}
              >
                Pendentes 24h ({pendingReminders.length})
              </button>
              <button
                onClick={() => setFilterMode('sent')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'sent'
                    ? 'bg-[#2C060D] text-white shadow-xs'
                    : 'text-[#73323E] hover:text-[#27040B]'
                }`}
              >
                Enviados ({sentReminders.length})
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#2C060D] text-white shadow-xs'
                    : 'text-[#73323E] hover:text-[#27040B]'
                }`}
              >
                Todos
              </button>
            </div>

            {/* Batch Send button */}
            {pendingReminders.length > 0 && (
              <button
                onClick={handleSendAll}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Todos ({pendingReminders.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* List of items */}
        {displayedList.length > 0 ? (
          <div className="divide-y divide-[#F3EDE4]">
            {displayedList.map((apt) => {
              const isSent = apt.reminderSent24h;
              return (
                <div
                  key={apt.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="px-3 py-2 bg-[#2C060D] text-white rounded-xl text-center shrink-0">
                      <span className="block font-bold text-xs text-[#F8E7C0] tabular-nums">
                        {apt.startTime}
                      </span>
                      <span className="block text-[10px] text-[#D8B4B8]">
                        {apt.date.slice(5)}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#27040B] truncate">
                          {apt.clientName}
                        </span>
                        <span className="text-[10px] font-mono text-[#A0283E]">
                          #{apt.code}
                        </span>
                        {isSent ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lembrete 24h Enviado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-[10px] font-semibold">
                            ⏰ Aguardando Disparo (24h antes)
                          </span>
                        )}
                      </div>

                      <p className="text-[#582D35] font-medium">
                        {apt.services.map((s) => s.name).join(' + ')} ·{' '}
                        <strong className="text-[#27040B]">{formatDuration(apt.totalMinutes)}</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 text-[#73323E] text-[11px]">
                        <span>Data: {formatFriendlyDate(apt.date)}</span>
                        <span>·</span>
                        <span>Especialista: {apt.specialistName}</span>
                        <span>·</span>
                        <span>WhatsApp: {apt.clientPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F3EDE4]">
                    <span className="text-base font-bold text-[#27040B] tabular-nums">
                      {formatCurrency(apt.totalPrice)}
                    </span>

                    <button
                      onClick={() => handleSendSingle(apt.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSent
                          ? 'bg-[#FAF2F4] text-[#73323E] border border-[#DFD5C6] hover:bg-[#F3EDE4]'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isSent ? 'Reenviar WhatsApp' : 'Enviar Lembrete Agora'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD5C6] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-semibold text-[#27040B]">
              Nenhum lembrete pendente no momento
            </h4>
            <p className="text-xs text-[#73323E] max-w-sm mx-auto">
              Todas as clientes com procedimentos agendados para as próximas 24 horas já foram notificadas com os detalhes completos do serviço.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
