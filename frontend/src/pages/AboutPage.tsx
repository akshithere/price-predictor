import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Price Predictor</h1>
          
          <div className="prose max-w-4xl">
            <p className="text-lg text-gray-600 mb-6">
              Price Predictor is an AI-powered tool designed to help you determine the fair market value of used cars. 
              Our mission is to provide transparent and accurate price estimates to both buyers and sellers in the used car market.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How It Works</h2>
            <p className="text-gray-600 mb-4">
              Our advanced machine learning model analyzes thousands of data points, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Make and model of the vehicle</li>
              <li>Manufacturing year and mileage</li>
              <li>Fuel type and transmission</li>
              <li>Current market trends</li>
              <li>Regional pricing variations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Technology</h2>
            <p className="text-gray-600 mb-4">
              We use state-of-the-art machine learning algorithms trained on extensive datasets to provide you with 
              the most accurate price predictions. Our models are continuously updated to reflect current market conditions.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Why Choose Us?</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Instant, no-obligation price estimates</li>
              <li>No personal information required</li>
              <li>No spam or unwanted contacts</li>
              <li>User-friendly interface</li>
              <li>Completely free to use</li>
            </ul>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Price Predictor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
