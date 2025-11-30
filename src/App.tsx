import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import { LandingPage } from './components/LandingPage'

function App() {
  return (
    <ValBuilderProvider>
      <LandingPage />
    </ValBuilderProvider>
  );
}

export default App
