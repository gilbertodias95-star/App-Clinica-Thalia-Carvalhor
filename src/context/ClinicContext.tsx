import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Service,
  DaySchedule,
  Specialist,
  Appointment,
  ClinicSettings,
  ClientProfile,
} from '../types/clinic';
import {
  INITIAL_SERVICES,
  INITIAL_SPECIALISTS,
  INITIAL_SCHEDULE,
  INITIAL_SETTINGS,
  getInitialAppointments,
} from '../data/initialData';
import {
  parseLocalDate,
  generate24hReminderWhatsAppLink,
  isAppointmentDueFor24hReminder,
} from '../utils/bookingUtils';

export interface LucrativeServiceStat {
  name: string;
  category: string;
  unitPrice: number;
  totalRevenue: number;
  count: number;
  percentageOfTotal: number;
}

export interface DayRevenueStat {
  dayName: string;
  dateStr: string;
  revenue: number;
  count: number;
}

export interface WeekRevenueStat {
  weekLabel: string;
  revenue: number;
  count: number;
}

export interface FinancialMetrics {
  dailyEarnings: number;
  dailyCount: number;
  weeklyEarnings: number;
  weeklyCount: number;
  monthlyEarnings: number;
  monthlyCount: number;
  averageTicket: number;
  totalAppointments: number;
  completionRate: number;
  recentDaysData: { dateLabel: string; revenue: number; count: number }[];
  weekdaysData: DayRevenueStat[];
  monthWeeksData: WeekRevenueStat[];
  lucrativeServices: LucrativeServiceStat[];
  topServices: { name: string; count: number; revenue: number }[];
  pendingRemindersCount: number;
}

interface ClinicContextType {
  services: Service[];
  schedule: DaySchedule[];
  specialists: Specialist[];
  appointments: Appointment[];
  settings: ClinicSettings;
  clientProfile: ClientProfile | null;
  currentMode: 'client' | 'admin';
  adminSection: 'dashboard' | 'calendar' | 'services' | 'schedule' | 'reminders';
  financialMetrics: FinancialMetrics;
  
