import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CheckoutStepper } from './components/CheckoutStepper';
import { OrderSummary } from './components/OrderSummary';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { CheckoutFormData, CheckoutStep } from './types';
import { Linkedin, Mail, Phone, ArrowRight, Lock, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.DETAILS);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    linkedinUrl: '',
    targetRole: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    let isValid = true;

    if (!formData.linkedinUrl.trim()) {
      newErrors.linkedinUrl = "LinkedIn URL is required";
      isValid = false;
    } else if (!formData.linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
      isValid = false;
    }

    if (!formData.targetRole.trim()) {
      newErrors.targetRole = "Target role is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
        setStep(CheckoutStep.PAYMENT);
        // In a real app, this would redirect to payment gateway
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-[#F8F9FA]">
      <Navbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Progress Stepper */}
        <CheckoutStepper currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* LEFT COLUMN: Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              
              {step === CheckoutStep.DETAILS ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Your Details</h1>
                    <p className="text-gray-500 mt-1">Where should we send your profile review?</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="LinkedIn Profile URL"
                      name="linkedinUrl"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      error={errors.linkedinUrl}
                      icon={<Linkedin size={18} />}
                    />

                    <Input
                      label="Target Role"
                      name="targetRole"
                      placeholder="e.g. Product Manager, Founder, VC"
                      value={formData.targetRole}
                      onChange={handleChange}
                      error={errors.targetRole}
                      icon={<Briefcase size={18} />}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        icon={<Mail size={18} />}
                      />
                      
                      <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        icon={<Phone size={18} />}
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        fullWidth 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : (
                          <>
                            Proceed to Payment <ArrowRight size={18} />
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-400 text-center mt-3">
                        <Lock size={12} className="inline mr-1" />
                        Secure Payment on next step
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-blue">
                      <Lock size={32} />
                   </div>
                   <h2 className="text-xl font-bold mb-2">Redirecting to Payment Gateway...</h2>
                   <p className="text-gray-500 mb-6">Please do not refresh the page.</p>
                   <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 overflow-hidden">
                      <div className="bg-brand-blue h-2.5 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{width: '45%'}}></div>
                   </div>
                </div>
              )}
            </div>
            
            {/* Testimonials / Trust Signals */}
            <div className="bg-[#E7EEF5] rounded-xl p-6 flex items-start gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm text-2xl">😎</div>
              <div>
                <p className="text-sm font-medium text-gray-800 italic">"The review completely changed how I approach networking. Highly recommended!"</p>
                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">- Amit S., Founder</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-5">
            <OrderSummary />
          </div>

        </div>
      </main>

      <footer className="w-full border-t border-gray-200 mt-12 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>© 2025 Linkni. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Custom Animation for loader */}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default App;