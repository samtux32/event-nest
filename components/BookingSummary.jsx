import React from 'react';
import { Star, MapPin, Clock, Info, Check } from 'lucide-react';

export default function BookingSummary({ vendor, selectedPackage }) {
  const packageData = vendor.packages.find(pkg => pkg.id === selectedPackage);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <img 
          src={vendor.profileImage}
          alt={vendor.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div>
          <h3 className="font-bold text-lg">{vendor.name}</h3>
          <p className="text-sm text-purple-600 font-medium">{vendor.category}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="text-yellow-400 fill-yellow-400" size={14} />
            <span className="text-sm font-semibold">{vendor.rating}</span>
            <span className="text-sm text-gray-500">({vendor.reviews})</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          {vendor.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-gray-400" />
          Responds in ~{vendor.responseTime}
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-4 mb-4">
        <h4 className="font-bold mb-2">Selected Package</h4>
        <p className="text-2xl font-bold text-purple-600 mb-1">
          {packageData?.price}
        </p>
        <p className="text-sm text-gray-600 mb-3">{packageData?.name} Package</p>
        <ul className="space-y-2">
          {packageData?.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <Check size={14} className="text-purple-600 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">
            What happens next?
          </p>
          <p className="text-xs text-blue-700">
            The vendor will review your request and send you a detailed quote within {vendor.responseTime}. You can then discuss details via message before confirming.
          </p>
        </div>
      </div>
    </div>
  );
}
