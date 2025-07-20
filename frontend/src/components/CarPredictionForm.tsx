import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ModelInfo {
  name: string;
  company: string;
}

interface Categories {
  companies: string[];
  models: ModelInfo[];
  fuel_types: string[];
}

interface FormData {
  company: string;
  model: string;
  year: number;
  kms_driven: number;
  fuel_type: string;
}

const DEFAULT_FORM_DATA: FormData = {
  company: '',
  model: '',
  year: new Date().getFullYear(),
  kms_driven: 0,
  fuel_type: '',
};

interface CarPredictionFormProps {
  onSubmit?: (prediction: number) => void;
}

export function CarPredictionForm({ onSubmit }: CarPredictionFormProps) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [categories, setCategories] = useState<Categories>({ companies: [], models: [], fuel_types: [] });
  const [filteredModels, setFilteredModels] = useState<ModelInfo[]>([]);

  const renderModelOptions = () => {
    if (!formData.company) {
      return (
        <div className="p-3 text-center text-gray-500">
          <p>Please select a company first</p>
        </div>
      );
    }

    if (filteredModels.length === 0) {
      return (
        <div className="p-3 text-center">
          <p className="text-amber-600">No models found for this company</p>
        </div>
      );
    }

    return filteredModels.map((model) => (
      <SelectItem 
        key={model.name} 
        value={model.name}
        className="hover:bg-blue-50 focus:bg-blue-50"
      >
        {model.name}
      </SelectItem>
    ));
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);

  // Fetch available categories from the backend
  const fetchCategories = useCallback(async () => {
    try {
      setIsFetchingCategories(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/categories');
      console.log('response is: ', response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch categories');
      }
      
      const data: Categories = await response.json();
      
      // Validate the response data
      if (!data.companies || !data.models || !data.fuel_types) {
        throw new Error('Invalid categories data received from server');
      }
      
      setCategories({
        companies: [...new Set(data.companies)].sort(),
        models: data.models,
        fuel_types: [...new Set(data.fuel_types)].sort()
      });
      
      // Set default fuel type if available
      if (data.fuel_types.length > 0 && !formData.fuel_type) {
        setFormData(prev => ({
          ...prev,
          fuel_type: data.fuel_types[0]
        }));
      }
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load car categories';
      toast.error(errorMessage);
      setError(`Error: ${errorMessage}. Please refresh the page to try again.`);
    } finally {
      setIsFetchingCategories(false);
    }
  }, [formData.fuel_type]);

  // Update filtered models when company changes or categories are loaded
  useEffect(() => {
    if (!formData.company) {
      setFilteredModels([]);
      if (formData.model) {
        setFormData(prev => ({ ...prev, model: '' }));
      }
      return;
    }

    // Normalize company name for case-insensitive comparison
    const normalizedCompany = formData.company.trim().toLowerCase();
    
    // Get all company names in lowercase for comparison
    const companyNames = new Set(categories.companies.map(c => c.trim().toLowerCase()));
    
    // Filter models for the selected company (case-insensitive)
    // and exclude any models that are just company names
    const modelsForCompany = categories.models
      .filter(model => 
        model.company.trim().toLowerCase() === normalizedCompany &&
        !companyNames.has(model.name.trim().toLowerCase()) // Exclude models that are company names
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort models alphabetically
    
    setFilteredModels(modelsForCompany);
    
    // Reset model if the current selection is not valid for the company
    const currentModelValid = modelsForCompany.some(
      m => m.name.toLowerCase() === formData.model.toLowerCase()
    );
    
    if (formData.model && !currentModelValid) {
      setFormData(prev => ({ ...prev, model: '' }));
    }
  }, [formData.company, categories.models, categories.companies, formData.model]);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
    console.log('categories are: ', categories);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .relative > div[data-radix-popper-content-wrapper] {
        z-index: 1000 !important;
      }
      
      [data-radix-select-content] {
        background-color: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        z-index: 1000 !important;
      }
      
      [data-radix-select-item] {
        padding: 0.5rem 1rem !important;
        cursor: pointer !important;
        outline: none !important;
        transition: all 0.2s !important;
      }
      
      [data-radix-select-item][data-highlighted] {
        background-color: #f0f9ff !important;
        color: #0369a1 !important;
      }
      
      [data-radix-select-content] {
        transform: translateY(0.25rem) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { company, model, year, kms_driven, fuel_type } = formData;
    
    if (!company || !model || !year || !kms_driven || !fuel_type) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          name: model,
          year,
          kms_driven,
          fuel_type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data.predicted_price);
      
      if (onSubmit) {
        onSubmit(data.predicted_price);
      }
      toast.success('Prediction successful!');
    } catch (err) {
      console.error('Prediction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict price';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSubmit]);



  // Show loading state while fetching categories
  if (isFetchingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-blue-600 px-6 py-8 text-center">
              <h2 className="text-3xl font-extrabold text-white">Car Price Predictor</h2>
              <p className="mt-2 text-blue-100">Get an instant estimate of your car's market value</p>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-center">
            <h2 className="text-3xl font-extrabold text-white">Car Price Predictor</h2>
            <p className="mt-2 text-blue-100">Get an instant estimate of your car's market value</p>
          </div>
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Selection */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700 font-medium">Company *</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, company: value, model: '' }))}
                    required
                    disabled={isLoading || isFetchingCategories}
                  >
                    <SelectTrigger className="w-full h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-[1000]">
                      {categories?.companies?.map((company) => (
                        <SelectItem key={company} value={company} className="hover:bg-blue-50 focus:bg-blue-50">
                          {company}
                        </SelectItem>
                      )) || (
                        <SelectItem value="" disabled>Loading companies...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-700 font-medium">Model *</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                    required
                    disabled={!formData.company || isLoading}
                  >
                    <SelectTrigger className="w-full h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder={formData.company ? 'Select model' : 'Select company first'} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-[1000]">
                      {renderModelOptions()}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-gray-700 font-medium">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Kilometers Driven */}
                <div className="space-y-2">
                  <Label htmlFor="kms_driven" className="text-gray-700 font-medium">Kilometers Driven *</Label>
                  <div className="relative">
                    <Input
                      id="kms_driven"
                      type="number"
                      min="0"
                      value={formData.kms_driven}
                      onChange={(e) => setFormData(prev => ({ ...prev, kms_driven: parseInt(e.target.value) || 0 }))}
                      required
                      disabled={isLoading}
                      className="h-12 border-gray-300 pl-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 25000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">km</span>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="space-y-2">
                  <Label htmlFor="fuel_type" className="text-gray-700 font-medium">Fuel Type *</Label>
                  <Select
                    value={formData.fuel_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}
                    required
                    disabled={isLoading || isFetchingCategories}
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg z-[1000]">
                      {categories?.fuel_types?.map((fuelType) => (
                        <SelectItem key={fuelType} value={fuelType} className="hover:bg-blue-50 focus:bg-blue-50">
                          {fuelType}
                        </SelectItem>
                      )) || (
                        <SelectItem value="" disabled>Loading fuel types...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(DEFAULT_FORM_DATA)}
                  disabled={isLoading}
                  className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isFetchingCategories}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-8 text-base font-medium shadow-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Predicting...
                    </div>
                  ) : (
                    'Get Price Estimate'
                  )}
                </Button>
              </div>
            </form>

            {prediction !== null && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-blue-800">Estimated Market Value</h3>
                    <div className="mt-1">
                      <p className="text-3xl font-bold text-blue-600">₹{prediction.toLocaleString('en-IN')}</p>
                      <p className="mt-1 text-sm text-blue-700">
                        This is an estimate based on current market trends and the information provided.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarPredictionForm;