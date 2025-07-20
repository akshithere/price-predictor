import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, Zap, BarChart3, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: "Instant Estimates",
      description:
        "Get a price estimate for your used car in seconds with our AI-powered prediction model.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      title: "Data-Driven",
      description:
        "Our algorithm analyzes thousands of data points to give you the most accurate price prediction.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      title: "No Spam, No Hassle",
      description:
        "No need to share your contact details or deal with pushy salespeople.",
    },
  ];

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Sell Your Used Car</span>
                <span className="block text-blue-600">At The Right Price</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Get an instant, accurate estimate of your car's value with our
                AI-powered price predictor. No strings attached, no personal
                information needed.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Button
                    onClick={() => navigate("/predict")}
                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                    <Car className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A better way to sell your car
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {features.map((feature, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-white">
                      {feature.icon}
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to find out your car's value?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              Get an instant estimate now. It's free and only takes a minute.
            </p>
            <Button
              onClick={() => navigate("/predict")}
              className="mt-8 w-full bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 border border-transparent text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
            >
              Check My Car's Value
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <nav className="flex justify-center space-x-6" aria-label="Footer">
              <div className="px-5 py-2">
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white"
                >
                  About
                </a>
              </div>
              <div className="px-5 py-2">
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white"
                >
                  How It Works
                </a>
              </div>
              <div className="px-5 py-2">
                <a
                  href="#"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Contact
                </a>
              </div>
            </nav>
            <p className="mt-8 text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} Car Price Predictor. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
