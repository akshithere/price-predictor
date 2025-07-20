import { Routes, Route } from "react-router-dom";
import { Navigation } from '@/components/Navigation';
import { LandingPage } from "./pages/LandingPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { CarPredictionForm } from "./components/CarPredictionForm";

// Wrapper component for pages that need the navigation and consistent layout
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route 
        path="/about" 
        element={
          <PageWrapper>
            <AboutPage />
          </PageWrapper>
        } 
      />
      
      <Route 
        path="/contact" 
        element={
          <PageWrapper>
            <ContactPage />
          </PageWrapper>
        } 
      />
      
      <Route 
        path="/predict" 
        element={
          <PageWrapper>
            <div className="max-w-4xl mx-auto">
              <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Used Car Price Predictor</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Get an instant price estimate for your used car based on make, model, year, and condition
                </p>
              </header>
              
              <main className="flex justify-center">
                <CarPredictionForm />
              </main>
              
              <footer className="mt-16 text-center text-sm text-gray-500">
                <p>This is a demo application. For accurate pricing, please consult a professional dealer.</p>
                <p className="mt-2">© {new Date().getFullYear()} Used Car Price Predictor</p>
              </footer>
            </div>
          </PageWrapper>
        } 
      />
    </Routes>
  );
}
