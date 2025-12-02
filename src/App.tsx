import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import { LandingPage } from '@/components/LandingPage';
import { ManagementPanel } from '@/components/management-panel/ManagementPanel';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppNav from './components/navigation/app-nav';

function App() {
  return (
    <BrowserRouter>
      <ValBuilderProvider>
        <div className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl text-primary">VAL Builder</span>
            </div>
            <AppNav />
          </nav>
        </div>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/management-panel" element={<ManagementPanel />} />
        </Routes>
      </ValBuilderProvider>
    </BrowserRouter>
  );
}

export default App
