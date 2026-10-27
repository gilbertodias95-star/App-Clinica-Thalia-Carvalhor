import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  UserCheck,
  Phone,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Award,
  Bell,
  Sparkles,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import {
  formatCurrency,
  formatDuration,
  formatFriendlyDate,
  generateWhatsAppLink,
  generate24hReminderWhatsAppLink,
} from '../../utils/bookingUtils';

export const AdminDashboard: React.FC = () => {
  const {
    financialMetrics,
    appointments,
    completeAppointment,
    cancelAppointment,
    setAdminSection,
    settings,
    sendAllPending24hReminders,
    send24hReminder,
  } = useClinic();

  const [activeChartTab, setActiveChartTab] = useState<'recent7' | 'weekdays' | 'monthWeeks'>('recent7');
  const [reminderNotice, setReminderNotice] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  // Highest revenue in recent days for bar scale
  const maxRecentRevenue = Math.max(
    ...financialMetrics.recentDaysData.map((d) => d.revenue),
    100
  );

  const maxWeekdayRevenue = Math.max(
    ...financialMetrics.weekdaysData.map((d) => d.revenue),
    100
  );

  const maxMonthWeekRevenue = Math.max(
    ...financialMetrics.monthWeeksData.map((w) => w.revenue),
    100
  );

  const handleSendAllReminders = () => {
    const count = sendAllPending24hReminders();
    if (count > 0) {
      setReminderNotice(`${count} lembrete(s) de 24h preparados e disparados com sucesso via WhatsApp!`);
      setTimeout(() => setReminderNotice(''), 4500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Header with Brand Logo */}
      <div className="bg-[#2C060D] text-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5C101C]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative">
          <img
            src="/assets/aistudio/WhatsApp_Image_2026-10-22_at_19.04.15_85f3d573.jpeg"
            alt="Logo Thalia Carvalho"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#D4AF37] shadow-lg shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Painel Executivo & Financeiro
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#F8E7C0] tracking-tight">
              Dashboard Financeiro da Clínica
            </h2>
            <p className="text-xs text-[#D8B4B8] mt-0.5">
              Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP · WhatsApp: (11) 97833-8257
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3 relative">
          <button
            onClick={() => setAdminSection('reminders')}
            className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all border border-emerald-500/50 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Lembretes 24h</span>
            {financialMetrics.pendingRemindersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-emerald-900 text-[10px] rounded-full font-bold">
                {financialMetrics.pendingRemindersCount} pendentes
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminSection('calendar')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8922C] text-[#24040A] text-xs font-bold rounded-xl transition-all shadow-md hover:brightness-110 flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ver Agenda Visual</span>
          </button>
        </div>
      </div>

      {/* Reminder Notification Banner if pending */}
      {financialMetrics.pendingRemindersCount > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="font-bold text-sm text-emerald-900 block">
                Envio Automático: {financialMetrics.pendingRemindersCount} lembrete(s) de 24h para amanhã
              </span>
              <p className="text-[11px] text-emerald-800">
                Dispare os lembretes com detalhes do serviço, data e hora diretamente para o WhatsApp das clientes via 5511978338257.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSendAllReminders}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Lembretes WhatsApp Agora</span>
            </button>
          </div>
        </div>
      )}

      {reminderNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{reminderNotice}</span>
        </div>
      )}

      {/* 4 Cards Principais: Ganhos Diários, Semanais e Mensais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ganhos Totais Diários */}
        <div className="p-5 bg-white rounded-2xl border border-[#DFD5C6] shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#73323E]">
              Ganhos Totais Diários
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF2F4] flex items-center justify-center text-[#A0283E]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif font-bold text-[#27040B] tabular-nums">
              {formatCurrency(financialMetrics.dailyEarnings)}
            </span>
            <div className="flex items-center justify-between text-[11px] text-[#73323E] mt-2 pt-2 border-t border-[#F3EDE4]">
              <span>Hoje ({financialMetrics.dailyCount} atendimentos)</span>
              <span className="text-emerald-700 font-semibold">100% recebido</span>
            </div>
          </div>
        </div>

        {/* 2. Ganhos Totais Semanais */}
        <div className="p-5 bg-white rounded-2xl border border-[#DFD5C6] shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#73323E]">
              Ganhos Totais Semanais
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF2F4] flex items-center justify-center text-[#A0283E]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif font-bold text-[#27040B] tabular-nums">
              {formatCurrency(financialMetrics.weeklyEarnings)}
            </span>
            <div className="flex items-center justify-between text-[11px] text-[#73323E] mt-2 pt-2 border-t border-[#F3EDE4]">
              <span>Esta Semana ({financialMetrics.weeklyCount} atendimentos)</span>
              <span className="text-[#A0283E] font-medium">Seg a Dom</span>
            </div>
          </div>
        </div>

        {/* 3. Ganhos Totais Mensais */}
        <div className="p-5 bg-[#2C060D] text-white rounded-2xl border border-[#D4AF37]/50 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              Ganhos Totais Mensais
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F8E7C0]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif font-bold text-[#F8E7C0] tabular-nums">
              {formatCurrency(financialMetrics.monthlyEarnings)}
            </span>
            <div className="flex items-center justify-between text-[11px] text-[#D8B4B8] mt-2 pt-2 border-t border-white/10">
              <span>Este Mês ({financialMetrics.monthlyCount} procedimentos)</span>
              <span className="text-emerald-400 font-semibold">+18.5% meta</span>
            </div>
          </div>
        </div>

        {/* 4. Ticket Médio */}
        <div className="p-5 bg-white rounded-2xl border border-[#DFD5C6] shadow-sm hover:border-[#D4AF37] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#73323E]">
              Ticket Médio
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF2F4] flex items-center justify-center text-[#A0283E]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif font-bold text-[#27040B] tabular-nums">
              {formatCurrency(financialMetrics.averageTicket)}
            </span>
            <div className="flex items-center justify-between text-[11px] text-[#73323E] mt-2 pt-2 border-t border-[#F3EDE4]">
              <span>Taxa de comparecimento</span>
              <span className="text-emerald-700 font-semibold">{financialMetrics.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Visuais de Desempenho com seletor de visão */}
      <div className="bg-white p-6 rounded-3xl border border-[#DFD5C6] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#A0283E]" />
              <h3 className="text-lg font-serif font-semibold text-[#27040B]">
                Gráfico Visual de Ganhos
              </h3>
            </div>
            <p className="text-xs text-[#73323E]">
              Acompanhamento gráfico claro e intuitivo da arrecadação da clínica.
            </p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex items-center bg-[#FAF2F4] p-1 rounded-xl border border-[#DFD5C6]">
            <button
              onClick={() => setActiveChartTab('recent7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartTab === 'recent7'
                  ? 'bg-[#2C060D] text-white shadow-xs'
                  : 'text-[#73323E] hover:text-[#27040B]'
              }`}
            >
              Últimos 7 Dias
            </button>
            <button
              onClick={() => setActiveChartTab('weekdays')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartTab === 'weekdays'
                  ? 'bg-[#2C060D] text-white shadow-xs'
                  : 'text-[#73323E] hover:text-[#27040B]'
              }`}
            >
              Dias da Semana (Seg-Dom)
            </button>
            <button
              onClick={() => setActiveChartTab('monthWeeks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartTab === 'monthWeeks'
                  ? 'bg-[#2C060D] text-white shadow-xs'
                  : 'text-[#73323E] hover:text-[#27040B]'
              }`}
            >
              Semanas do Mês
            </button>
          </div>
        </div>

        {/* View 1: Últimos 7 dias */}
        {activeChartTab === 'recent7' && (
          <div>
            <div className="h-64 flex items-end justify-between gap-2 border-b border-[#F3EDE4] pb-3">
              {financialMetrics.recentDaysData.map((day, idx) => {
                const heightPercent =
                  maxRecentRevenue > 0
                    ? Math.max(12, Math.round((day.revenue / maxRecentRevenue) * 100))
                    : 12;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-[#A0283E] font-semibold opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {formatCurrency(day.revenue)}
                    </span>
                    <div className="w-full max-w-[48px] bg-[#FAF2F4] rounded-t-xl relative flex items-end overflow-hidden h-48">
                      <div
                        className="w-full bg-gradient-to-t from-[#2C060D] via-[#4A0E17] to-[#A0283E] group-hover:from-[#A0283E] group-hover:to-[#D4AF37] transition-all rounded-t-xl"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#582D35] text-center capitalize">
                      {day.dateLabel}
                    </span>
                    <span className="text-[10px] text-[#8C7A70] -mt-1 tabular-nums">
                      {day.count} agend.
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 flex items-center justify-between text-xs text-[#73323E]">
              <span>Média diária recente: {formatCurrency(financialMetrics.weeklyEarnings / 7)}</span>
              <span className="text-emerald-700 font-semibold">Valores calculados em tempo real</span>
            </div>
          </div>
        )}

        {/* View 2: Dias da semana (Seg a Dom) */}
        {activeChartTab === 'weekdays' && (
          <div>
            <div className="h-64 flex items-end justify-between gap-3 border-b border-[#F3EDE4] pb-3">
              {financialMetrics.weekdaysData.map((day, idx) => {
                const heightPercent =
                  maxWeekdayRevenue > 0
                    ? Math.max(10, Math.round((day.revenue / maxWeekdayRevenue) * 100))
                    : 10;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-[#A0283E] font-semibold opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {formatCurrency(day.revenue)}
                    </span>
                    <div className="w-full max-w-[48px] bg-[#FAF2F4] rounded-t-xl relative flex items-end overflow-hidden h-48">
                      <div
                        className="w-full bg-[#4A0E17] group-hover:bg-[#D4AF37] transition-all rounded-t-xl"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#582D35] text-center">
                      {day.dayName.slice(0, 3)}
                    </span>
                    <span className="text-[10px] text-[#8C7A70] -mt-1 tabular-nums">
                      {day.count} atend.
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 flex items-center justify-between text-xs text-[#73323E]">
              <span>Total acumulado nesta semana: <strong>{formatCurrency(financialMetrics.weeklyEarnings)}</strong></span>
              <span>Identifique os dias de pico da clínica para melhor dimensionar a equipe</span>
            </div>
          </div>
        )}

        {/* View 3: Semanas do Mês */}
        {activeChartTab === 'monthWeeks' && (
          <div>
            <div className="h-64 flex items-end justify-between gap-4 border-b border-[#F3EDE4] pb-3 max-w-2xl mx-auto">
              {financialMetrics.monthWeeksData.map((week, idx) => {
                const heightPercent =
                  maxMonthWeekRevenue > 0
                    ? Math.max(12, Math.round((week.revenue / maxMonthWeekRevenue) * 100))
                    : 12;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs text-[#A0283E] font-bold tabular-nums">
                      {formatCurrency(week.revenue)}
                    </span>
                    <div className="w-full max-w-[64px] bg-[#FAF2F4] rounded-t-2xl relative flex items-end overflow-hidden h-48">
                      <div
                        className="w-full bg-gradient-to-t from-[#2C060D] to-[#D4AF37] group-hover:brightness-110 transition-all rounded-t-2xl"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#582D35] text-center">
                      {week.weekLabel}
                    </span>
                    <span className="text-[11px] text-[#8C7A70] -mt-1 tabular-nums">
                      {week.count} atendimentos
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 text-center text-xs text-[#73323E]">
              Faturamento Total Acumulado no Mês Atual:{' '}
              <strong className="text-base font-serif text-[#27040B]">{formatCurrency(financialMetrics.monthlyEarnings)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* ================= RESUMO DOS SERVIÇOS MAIS LUCRATIVOS ================= */}
      <div className="bg-white p-6 rounded-3xl border border-[#DFD5C6] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-xl font-serif font-semibold text-[#27040B]">
                Resumo dos Serviços Mais Lucrativos
              </h3>
            </div>
            <p className="text-xs text-[#73323E]">
              Classificação por receita total gerada, preço unitário e participação percentual no faturamento.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-[#FAF2F4] text-[#A0283E] rounded-xl border border-[#DFD5C6]">
            Ranking Oficial de Rentabilidade
          </span>
        </div>

        {/* Lucrative Services Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F3EDE4] text-[#73323E] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Procedimento</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Valor Unitário</th>
                <th className="py-3 px-3 text-center">Volume</th>
                <th className="py-3 px-3 text-right">Faturamento Total</th>
                <th className="py-3 px-3">Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF2F4]">
              {financialMetrics.lucrativeServices.map((serv, index) => {
                const isTop3 = index < 3;
                return (
                  <tr
                    key={serv.name}
                    className="hover:bg-[#FAF8F5] transition-colors"
                  >
                    <td className="py-3.5 px-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          index === 0
                            ? 'bg-[#D4AF37] text-[#24040A]'
                            : index === 1
                            ? 'bg-[#E5CAD0] text-[#4A0E17]'
                            : index === 2
                            ? 'bg-[#F0E2D0] text-[#73323E]'
                            : 'bg-[#F3EDE4] text-[#8C7A70]'
                        }`}
                      >
                        {index + 1}º
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#27040B]">
                      <div className="flex items-center gap-2">
                        <span>{serv.name}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-[#FAF2F4] text-[#A0283E] text-[10px] font-bold rounded-full border border-[#DFD5C6]">
                            Carro-Chefe
                          </span>
                        )}
                        {serv.unitPrice >= 200 && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[9px] font-semibold rounded-md border border-emerald-200">
                            Alta Margem
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[#73323E]">{serv.category}</td>

                    <td className="py-3.5 px-3 text-right font-medium text-[#582D35] tabular-nums">
                      {formatCurrency(serv.unitPrice)}
                    </td>

                    <td className="py-3.5 px-3 text-center font-semibold text-[#27040B] tabular-nums">
                      {serv.count}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-sm text-[#27040B] tabular-nums">
                      {formatCurrency(serv.totalRevenue)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[#FAF2F4] rounded-full h-2 overflow-hidden border border-[#DFD5C6]/60">
                          <div
                            className="bg-gradient-to-r from-[#4A0E17] to-[#D4AF37] h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(8, serv.percentageOfTotal))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#73323E] tabular-nums">
                          {serv.percentageOfTotal}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Appointments List with WhatsApp Direct Actions */}
      <div className="bg-white p-6 rounded-3xl border border-[#DFD5C6] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-serif font-semibold text-[#27040B]">
              Escala de Atendimentos de Hoje ({formatFriendlyDate(todayStr)})
            </h3>
            <p className="text-xs text-[#73323E]">
              Clientes agendadas para hoje em Jandira. Confirme, conclua e envie mensagens pelo WhatsApp da clínica.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#FAF2F4] text-[#A0283E] rounded-xl border border-[#DFD5C6] tabular-nums">
            {todayAppointments.length} clientes na escala
          </span>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="divide-y divide-[#F3EDE4]">
            {todayAppointments.map((apt) => {
              const isCompleted = apt.status === 'completed';
              const isCancelled = apt.status === 'cancelled';
              return (
                <div
                  key={apt.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Time pill */}
                    <div className="px-3 py-2 bg-[#2C060D] text-white rounded-xl text-center shrink-0 shadow-xs">
                      <span className="block font-bold text-xs tabular-nums text-[#F8E7C0]">
                        {apt.startTime}
                      </span>
                      <span className="block text-[10px] text-[#D8B4B8]">
                        {apt.endTime}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#27040B] truncate">
                          {apt.clientName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isCompleted ? 'Concluído' : isCancelled ? 'Cancelado' : 'Confirmado'}
                        </span>
                        {apt.reminderSent24h && (
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                            ✓ Lembrete 24h Enviado
                          </span>
                        )}
                      </div>

                      <p className="text-[#582D35] font-medium">
                        {apt.services.map((s) => s.name).join(' + ')} ·{' '}
                        <strong className="text-[#27040B]">{formatDuration(apt.totalMinutes)}</strong>
                      </p>

                      <div className="flex items-center gap-3 text-[#73323E] text-[11px]">
                        <span>Especialista: {apt.specialistName}</span>
                        <span>·</span>
                        <span>Tel: {apt.clientPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <span className="font-bold text-base text-[#27040B] tabular-nums">
                      {formatCurrency(apt.totalPrice)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp trigger */}
                      <a
                        href={generateWhatsAppLink(apt, settings.phoneWhatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar mensagem pelo WhatsApp (5511978338257)"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-200 shadow-2xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {!isCompleted && !isCancelled && (
                        <>
                          <button
                            onClick={() => completeAppointment(apt.id)}
                            title="Marcar como Concluído"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-semibold shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Concluir</span>
                          </button>

                          <button
                            onClick={() => cancelAppointment(apt.id, 'Cancelado pela clínica')}
                            title="Cancelar Agendamento"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD5C6]">
            <p className="text-xs text-[#8C7A70]">Nenhum procedimento agendado para hoje ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
