import React from 'react';
import { Check } from 'lucide-react';

export default function AdditionalServices({ selectedServices, onToggleService }) {
  const serviceOptions = [
    'Early setup / late breakdown',
    'Travel to venue',
    'Express / rush booking',
    'Additional hours',
    'Weekend / bank holiday',
    'Custom extras'
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Additional Services (Optional)</h2>
      <div className="grid grid-cols-2 gap-3">
        {serviceOptions.map((service) => (
          <div
            key={service}
            onClick={() => onToggleService(service)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedServices.includes(service)
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedServices.includes(service)
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-gray-300'
              }`}>
                {selectedServices.includes(service) && (
                  <Check size={14} className="text-white" />
                )}
              </div>
              <span className="font-medium text-gray-900">{service}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
