'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Star, 
  Heart,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  ChevronDown,
  FileText,
  Download
} from 'lucide-react';

export default function VendorProfile() {
  const [activeTab, setActiveTab] = useState('about');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // This would come from your database/API
  const vendor = {
    id: 1,
    name: 'The Silver Vows',
    category: 'Photography',
    coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    location: 'London, UK',
    description: 'Award-winning wedding photography studio specializing in natural, candid moments. We capture the authentic emotions and unforgettable moments of your special day with a creative and documentary style.',
    rating: 4.9,
    reviewCount: 127,
    completedEvents: 250,
    responseTime: '2 hours',
    
    pricing: {
      perDay: '£800',
      perHead: null,
      packages: [
        { name: 'Half Day', price: '£800', details: '4 hours coverage, 200+ edited photos' },
        { name: 'Full Day', price: '£1,200', details: '8 hours coverage, 400+ edited photos, online gallery' },
        { name: 'Premium', price: '£1,800', details: 'Full day + engagement shoot, premium album, unlimited photos' }
      ],
      customQuotes: true
    },
    
    contact: {
      phone: '+44 7700 900123',
      email: 'hello@silvervows.co.uk',
      website: 'www.silvervows.co.uk',
      socials: {
        instagram: '@silvervowsphoto',
        facebook: 'SilverVowsPhotography',
        twitter: null
      }
    },
    
    portfolio: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1525258320-effbf21662cf?w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
      'https://images.unsplash.com/photo-1522673607212-51071b9d51aa?w=800',
      'https://images.unsplash.com/photo-1460364157752-926555421a7e?w=800'
    ],
    
    documents: [
      { name: 'Public Liability Insurance', type: 'PDF', size: '2.3 MB', verified: true },
      { name: 'Professional Indemnity Insurance', type: 'PDF', size: '1.8 MB', verified: true },
      { name: 'Business License', type: 'PDF', size: '1.2 MB', verified: true }
    ],
    
    reviews: [
      {
        id: 1,
        name: 'Sarah & Tom',
        rating: 5,
        date: 'January 2026',
        comment: 'Absolutely incredible! They captured our day perfectly. The photos are stunning and we couldn\'t be happier. Highly recommend!',
        eventDate: 'December 2025'
      },
      {
        id: 2,
        name: 'Emily Johnson',
        rating: 5,
        date: 'December 2025',
        comment: 'Professional, creative, and so easy to work with. The photos exceeded all our expectations. Worth every penny!',
        eventDate: 'November 2025'
      },
      {
        id: 3,
        name: 'James & Lisa',
        rating: 4,
        date: 'November 2025',
        comment: 'Great photographer with an eye for detail. Very professional and delivered all photos on time.',
        eventDate: 'October 2025'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/marketplace" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
            Back to Marketplace
          </Link>
        </div>
      </header>

      {/* Cover Photo & Profile Section */}
      <div className="relative">
        <div className="h-96 bg-gray-200">
          <img 
            src={vendor.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative -mt-32 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <img 
                  src={vendor.profileImage}
                  alt={vendor.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{vendor.name}</h1>
                    <button 
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Heart 
                        size={24} 
                        className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>
                  
                  <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
                    {vendor.category}
                  </span>
                  
                  <div className="flex items-center gap-6 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{vendor.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={18} />
                      <span className="font-semibold text-gray-900">{vendor.rating}</span>
                      <span>({vendor.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} />
                      <span>Responds in {vendor.responseTime}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed max-w-3xl">
                    {vendor.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Mail size={20} />
                  Send Inquiry
                </button>
                <button className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-2 flex gap-2">
          {['about', 'portfolio', 'reviews', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'about' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Pricing */}
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Pricing & Packages</h2>
                
                <div className="space-y-4">
                  {vendor.pricing.packages.map((pkg, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-purple-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                          <p className="text-gray-600">{pkg.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-600">{pkg.price}</p>
                        </div>
                      </div>
                      <button className="w-full mt-4 bg-purple-100 text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                        Select Package
                      </button>
                    </div>
                  ))}
                </div>
                
                {vendor.pricing.customQuotes && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="text-purple-900 font-medium">
                      💬 Custom packages available - Request a personalized quote for your specific needs
                    </p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                  <p className="text-4xl font-bold text-purple-600 mb-2">{vendor.completedEvents}</p>
                  <p className="text-gray-600">Events Completed</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                  <p className="text-4xl font-bold text-purple-600 mb-2">{vendor.rating}</p>
                  <p className="text-gray-600">Average Rating</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                  <p className="text-4xl font-bold text-purple-600 mb-2">{vendor.responseTime}</p>
                  <p className="text-gray-600">Response Time</p>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <a href={`tel:${vendor.contact.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors">
                    <Phone size={20} />
                    <span>{vendor.contact.phone}</span>
                  </a>
                  
                  <a href={`mailto:${vendor.contact.email}`} className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors">
                    <Mail size={20} />
                    <span>{vendor.contact.email}</span>
                  </a>
                  
                  <a href={`https://${vendor.contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors">
                    <Globe size={20} />
                    <span>{vendor.contact.website}</span>
                  </a>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">Follow Us</h4>
                  <div className="flex gap-3">
                    {vendor.contact.socials.instagram && (
                      <a href={`https://instagram.com/${vendor.contact.socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors">
                        <Instagram size={20} />
                      </a>
                    )}
                    {vendor.contact.socials.facebook && (
                      <a href={`https://facebook.com/${vendor.contact.socials.facebook}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors">
                        <Facebook size={20} />
                      </a>
                    )}
                    {vendor.contact.socials.twitter && (
                      <a href={`https://twitter.com/${vendor.contact.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors">
                        <Twitter size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
            <div className="grid grid-cols-3 gap-4">
              {vendor.portfolio.map((image, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                  <img 
                    src={image} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            
            <div className="space-y-6">
              {vendor.reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{review.name}</h3>
                      <p className="text-sm text-gray-500">Event: {review.eventDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Certificates & Documents</h2>
            
            <div className="space-y-4">
              {vendor.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{doc.name}</h3>
                        {doc.verified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <Download size={18} />
                    <span className="font-medium">View</span>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-green-900 font-medium">
                ✓ All documents have been verified by Event Nest
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
