/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/Header';
import { HeroSection } from './components/client/HeroSection';
import { BookingWizard } from './components/client/BookingWizard';
import { SpecialistsSection } from './components/client/SpecialistsSection';
import { ClinicAtmosphere } from './components/client/ClinicAtmosphere';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/client/MobileBottomNav';

// Code-split heavy admin suite so client mobile load is ultralight and lightning fast
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((module) => ({
    default: module.AdminLayout,
  }))
);

const AdminLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
    <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-medium text-[#73323E]">Carregando Painel da Clínica...</p>
  </div>
);

const MainContent: React.FC = () => {
  const { currentMode } = useClinic();

  if (currentMode === 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#241D1E] pb-20 md:pb-0">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminLayout />
          </Suspense>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#241D1E] pb-20 md:pb-0">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div id="servicos">
          <BookingWizard />
        </div>
        <SpecialistsSection />
        <ClinicAtmosphere />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainContent />
    </ClinicProvider>
  );
}
