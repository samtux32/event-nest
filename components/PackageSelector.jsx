import React from 'react';
import { Check } from 'lucide-react';

export default function PackageSelector({ packages, selectedPackage, onSelectPackage }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Select a Package</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPackage === pkg.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            {pkg.popular && (
              <div className="inline-block px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full mb-2">
                POPULAR
              </div>
            )}
            <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
            <p className="text-lg sm:text-2xl font-bold text-purple-600 mb-2">{pkg.price}</p>
            <p className="text-sm text-gray-500">{pkg.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
