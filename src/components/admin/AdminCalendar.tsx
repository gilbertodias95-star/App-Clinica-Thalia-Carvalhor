import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Filter,
  AlertCircle,
  Coffee,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, Service } from '../../types/clinic';
import {
  formatCurrency,
  formatDuration,
  formatFriendlyDate,
  timeToMinutes,
  minutesToTime,
  generateWhatsAppLink,
  generate24hReminderWhatsAppLink,
  parseLocalDate,
} from '../../utils/bookingUtils';

export const AdminCalendar: React.FC = () => {
  const {
    schedule,
    appointments,
    specialists,
    services,
    settings,
    completeAppointment,
    cancelAppointment,
    addAppointment,
  } = useClinic();

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filter by specialist
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('all');
  
  // Filter by slot type
  const [statusFilter, setStatusFilter] = useState<'all' | 'booked' | 'free' | 'cancelled'>('all');

  // New quick appointment modal
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState<boolean>(false);
  const [quickSlotTime, setQuickSlotTime] = useState<string>('10:00');
  const [quickClientName, setQuickClientName] = useState<string>('');
  const [quickClientPhone, setQuickClientPhone] = useState<string>('');
  const [quickServiceId, setQuickServiceId] = useState<string>(services[0]?.id || '');
  const [quickSpecialistId, setQuickSpecialistId] = useState<string>(specialists[0]?.id || '');

  // Day info
  const localDate = parseLocalDate(selectedDate);
  const dayOfWeek = localDate.getDay();
  const daySchedule = schedule.find((s) => s.dayOfWeek === dayOfWeek);

  const prevDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const nextDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Day's appointments
  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDate = apt.date === selectedDate;
      const matchesSpec =
        selectedSpecialistId === 'all' || apt.specialistId === selectedSpecialistId;
      return matchesDate && matchesSpec;
    });
  }, [appointments, selectedDate, selectedSpecialistId]);

  // Generate timeline slots for the day
  const timelineSlots = useMemo(() => {
    if (!daySchedule || !daySchedule.isOpen) {
      return [];
    }

    const openMin = timeToMinutes(daySchedule.openTime);
    const closeMin = timeToMinutes(daySchedule.closeTime);
    const lunchStartMin = timeToMinutes(daySchedule.lunchStart);
    const lunchEndMin = timeToMinutes(daySchedule.lunchEnd);
    const step = settings.slotIntervalMinutes || 30;

    const slots: {
      time: string;
      minutes: number;
      type: 'booked' | 'free' | 'lunch' | 'cancelled';
      appointment?: Appointment;
    }[] = [];

    for (let m = openMin; m < closeMin; m += step) {
      const timeStr = minutesToTime(m);

      // Check if lunch
      if (m >= lunchStartMin && m < lunchEndMin) {
        slots.push({
          time: timeStr,
          minutes: m,
          type: 'lunch',
        });
        continue;
      }

      // Check active appointments covering this time
      const activeApt = dayAppointments.find((apt) => {
        if (apt.status === 'cancelled') return false;
        const aptStart = timeToMinutes(apt.startTime);
        const aptEnd = timeToMinutes(apt.endTime);
        return m >= aptStart && m < aptEnd;
      });

      if (activeApt) {
        // If this minute matches the start of the appointment, attach full appointment
        const isStart = activeApt.startTime === timeStr;
        slots.push({
          time: timeStr,
          minutes: m,
          type: 'booked',
          appointment: isStart ? activeApt : undefined,
        });
        continue;
      }

      // Check cancelled appointments starting at this slot
      const cancelledApt = dayAppointments.find(
        (apt) => apt.status === 'cancelled' && apt.startTime === timeStr
      );

      if (cancelledApt) {
        slots.push({
          time: timeStr,
          minutes: m,
          type: 'cancelled',
          appointment: cancelledApt,
        });
        continue;
      }

      // Otherwise it's free
      slots.push({
        time: timeStr,
        minutes: m,
        type: 'free',
      });
    }

    return slots;
  }, [daySchedule, dayAppointments, settings.slotIntervalMinutes]);

  // Filter slots based on user selection
  const filteredTimeline = useMemo(() => {
    if (statusFilter === 'all') return timelineSlots;
    if (statusFilter === 'booked') {
      return timelineSlots.filter((s) => s.type === 'booked' && s.appointment);
    }
    if (statusFilter === 'free') {
      return timelineSlots.filter((s) => s.type === 'free');
    }
    if (statusFilter === 'cancelled') {
      return timelineSlots.filter((s) => s.type === 'cancelled');
    }
    return timelineSlots;
  }, [timelineSlots, statusFilter]);

  // Handle direct manual booking
  const handleCreateQuickBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName.trim() || !quickClientPhone.trim()) return;

    const serv = services.find((s) => s.id === quickServiceId) || services[0];
    const spec = specialists.find((sp) => sp.id === quickSpecialistId) || specialists[0];

    const [h, m] = quickSlotTime.split(':').map(Number);
    const endMinutes = h * 60 + m + serv.durationMinutes;
    const endTime = minutesToTime(endMinutes);

    addAppointment({
      clientName: quickClientName.trim(),
      clientPhone: quickClientPhone.trim(),
      specialistId: spec.id,
      specialistName: spec.name,
      services: [serv],
      date: selectedDate,
      startTime: quickSlotTime,
      endTime: endTime,
      totalMinutes: serv.durationMinutes,
      totalPrice: serv.price,
      status: 'confirmed',
      notes: 'Agendado manualmente via painel da clínica.',
      bookedViaSocial: 'direct',
    });

    setIsQuickBookingOpen(false);
    setQuickClientName('');
    setQuickClientPhone('');
  };

  const openQuickBookingForSlot = (slotTime: string) => {
    setQuickSlotTime(slotTime);
    setIsQuickBookingOpen(true);
  };

  const bookedCount = dayAppointments.filter((a) => a.status !== 'cancelled').length;
  const cancelledCount = dayAppointments.filter((a) => a.status === 'cancelled').length;
  const freeCount = timelineSlots.filter((s) => s.type === 'free').length;

  return (
    <div className="space-y-6">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DEC8]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A87B42]">
            Escala Diária
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#241D1E]">
            Agenda Visual de Atendimentos
          </h2>
          <p className="text-xs text-[#7A6A63]">
            Acompanhe horários marcados, horários livres e cancelamentos em tempo real.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevDay}
            className="p-2 bg-white rounded-xl border border-[#DFD5C6] hover:bg-[#F3EDE4] text-[#241D1E] cursor-pointer"
            title="Dia Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={setToday}
            className="px-3 py-2 bg-white rounded-xl border border-[#DFD5C6] hover:bg-[#F3EDE4] text-xs font-medium text-[#241D1E] cursor-pointer"
          >
            Hoje
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-[#DFD5C6] text-xs font-medium text-[#241D1E] focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
          />

          <button
            onClick={nextDay}
            className="p-2 bg-white rounded-xl border border-[#DFD5C6] hover:bg-[#F3EDE4] text-[#241D1E] cursor-pointer"
            title="Próximo Dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Title Banner & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-semibold text-[#241D1E]">
            {formatFriendlyDate(selectedDate)}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[#7A6A63] mt-1">
            <span>
              Status da clínica:{' '}
              {daySchedule?.isOpen ? (
                <strong className="text-emerald-700">
                  Aberta ({daySchedule.openTime} às {daySchedule.closeTime})
                </strong>
              ) : (
                <strong className="text-rose-700">Fechada</strong>
              )}
            </span>
            <span>·</span>
            <span>Almoço: {daySchedule?.lunchStart} - {daySchedule?.lunchEnd}</span>
          </div>
        </div>

        {/* Filters and Counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Specialist select */}
          <select
            value={selectedSpecialistId}
            onChange={(e) => setSelectedSpecialistId(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl text-xs font-medium text-[#241D1E]"
          >
            <option value="all">Todas as Especialistas</option>
            {specialists.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>

          {/* Status buttons */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD5C6]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#241D1E] text-white'
                  : 'text-[#6B5E59] hover:text-[#241D1E]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('booked')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'booked'
                  ? 'bg-amber-700 text-white'
                  : 'text-[#6B5E59] hover:text-[#241D1E]'
              }`}
            >
              Marcados ({bookedCount})
            </button>
            <button
              onClick={() => setStatusFilter('free')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'free'
                  ? 'bg-emerald-700 text-white'
                  : 'text-[#6B5E59] hover:text-[#241D1E]'
              }`}
            >
              Livres ({freeCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-700 text-white'
                  : 'text-[#6B5E59] hover:text-[#241D1E]'
              }`}
            >
              Cancelados ({cancelledCount})
            </button>
          </div>
        </div>
      </div>

      {/* Visual Timeline / Schedule Grid */}
      {daySchedule?.isOpen ? (
        <div className="bg-white rounded-2xl border border-[#DFD5C6] shadow-sm divide-y divide-[#F3EDE4] overflow-hidden">
          {filteredTimeline.map((slot, index) => {
            // BOOKED SLOT
            if (slot.type === 'booked') {
              if (!slot.appointment) {
                // Continuation slot of a longer appointment
                return (
                  <div
                    key={index}
                    className="p-3 pl-8 bg-amber-50/30 flex items-center gap-3 text-xs text-[#8C7A70]"
                  >
                    <span className="font-mono text-xs text-[#A87B42] w-14 shrink-0">
                      {slot.time}
                    </span>
                    <span className="italic text-[11px]">
                      ↳ Continuação de atendimento em andamento
                    </span>
                  </div>
                );
              }

              const apt = slot.appointment;
              const isCompleted = apt.status === 'completed';

              return (
                <div
                  key={index}
                  className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-amber-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="px-3 py-2 bg-[#241D1E] text-white rounded-xl text-center shrink-0">
                      <span className="block font-bold text-xs tabular-nums">
                        {apt.startTime}
                      </span>
                      <span className="block text-[10px] text-[#C59B63]">
                        {apt.endTime}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#241D1E] truncate">
                          {apt.clientName}
                        </span>
                        <span className="text-[10px] font-mono text-[#A87B42]">
                          #{apt.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isCompleted ? 'Concluído' : 'Horário Marcado'}
                        </span>
                      </div>

                      <p className="text-[#4A3E39] font-medium">
                        {apt.services.map((s) => s.name).join(' + ')}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#8C7A70] text-[11px]">
                        <span>Duração: {formatDuration(apt.totalMinutes)}</span>
                        <span>·</span>
                        <span>Especialista: {apt.specialistName}</span>
                        <span>·</span>
                        <span>Tel: {apt.clientPhone}</span>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-[#7A6A63] bg-white/80 p-2 rounded-lg border border-[#E8DEC8]">
                          Obs: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8DEC8]">
                    <span className="text-base font-bold text-[#241D1E] tabular-nums">
                      {formatCurrency(apt.totalPrice)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp 24h reminder / regular message */}
                      <a
                        href={generate24hReminderWhatsAppLink(apt, settings.phoneWhatsapp, settings.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar Lembrete de 24h com detalhes completos pelo WhatsApp"
                        className={`p-2 rounded-xl transition-colors border flex items-center gap-1 text-[11px] font-semibold ${
                          apt.reminderSent24h
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {apt.reminderSent24h ? 'Lembrete Enviado' : 'Lembrete 24h'}
                        </span>
                      </a>

                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => completeAppointment(apt.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1 font-medium cursor-pointer"
                            title="Marcar como Concluído"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Concluir</span>
                          </button>

                          <button
                            onClick={() => {
                              const reason = prompt('Motivo do cancelamento:');
                              if (reason !== null) cancelAppointment(apt.id, reason);
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                            title="Cancelar agendamento"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // CANCELLED SLOT
            if (slot.type === 'cancelled' && slot.appointment) {
              const apt = slot.appointment;
              return (
                <div
                  key={index}
                  className="p-4 bg-rose-50/40 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-rose-800 font-semibold w-14 shrink-0">
                      {slot.time}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-rose-900 font-medium">
                          {apt.clientName} · {apt.services.map((s) => s.name).join(' + ')}
                        </span>
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Cancelado
                        </span>
                      </div>
                      {apt.notes && (
                        <span className="text-[11px] text-rose-600 block mt-0.5">
                          {apt.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openQuickBookingForSlot(slot.time)}
                    className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 text-rose-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Liberar / Reagendar
                  </button>
                </div>
              );
            }

            // LUNCH SLOT
            if (slot.type === 'lunch') {
              return (
                <div
                  key={index}
                  className="p-3 bg-[#FAF8F5] flex items-center gap-3 text-xs text-[#8C7A70]"
                >
                  <span className="font-mono text-xs text-[#8C7A70] w-14 shrink-0">
                    {slot.time}
                  </span>
                  <div className="flex items-center gap-1.5 italic text-[11px]">
                    <Coffee className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span>Intervalo de Atendimento / Almoço</span>
                  </div>
                </div>
              );
            }

            // FREE SLOT
            return (
              <div
                key={index}
                className="p-3 sm:p-3.5 hover:bg-[#FAF8F5] flex items-center justify-between gap-4 text-xs transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#6B5E59] w-14 shrink-0">
                    {slot.time}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[#5E514D] font-medium">Horário Livre</span>
                    <span className="text-[11px] text-[#8C7A70] hidden sm:inline">
                      Disponível para agendamento online ou encaixe manual
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openQuickBookingForSlot(slot.time)}
                  className="px-3 py-1.5 bg-white group-hover:bg-[#241D1E] text-[#241D1E] group-hover:text-white border border-[#DFD5C6] group-hover:border-[#241D1E] rounded-xl transition-all flex items-center gap-1 text-[11px] font-medium cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-[#C59B63]" />
                  <span>Encaixar Cliente</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#DFD5C6] space-y-3">
          <AlertCircle className="w-8 h-8 text-[#C59B63] mx-auto" />
          <h4 className="text-base font-semibold text-[#241D1E]">
            A clínica está fechada neste dia
          </h4>
          <p className="text-xs text-[#7A6A63] max-w-sm mx-auto">
            Configurado como dia de folga no cronograma de atendimento. Você pode alterar nas
            Configurações de Horário.
          </p>
        </div>
      )}

      {/* Quick Booking Modal */}
      {isQuickBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFD5C6] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE4]">
              <div>
                <h4 className="font-serif font-bold text-lg text-[#241D1E]">
                  Encaixe Manual de Cliente
                </h4>
                <p className="text-xs text-[#7A6A63]">
                  {formatFriendlyDate(selectedDate)} às {quickSlotTime}
                </p>
              </div>
              <button
                onClick={() => setIsQuickBookingOpen(false)}
                className="text-[#8C7A70] hover:text-[#241D1E] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuickBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  Nome da Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={quickClientPhone}
                  onChange={(e) => setQuickClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  Procedimento *
                </label>
                <select
                  value={quickServiceId}
                  onChange={(e) => setQuickServiceId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatDuration(s.durationMinutes)} - {formatCurrency(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  Especialista *
                </label>
                <select
                  value={quickSpecialistId}
                  onChange={(e) => setQuickSpecialistId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                >
                  {specialists.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} - {sp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3EDE4]">
                <button
                  type="button"
                  onClick={() => setIsQuickBookingOpen(false)}
                  className="px-4 py-2 text-[#5E514D] hover:text-[#241D1E] cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#241D1E] hover:bg-[#382F30] text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Confirmar Encaixe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