  // Actions
  setMode: (mode: 'client' | 'admin') => void;
  setAdminSection: (section: 'dashboard' | 'calendar' | 'services' | 'schedule' | 'reminders') => void;
  addService: (newService: Omit<Service, 'id'>) => void;
  updateService: (id: string, updated: Partial<Service>) => void;
  deleteService: (id: string) => void;
  updateDaySchedule: (dayOfWeek: number, updated: Partial<DaySchedule>) => void;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'code' | 'createdAt'>) => Appointment;
  cancelAppointment: (id: string, reason?: string) => void;
  completeAppointment: (id: string) => void;
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;
  loginWithSocial: (provider: 'google' | 'facebook' | 'apple') => void;
  loginManual: (profile: ClientProfile) => void;
  logoutClient: () => void;
  resetToDefaults: () => void;
  send24hReminder: (appointmentId: string, openWindow?: boolean) => void;
  sendAllPending24hReminders: () => number;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVICES: 'tc_services_v1',
  SCHEDULE: 'tc_schedule_v1',
  APPOINTMENTS: 'tc_appointments_v1',
  SETTINGS: 'tc_settings_v1',
  CLIENT: 'tc_client_profile_v1',
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Services
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  // Schedule
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  // Specialists
  const [specialists] = useState<Specialist[]>(INITIAL_SPECIALISTS);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? JSON.parse(saved) : getInitialAppointments();
    } catch {
      return getInitialAppointments();
    }
  });

  // Settings
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Client user profile
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation mode
  const [currentMode, setMode] = useState<'client' | 'admin'>('client');
  const [adminSection, setAdminSection] = useState<'dashboard' | 'calendar' | 'services' | 'schedule' | 'reminders'>('dashboard');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (clientProfile) {
      localStorage.setItem(STORAGE_KEYS.CLIENT, JSON.stringify(clientProfile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT);
    }
  }, [clientProfile]);

  // Actions
  const addService = (newService: Omit<Service, 'id'>) => {
    const id = `serv-${Date.now()}`;
    setServices((prev) => [...prev, { ...newService, id }]);
  };

  const updateService = (id: string, updated: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateDaySchedule = (dayOfWeek: number, updated: Partial<DaySchedule>) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...updated } : d))
    );
  };

  const addAppointment = (
    data: Omit<Appointment, 'id' | 'code' | 'createdAt'>
  ): Appointment => {
    const randomCode = `TC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      code: randomCode,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  const cancelAppointment = (id: string, reason?: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: 'cancelled',
              notes: reason ? `${apt.notes || ''} [Cancelado: ${reason}]`.trim() : apt.notes,
            }
          : apt
      )
    );
  };

  const completeAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: 'completed' } : apt
      )
    );
  };

  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const loginWithSocial = (provider: 'google' | 'facebook' | 'apple') => {
    const mockProfiles: Record<string, ClientProfile> = {
      google: {
        name: 'Camila Fernandes',
        email: 'camila.fernandes@gmail.com',
        phone: '(11) 98765-2144',
        provider: 'google',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      facebook: {
        name: 'Isabela Silveira',
        email: 'isabela.silveira@facebook.com',
        phone: '(11) 99341-8890',
        provider: 'facebook',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      },
      apple: {
        name: 'Beatriz Vasconcelos',
        email: 'beatriz.v@icloud.com',
        phone: '(11) 98112-7744',
        provider: 'apple',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      },
    };
    setClientProfile(mockProfiles[provider]);
  };

  const loginManual = (profile: ClientProfile) => {
    setClientProfile(profile);
  };

  const logoutClient = () => {
    setClientProfile(null);
  };

  const resetToDefaults = () => {
    setServices(INITIAL_SERVICES);
    setSchedule(INITIAL_SCHEDULE);
    setAppointments(getInitialAppointments());
    setSettings(INITIAL_SETTINGS);
    setClientProfile(null);
  };

  const send24hReminder = (appointmentId: string, openWindow: boolean = true) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              reminderSent24h: true,
              reminderSent24hAt: new Date().toISOString(),
            }
          : a
      )
    );

    if (openWindow) {
      const url = generate24hReminderWhatsAppLink(apt, settings.phoneWhatsapp, settings.address);
      window.open(url, '_blank');
    }
  };

  const sendAllPending24hReminders = (): number => {
    const pending = appointments.filter(isAppointmentDueFor24hReminder);
    if (pending.length === 0) return 0;

    const nowIso = new Date().toISOString();
    const pendingIds = new Set(pending.map((p) => p.id));

    setAppointments((prev) =>
      prev.map((a) =>
        pendingIds.has(a.id)
          ? {
              ...a,
              reminderSent24h: true,
              reminderSent24hAt: nowIso,
            }
          : a
      )
    );

    // Open first one in WhatsApp for convenience
    if (pending[0]) {
      const url = generate24hReminderWhatsAppLink(pending[0], settings.phoneWhatsapp, settings.address);
      window.open(url, '_blank');
    }

    return pending.length;
  };

  // Compute financial metrics (diários, semanais, mensais) + Lucrative Services
  const financialMetrics = useMemo<FinancialMetrics>(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Current week boundary (Monday to Sunday)
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Current month boundary
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let dailyEarnings = 0;
    let dailyCount = 0;
    let weeklyEarnings = 0;
    let weeklyCount = 0;
    let monthlyEarnings = 0;
    let monthlyCount = 0;
    let totalCompletedRevenue = 0;
    let completedCount = 0;

    const serviceStats: Record<string, { category: string; unitPrice: number; count: number; revenue: number }> = {};

    appointments.forEach((apt) => {
      // Ignore cancelled appointments for revenue calculations
      if (apt.status === 'cancelled') return;

      const aptDate = parseLocalDate(apt.date);

      // Daily
      if (apt.date === todayStr) {
        dailyEarnings += apt.totalPrice;
        dailyCount++;
      }

      // Weekly
      if (aptDate >= monday && aptDate <= sunday) {
        weeklyEarnings += apt.totalPrice;
        weeklyCount++;
      }

      // Monthly
      if (aptDate >= startOfMonth && aptDate <= endOfMonth) {
        monthlyEarnings += apt.totalPrice;
        monthlyCount++;
      }

      if (apt.status === 'completed' || apt.status === 'confirmed') {
        totalCompletedRevenue += apt.totalPrice;
        completedCount++;
      }

      // Breakdown by service
      apt.services.forEach((s) => {
        if (!serviceStats[s.name]) {
          serviceStats[s.name] = {
            category: s.category,
            unitPrice: s.price,
            count: 0,
            revenue: 0,
          };
        }
        serviceStats[s.name].count += 1;
        serviceStats[s.name].revenue += s.price;
      });
    });

    const averageTicket =
      completedCount > 0
        ? totalCompletedRevenue / completedCount
        : dailyCount > 0
        ? dailyEarnings / dailyCount
        : 145;

    // Last 7 days breakdown for visual chart
    const recentDaysData: { dateLabel: string; revenue: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const weekdayShort = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();

      let dayRev = 0;
      let dayCnt = 0;
      appointments.forEach((a) => {
        if (a.date === iso && a.status !== 'cancelled') {
          dayRev += a.totalPrice;
          dayCnt++;
        }
      });

      recentDaysData.push({
        dateLabel: `${weekdayShort} ${dayNum}`,
        revenue: dayRev,
        count: dayCnt,
      });
    }

    // Weekdays of current week (Seg a Dom)
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const weekdaysData: DayRevenueStat[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      let rev = 0;
      let cnt = 0;
      appointments.forEach((a) => {
        if (a.date === iso && a.status !== 'cancelled') {
          rev += a.totalPrice;
          cnt++;
        }
      });
      weekdaysData.push({
        dayName: dayNames[i],
        dateStr: iso,
        revenue: rev,
        count: cnt,
      });
    }

    // Month divided into 4 weeks
    const monthWeeksData: WeekRevenueStat[] = [
      { weekLabel: 'Sem 1 (Dias 1-7)', revenue: 0, count: 0 },
      { weekLabel: 'Sem 2 (Dias 8-14)', revenue: 0, count: 0 },
      { weekLabel: 'Sem 3 (Dias 15-21)', revenue: 0, count: 0 },
      { weekLabel: 'Sem 4 (Dias 22+)', revenue: 0, count: 0 },
    ];

    appointments.forEach((a) => {
      if (a.status === 'cancelled') return;
      const [y, m, d] = a.date.split('-').map(Number);
      if (y === now.getFullYear() && m === now.getMonth() + 1) {
        if (d <= 7) {
          monthWeeksData[0].revenue += a.totalPrice;
          monthWeeksData[0].count++;
        } else if (d <= 14) {
          monthWeeksData[1].revenue += a.totalPrice;
          monthWeeksData[1].count++;
        } else if (d <= 21) {
          monthWeeksData[2].revenue += a.totalPrice;
          monthWeeksData[2].count++;
        } else {
          monthWeeksData[3].revenue += a.totalPrice;
          monthWeeksData[3].count++;
        }
      }
    });

    // Total revenue from all non-cancelled services
    const grandTotalRevenue = Object.values(serviceStats).reduce((acc, curr) => acc + curr.revenue, 0) || 1;

    // Lucrative Services (Ranked by highest total revenue)
    const lucrativeServices: LucrativeServiceStat[] = Object.entries(serviceStats)
      .map(([name, data]) => ({
        name,
        category: data.category,
        unitPrice: data.unitPrice,
        totalRevenue: data.revenue,
        count: data.count,
        percentageOfTotal: Math.round((data.revenue / grandTotalRevenue) * 100),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    const topServices = lucrativeServices.slice(0, 5).map((l) => ({
      name: l.name,
      count: l.count,
      revenue: l.totalRevenue,
    }));

    const nonCancelled = appointments.filter((a) => a.status !== 'cancelled').length;
    const completionRate = nonCancelled > 0 ? Math.round((completedCount / nonCancelled) * 100) : 100;

    const pendingRemindersCount = appointments.filter(isAppointmentDueFor24hReminder).length;

    return {
      dailyEarnings,
      dailyCount,
      weeklyEarnings,
      weeklyCount,
      monthlyEarnings,
      monthlyCount,
      averageTicket,
      totalAppointments: appointments.length,
      completionRate,
      recentDaysData,
      weekdaysData,
      monthWeeksData,
      lucrativeServices,
      topServices,
      pendingRemindersCount,
    };
  }, [appointments]);

  return (
    <ClinicContext.Provider
      value={{
        services,
        schedule,
        specialists,
        appointments,
        settings,
        clientProfile,
        currentMode,
        adminSection,
        financialMetrics,
        setMode,
        setAdminSection,
        addService,
        updateService,
        deleteService,
        updateDaySchedule,
        addAppointment,
        cancelAppointment,
        completeAppointment,
        updateSettings,
        loginWithSocial,
        loginManual,
        logoutClient,
        resetToDefaults,
        send24hReminder,
        sendAllPending24hReminders,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
