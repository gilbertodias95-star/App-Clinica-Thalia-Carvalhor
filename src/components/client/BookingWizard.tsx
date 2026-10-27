import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  User,
  Phone,
  Mail,
  Send,
  CalendarPlus,
  Download,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Share2,
  MapPin,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Service, Appointment } from '../../types/clinic';
import {
  formatCurrency,
  formatDuration,
  formatFriendlyDate,
  calculateAvailableSlots,
  generateWhatsAppLink,
  generateGoogleCalendarUrl,
  generateIcsContent,
  parseLocalDate,
} from '../../utils/bookingUtils';

export const BookingWizard: React.FC = () => {
  const {
    services,
    specialists,
    schedule,
    appointments,
    settings,
    clientProfile,
    loginWithSocial,
    loginManual,
    addAppointment,
  } = useClinic();

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Selected services
  const [selectedServices, setSelectedServices] = useState<Service[]>([services[0]]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Step 2: Specialist & Date
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(specialists[0]?.id || 'spec-thalia');
  
  // Default date: tomorrow if today's evening, else today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    // Format YYYY-MM-DD
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Step 3: Selected Slot
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Step 4: Client contact form
  const [clientName, setClientName] = useState<string>(clientProfile?.name || '');
  const [clientPhone, setClientPhone] = useState<string>(clientProfile?.phone || '');
  const [clientEmail, setClientEmail] = useState<string>(clientProfile?.email || '');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Step 5: Completed appointment
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Keep contact form synced if clientProfile changes (e.g. social login)
  React.useEffect(() => {
    if (clientProfile) {
      if (!clientName) setClientName(clientProfile.name);
      if (!clientPhone && clientProfile.phone) setClientPhone(clientProfile.phone);
      if (!clientEmail && clientProfile.email) setClientEmail(clientProfile.email);
    }
  }, [clientProfile]);

  // Aggregate totals
  const totalDurationMinutes = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const selectedSpecialist = useMemo(() => {
    return specialists.find((sp) => sp.id === selectedSpecialistId) || specialists[0];
  }, [specialists, selectedSpecialistId]);

  // Filtered services for Step 1
  const filteredServices = useMemo(() => {
    return services.filter((serv) => {
      const matchesCategory =
        categoryFilter === 'all' || serv.category === categoryFilter;
      const matchesSearch =
        serv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serv.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, categoryFilter, searchQuery]);

  // Available slots dynamically computed
  const availableSlots = useMemo(() => {
    return calculateAvailableSlots(
      selectedDate,
      totalDurationMinutes,
      selectedSpecialistId,
      schedule,
      appointments,
      settings.slotIntervalMinutes || 30
    );
  }, [
    selectedDate,
    totalDurationMinutes,
    selectedSpecialistId,
    schedule,
    appointments,
    settings.slotIntervalMinutes,
  ]);

  // Group slots by period
  const slotsByPeriod = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    availableSlots.forEach((slot) => {
      const [h] = slot.split(':').map(Number);
      if (h < 12) morning.push(slot);
      else if (h < 18) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  // Service toggle handler
  const handleToggleService = (service: Service) => {
    const exists = selectedServices.some((s) => s.id === service.id);
    if (exists) {
      if (selectedServices.length === 1) {
        // Keep at least one
        return;
      }
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices((prev) => [...prev, service]);
    }
    // Reset selected slot since duration might have changed
    setSelectedTime('');
  };

  // Next 14 days generator for date picker
  const upcomingDays = useMemo(() => {
    const list: { dateStr: string; dayName: string; dayNumber: number; monthName: string; isOpen: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      const dayOfWeek = d.getDay();
      const daySchedule = schedule.find((s) => s.dayOfWeek === dayOfWeek);
      const isOpen = !!daySchedule?.isOpen;

      const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

      list.push({
        dateStr,
        dayName,
        dayNumber: d.getDate(),
        monthName,
        isOpen,
      });
    }
    return list;
  }, [schedule]);

  // Calculate end time
  const calculatedEndTime = useMemo(() => {
    if (!selectedTime || totalDurationMinutes <= 0) return '';
    const [h, m] = selectedTime.split(':').map(Number);
    const endTotalMin = h * 60 + m + totalDurationMinutes;
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }, [selectedTime, totalDurationMinutes]);

  // Step 4 Submission: Confirm Appointment
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, informe um WhatsApp válido com DDD (ex: 11 99999-9999).');
      return;
    }
    if (!selectedTime) {
      setFormError('Por favor, selecione um horário válido.');
      setCurrentStep(3);
      return;
    }

    // Save profile if not yet logged in
    if (!clientProfile) {
      loginManual({
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        provider: 'guest',
      });
    }

    const created = addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      specialistId: selectedSpecialist.id,
      specialistName: selectedSpecialist.name,
      services: selectedServices,
      date: selectedDate,
      startTime: selectedTime,
      endTime: calculatedEndTime,
      totalMinutes: totalDurationMinutes,
      totalPrice: totalPrice,
      status: 'confirmed',
      notes: clientNotes.trim() || undefined,
      bookedViaSocial: clientProfile?.provider || 'direct',
    });

    setConfirmedAppointment(created);
    setCurrentStep(5);
  };

  const handleDownloadIcs = () => {
    if (!confirmedAppointment) return;
    const icsData = generateIcsContent(confirmedAppointment, settings.address);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agendamento-thalia-carvalho-${confirmedAppointment.code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [
    { id: 'all', label: 'Todos os Procedimentos' },
    { id: 'Sobrancelhas', label: 'Sobrancelhas' },
    { id: 'Estética Facial', label: 'Estética Facial' },
    { id: 'Unhas', label: 'Unhas' },
    { id: 'Corporal & Massagem', label: 'Corporal & Massagem' },
    { id: 'Combos Especiais', label: 'Combos Especiais' },
  ];

  return (
    <section id="agendamento-section" className="py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#A87B42] mb-2">
            <span>Passo a Passo Simples & Rápido</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#241D1E] tracking-tight">
            Agendamento Online
          </h2>
          <p className="text-sm sm:text-base text-[#6B5E59] mt-2">
            Disponibilidade em tempo real calculada pela duração exata do seu atendimento.
          </p>
        </div>

        {/* Stepper Navigation Indicator */}
        <div className="mb-10">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-3xl mx-auto">
            {[
              { num: 1, title: 'Serviço' },
              { num: 2, title: 'Data' },
              { num: 3, title: 'Horário' },
              { num: 4, title: 'Identificação' },
              { num: 5, title: 'Confirmação' },
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  disabled={step.num > currentStep && currentStep !== 5}
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num);
                  }}
                  className={`flex flex-col items-center py-2 text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'text-[#241D1E]'
                      : isDone
                      ? 'text-[#A87B42] hover:opacity-80'
                      : 'text-[#B5A89E] cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all mb-1 ${
                      isDone
                        ? 'bg-[#C59B63] text-white'
                        : isCurrent
                        ? 'bg-[#241D1E] text-white ring-4 ring-[#EBD8C1]'
                        : 'bg-[#EFE9DF] text-[#8C7A70]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="text-[11px] font-medium hidden sm:inline whitespace-nowrap">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Progress bar line */}
          <div className="w-full bg-[#EFE9DF] h-1 rounded-full mt-2 max-w-3xl mx-auto overflow-hidden">
            <div
              className="bg-[#C59B63] h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Floating sticky summary on mobile for selected services */}
        {currentStep < 5 && selectedServices.length > 0 && (
          <div className="mb-6 bg-[#F3EDE4] border border-[#DFD5C6] rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs">
            <div className="min-w-0">
              <span className="text-[#8C7A70] block">Selecionado:</span>
              <p className="font-semibold text-[#241D1E] truncate">
                {selectedServices.map((s) => s.name).join(' + ')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[#8C7A70] block">
                {formatDuration(totalDurationMinutes)}
              </span>
              <span className="font-semibold text-[#241D1E] text-sm tabular-nums">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 1: ESCOLHA O SERVIÇO ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-semibold text-[#241D1E]">
                  1. Escolha o serviço
                </h3>
                <p className="text-xs text-[#7A6A63]">
                  Selecione o procedimento desejado. Você também pode combinar mais de um serviço.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar procedimento..."
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#DFD5C6] text-xs text-[#241D1E] focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                />
              </div>
            </div>

            {/* Category Filter Pills (Functional Buttons) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#241D1E] text-white shadow-sm'
                      : 'bg-white text-[#6B5E59] border border-[#DFD5C6] hover:bg-[#F5EFE6]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredServices.map((service) => {
                const isSelected = selectedServices.some((s) => s.id === service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => handleToggleService(service)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                      isSelected
                        ? 'bg-white border-[#C59B63] ring-2 ring-[#C59B63]/20 shadow-md'
                        : 'bg-white border-[#E8DEC8] hover:border-[#C59B63]/60 hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="text-base font-semibold text-[#241D1E] leading-snug">
                          {service.name}
                        </h4>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-[#C59B63] border-[#C59B63] text-white'
                              : 'border-[#DFD5C6] bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <p className="text-xs text-[#6B5E59] line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F3EDE4] flex items-center justify-between text-xs">
                      {/* Quiet metadata with dot separator */}
                      <div className="flex items-center gap-1.5 text-[#8C7A70]">
                        <Clock className="w-3.5 h-3.5 text-[#C59B63]" />
                        <span className="font-medium text-[#241D1E]">
                          {formatDuration(service.durationMinutes)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{service.category}</span>
                      </div>

                      <span className="text-base font-semibold text-[#241D1E] tabular-nums">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#DFD5C6]">
                <p className="text-sm text-[#7A6A63]">Nenhum procedimento encontrado para esta busca.</p>
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs font-semibold text-[#A87B42] hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {/* Bottom step 1 CTA */}
            <div className="pt-4 flex items-center justify-end">
              <button
                disabled={selectedServices.length === 0}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-[#241D1E] hover:bg-[#382F30] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Avançar para Especialista & Data</span>
                <ChevronRight className="w-4 h-4 text-[#C59B63]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ESPECIALISTA E DATA ================= */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-semibold text-[#241D1E]">
                  2. Escolha a Especialista e a Data
                </h3>
                <p className="text-xs text-[#7A6A63]">
                  Selecione sua profissional de preferência e veja a disponibilidade na agenda.
                </p>
              </div>
            </div>

            {/* Specialist Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-3">
                Especialista Desejada:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {specialists.map((spec) => {
                  const isSelected = selectedSpecialistId === spec.id;
                  return (
                    <div
                      key={spec.id}
                      onClick={() => {
                        setSelectedSpecialistId(spec.id);
                        setSelectedTime('');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-white border-[#C59B63] ring-2 ring-[#C59B63]/20 shadow-md'
                          : 'bg-white border-[#E8DEC8] hover:border-[#C59B63]/50 hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <img
                        src={spec.avatar}
                        alt={spec.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#E8DEC8] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#241D1E] truncate">
                            {spec.name}
                          </h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C59B63] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-[#7A6A63] truncate">{spec.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Date Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-3">
                Selecione o Dia:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {upcomingDays.map((day) => {
                  const isSelected = selectedDate === day.dateStr;
                  return (
                    <button
                      key={day.dateStr}
                      disabled={!day.isOpen}
                      onClick={() => {
                        setSelectedDate(day.dateStr);
                        setSelectedTime('');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#241D1E] text-white border-[#241D1E] shadow-md scale-102'
                          : day.isOpen
                          ? 'bg-white text-[#241D1E] border-[#DFD5C6] hover:bg-[#FAF6F0]'
                          : 'bg-[#F0EBE3] text-[#B0A298] border-transparent cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase tracking-tight">
                        {day.dayName}
                      </span>
                      <span className="text-base sm:text-lg font-serif font-bold tabular-nums">
                        {day.dayNumber}
                      </span>
                      <span className="text-[9px] text-[#8C7A70] uppercase">
                        {day.isOpen ? day.monthName : 'Fechado'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Details Bar */}
            <div className="p-4 bg-white rounded-xl border border-[#DFD5C6] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#C59B63]" />
                <span className="font-medium text-[#241D1E]">
                  Data selecionada: {formatFriendlyDate(selectedDate)}
                </span>
              </div>
              <span className="text-[#8C7A70]">
                Especialista: {selectedSpecialist.name}
              </span>
            </div>

            {/* Bottom step 2 buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 text-xs text-[#5E514D] hover:text-[#241D1E] flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar aos serviços</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-[#241D1E] hover:bg-[#382F30] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Horários Disponíveis</span>
                <ChevronRight className="w-4 h-4 text-[#C59B63]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: HORÁRIOS DISPONÍVEIS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-semibold text-[#241D1E]">
                  3. Horários Disponíveis
                </h3>
                <p className="text-xs text-[#7A6A63]">
                  Calculados automaticamente para a duração total de{' '}
                  <strong className="text-[#241D1E]">{formatDuration(totalDurationMinutes)}</strong>.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[#8C7A70] block">Dia escolhido:</span>
                <span className="text-xs font-semibold text-[#241D1E]">
                  {formatFriendlyDate(selectedDate)}
                </span>
              </div>
            </div>

            {/* Slots presentation */}
            {availableSlots.length > 0 ? (
              <div className="space-y-6">
                {/* Morning Slots */}
                {slotsByPeriod.morning.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-2.5">
                      Manhã
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {slotsByPeriod.morning.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3 px-2 rounded-xl text-xs font-semibold tabular-nums transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#241D1E] text-white border-[#241D1E] shadow-sm'
                                : 'bg-white text-[#241D1E] border-[#DFD5C6] hover:border-[#C59B63] hover:bg-[#FAF6F0]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {slotsByPeriod.afternoon.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-2.5">
                      Tarde
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {slotsByPeriod.afternoon.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3 px-2 rounded-xl text-xs font-semibold tabular-nums transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#241D1E] text-white border-[#241D1E] shadow-sm'
                                : 'bg-white text-[#241D1E] border-[#DFD5C6] hover:border-[#C59B63] hover:bg-[#FAF6F0]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {slotsByPeriod.evening.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#8C7A70] mb-2.5">
                      Noite
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {slotsByPeriod.evening.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-3 px-2 rounded-xl text-xs font-semibold tabular-nums transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#241D1E] text-white border-[#241D1E] shadow-sm'
                                : 'bg-white text-[#241D1E] border-[#DFD5C6] hover:border-[#C59B63] hover:bg-[#FAF6F0]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedTime && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Horário reservado para você: <strong>{selectedTime}</strong> às{' '}
                        <strong>{calculatedEndTime}</strong> ({formatDuration(totalDurationMinutes)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 px-6 text-center bg-white rounded-2xl border border-dashed border-[#DFD5C6] space-y-3">
                <AlertCircle className="w-8 h-8 text-[#C59B63] mx-auto" />
                <h4 className="text-base font-semibold text-[#241D1E]">
                  Não encontramos horários livres para este dia
                </h4>
                <p className="text-xs text-[#7A6A63] max-w-md mx-auto">
                  A clínica pode estar fechada neste dia ou os horários de{' '}
                  {formatDuration(totalDurationMinutes)} já estão preenchidos.
                </p>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 bg-[#241D1E] text-white text-xs font-medium rounded-xl hover:bg-[#382F30] cursor-pointer"
                >
                  Escolher outra data
                </button>
              </div>
            )}

            {/* Bottom step 3 buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 text-xs text-[#5E514D] hover:text-[#241D1E] flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar à data</span>
              </button>

              <button
                disabled={!selectedTime}
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-[#241D1E] hover:bg-[#382F30] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Avançar para Identificação</span>
                <ChevronRight className="w-4 h-4 text-[#C59B63]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: IDENTIFICAÇÃO E REDES SOCIAIS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-left">
              <h3 className="text-xl font-serif font-semibold text-[#241D1E]">
                4. Identificação & Contato
              </h3>
              <p className="text-xs text-[#7A6A63]">
                Entre com suas redes sociais para preenchimento rápido ou informe seus dados abaixo.
              </p>
            </div>

            {/* Social Login Options */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFD5C6] space-y-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#8C7A70]">
                Preenchimento Rápido com Redes Sociais:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => loginWithSocial('google')}
                  className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EDE4] border border-[#DFD5C6] rounded-xl text-xs font-medium text-[#241D1E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => loginWithSocial('facebook')}
                  className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EDE4] border border-[#DFD5C6] rounded-xl text-xs font-medium text-[#241D1E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => loginWithSocial('apple')}
                  className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F3EDE4] border border-[#DFD5C6] rounded-xl text-xs font-medium text-[#241D1E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.96 1.01-3.1-.98.04-2.15.65-2.84 1.46-.61.7-.87 1.84-.73 2.94 1.08.08 2.19-.55 2.56-1.3" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {clientProfile && (
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                  <span>Conectado como <strong>{clientProfile.name}</strong></span>
                  <span className="text-[10px] text-emerald-700">Preenchido com sucesso</span>
                </div>
              )}
            </div>

            {/* Booking Summary Box */}
            <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8DEC8] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8C7A70]">Procedimentos:</span>
                <span className="font-semibold text-[#241D1E] text-right">
                  {selectedServices.map((s) => s.name).join(' + ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A70]">Data e Horário:</span>
                <span className="font-semibold text-[#241D1E]">
                  {formatFriendlyDate(selectedDate)} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7A70]">Especialista:</span>
                <span className="font-semibold text-[#241D1E]">{selectedSpecialist.name}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#DFD5C6] font-semibold text-sm">
                <span>Total a Pagar na Clínica:</span>
                <span className="text-[#241D1E] tabular-nums">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Direct Form */}
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#241D1E] mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Beatriz Vasconcelos"
                    className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-[#DFD5C6] text-xs text-[#241D1E] focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#241D1E] mb-1">
                    WhatsApp / Celular * (para receber lembrete)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-[#DFD5C6] text-xs text-[#241D1E] focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241D1E] mb-1">
                    E-mail (opcional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="exemplo@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-[#DFD5C6] text-xs text-[#241D1E] focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241D1E] mb-1">
                  Observações ou preferências (opcional)
                </label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Ex: Primeira vez fazendo laminação, sensibilidade a algum produto..."
                  className="w-full p-3 bg-white rounded-xl border border-[#DFD5C6] text-xs text-[#241D1E] focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 text-xs text-[#5E514D] hover:text-[#241D1E] flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar ao horário</span>
                </button>

                <button
                  type="submit"
                  className="px-7 py-3 bg-[#241D1E] hover:bg-[#382F30] text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#C59B63]" />
                  <span>Confirmar Agendamento</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 5: CONFIRMAÇÃO & WHATSAPP ================= */}
        {currentStep === 5 && confirmedAppointment && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-1">
                <span>Agendamento Registrado com Sucesso</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-[#241D1E]">
                Estamos ansiosas para te receber!
              </h3>
              <p className="text-xs text-[#6B5E59] mt-1 max-w-md mx-auto">
                Seu horário está reservado na agenda da{' '}
                <strong className="text-[#241D1E]">Clínica Thalia Carvalho</strong>.
              </p>
            </div>

            {/* Luxury Ticket Card */}
            <div className="bg-white rounded-2xl border border-[#DFD5C6] p-6 shadow-xl relative overflow-hidden text-left space-y-4">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#4A0E17]/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE4]">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/aistudio/WhatsApp_Image_2026-10-22_at_19.04.15_85f3d573.jpeg"
                    alt="Logo Thalia Carvalho"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D4AF37] shadow-sm shrink-0"
                  />
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[#A0283E] font-bold">
                      Voucher Oficial · Estética Avançada
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#27040B]">
                      Clínica Thalia Carvalho
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8C7A70] block">Código:</span>
                  <span className="font-mono text-sm font-bold text-[#A0283E]">
                    #{confirmedAppointment.code}
                  </span>
                </div>
              </div>

              {/* Data fields */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8C7A70] block">Cliente:</span>
                  <span className="font-medium text-[#27040B]">{confirmedAppointment.clientName}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">WhatsApp / Contato:</span>
                  <span className="font-medium text-[#27040B]">{confirmedAppointment.clientPhone}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Data:</span>
                  <span className="font-medium text-[#27040B]">
                    {formatFriendlyDate(confirmedAppointment.date)}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Horário:</span>
                  <span className="font-medium text-[#27040B]">
                    {confirmedAppointment.startTime} às {confirmedAppointment.endTime}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#8C7A70] block">Procedimento(s):</span>
                  <span className="font-medium text-[#27040B]">
                    {confirmedAppointment.services.map((s) => s.name).join(' + ')}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Especialista:</span>
                  <span className="font-medium text-[#27040B]">{confirmedAppointment.specialistName}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Valor Total:</span>
                  <span className="font-semibold text-base text-[#27040B] tabular-nums">
                    {formatCurrency(confirmedAppointment.totalPrice)}
                  </span>
                </div>
              </div>

              {/* 24h Automatic Reminder notice */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-emerald-900">
                    Lembrete Automático 24h Configurado
                  </span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    Você receberá uma notificação via WhatsApp (número oficial <strong>5511978338257</strong>) 24 horas antes do horário para confirmar sua presença com 1 toque.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#7A6A63] flex items-center gap-1.5 border-t border-[#F3EDE4]">
                <MapPin className="w-3.5 h-3.5 text-[#A0283E] shrink-0" />
                <span>Rua Nicolau Maevsky 329, Jardim Lindomar, Jandira - SP</span>
              </div>
            </div>

            {/* MANDATORY WHATSAPP DIRECT ACTION: Telefone configurado = "5511978338257" */}
            <div className="space-y-3">
              <a
                href={generateWhatsAppLink(confirmedAppointment, settings.phoneWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 transform hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Confirmação pelo WhatsApp (11 97833-8257)</span>
              </a>

              <p className="text-[11px] text-[#7A6A63]">
                Clique para enviar os dados diretamente para o WhatsApp oficial da clínica e receber o lembrete!
              </p>
            </div>

            {/* Calendar & Download Reminders */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={generateGoogleCalendarUrl(confirmedAppointment, settings.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#DFD5C6] hover:bg-[#F3EDE4] text-xs font-medium text-[#241D1E] rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-[#C59B63]" />
                <span>Adicionar ao Google Agenda</span>
              </a>

              <button
                onClick={handleDownloadIcs}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#DFD5C6] hover:bg-[#F3EDE4] text-xs font-medium text-[#241D1E] rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#8C7A70]" />
                <span>Baixar Lembrete iCal (.ics)</span>
              </button>
            </div>

            {/* Book another / restart button */}
            <div className="pt-4 border-t border-[#DFD5C6]">
              <button
                onClick={() => {
                  setSelectedServices([services[0]]);
                  setSelectedTime('');
                  setConfirmedAppointment(null);
                  setCurrentStep(1);
                }}
                className="text-xs font-semibold text-[#A87B42] hover:text-[#241D1E] transition-colors cursor-pointer"
              >
                Fazer outro agendamento
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
