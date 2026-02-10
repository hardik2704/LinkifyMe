import React from 'react';
import { Check, User, CreditCard, FileText } from 'lucide-react';
import { CheckoutStep } from '../types';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: CheckoutStep.DETAILS, label: "Your Details", icon: User },
    { id: CheckoutStep.PAYMENT, label: "Payment", icon: CreditCard },
    { id: CheckoutStep.REVIEW, label: "Review", icon: FileText },
  ];

  return (
    <div className="w-full py-6 mb-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Connector Line */}
              {index > 0 && (
                <div 
                  className={`h-1 w-8 sm:w-20 mx-1 sm:mx-2 rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} 
                />
              )}

              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2 relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10
                    ${isActive 
                      ? 'bg-brand-blue border-brand-blue text-white shadow-lg scale-110' 
                      : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                >
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span 
                  className={`absolute -bottom-8 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300
                    ${isActive ? 'text-brand-blue font-bold' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};