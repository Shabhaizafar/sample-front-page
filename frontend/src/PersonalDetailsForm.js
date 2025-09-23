import React, { useState } from 'react';
import { Calendar, User, MapPin, Weight, Star, Clock } from 'lucide-react';

const PersonalDetailsForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: {
      year: '',
      month: '',
      day: ''
    },
    timeOfBirth: {
      hour: '',
      minute: ''
    },
    birthPlace: '',
    height: {
      value: '',
      unit: 'cms'
    },
    weight: {
      value: '',
      unit: 'kg'
    },
    astrologicalSign: ''
  });

  const [errors, setErrors] = useState({});
  const [showAgeRedirect, setShowAgeRedirect] = useState(false);

  // Height options
  const heightOptions = [
    '4ft 6in / 137 cms',
    '4ft 7in / 139 cms', 
    '4ft 8in / 142 cms',
    '4ft 9in / 144 cms',
    '4ft 10in / 147 cms',
    '5ft 0in / 152 cms',
    '5ft 1in / 155 cms',
    '5ft 2in / 157 cms',
    '5ft 3in / 160 cms',
    '5ft 4in / 163 cms',
    '5ft 5in / 165 cms',
    '5ft 6in / 168 cms',
    '5ft 7in / 170 cms',
    '5ft 8in / 173 cms',
    '5ft 9in / 175 cms',
    '5ft 10in / 178 cms',
    '5ft 11in / 180 cms',
    '6ft 0in / 183 cms'
  ];

  // Astrological signs
  const astrologicalSigns = [
    { en: 'Aries', hi: 'मेष' },
    { en: 'Taurus', hi: 'वृषभ' },
    { en: 'Gemini', hi: 'मिथुन' },
    { en: 'Cancer', hi: 'कर्क' },
    { en: 'Leo', hi: 'सिंह' },
    { en: 'Virgo', hi: 'कन्या' },
    { en: 'Libra', hi: 'तुला' },
    { en: 'Scorpio', hi: 'वृश्चिक' },
    { en: 'Sagittarius', hi: 'धनु' },
    { en: 'Capricorn', hi: 'मकर' },
    { en: 'Aquarius', hi: 'कुम्भ' },
    { en: 'Pisces', hi: 'मीन' }
  ];

  const validateAge = (year, month, day, gender) => {
    if (!year || !month || !day) return true;
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    const exactAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
    
    const minAge = gender === 'Male' ? 21 : 18;
    const maxAge = 40;
    
    if (exactAge < minAge) {
      return `Minimum age for ${gender.toLowerCase()} is ${minAge} years`;
    }
    
    if (exactAge > maxAge) {
      setShowAgeRedirect(true);
      return `Maximum age limit is ${maxAge} years. Please visit our other site.`;
    }
    
    return true;
  };

  const handleInputChange = (field, value, subField = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (subField) {
        newData[field] = { ...newData[field], [subField]: value };
      } else {
        newData[field] = value;
      }
      
      // Clear errors when user starts typing
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (subField) {
          delete newErrors[`${field}.${subField}`];
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
      
      return newData;
    });
    
    // Validate age when date of birth or gender changes
    if (field === 'dateOfBirth' || field === 'gender') {
      const { year, month, day } = subField ? 
        { ...formData.dateOfBirth, [subField]: value } : 
        formData.dateOfBirth;
      const gender = field === 'gender' ? value : formData.gender;
      
      if (year && month && day && gender) {
        const ageValidation = validateAge(year, month, day, gender);
        if (ageValidation !== true) {
          setErrors(prev => ({ ...prev, dateOfBirth: ageValidation }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.dateOfBirth.year || !formData.dateOfBirth.month || !formData.dateOfBirth.day) {
      newErrors.dateOfBirth = 'Complete date of birth is required';
    }
    
    if (!formData.birthPlace.trim()) {
      newErrors.birthPlace = 'Birth place is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && !showAgeRedirect) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 70; year <= currentYear - 16; year++) {
      years.push(year);
    }
    return years;
  };

  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i.toString().padStart(2, '0'));
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Logo and Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-8 bg-pink-100 rounded border-2 border-dashed border-pink-300 flex items-center justify-center">
              <span className="text-xs font-bold text-pink-600">LOGO</span>
            </div>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <button className="text-purple-600 border-b-2 border-purple-600 pb-1 font-medium">Personal Details</button>
            <button className="text-gray-500">Education</button>
            <button className="text-gray-500">Family Details</button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Please provide with your basic personal details.</h3>
          
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter Full Name"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Male / Female</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {errors.gender}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.dateOfBirth.year}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value, 'year')}
              >
                <option value="">Year</option>
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.dateOfBirth.month}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value, 'month')}
              >
                <option value="">Month</option>
                {generateOptions(1, 12).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.dateOfBirth.day}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value, 'day')}
              >
                <option value="">Day</option>
                {generateOptions(1, 31).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {errors.dateOfBirth}
              </p>
            )}
            {showAgeRedirect && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You'll be redirected to our other site for users above 40.
                </p>
              </div>
            )}
          </div>

          {/* Time of Birth */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Time of Birth
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.timeOfBirth.hour}
                onChange={(e) => handleInputChange('timeOfBirth', e.target.value, 'hour')}
              >
                <option value="">Hour</option>
                {generateOptions(0, 23).map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              <select
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.timeOfBirth.minute}
                onChange={(e) => handleInputChange('timeOfBirth', e.target.value, 'minute')}
              >
                <option value="">Minute</option>
                {generateOptions(0, 59).map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Birth Place */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Birth Place
            </label>
            <input
              type="text"
              placeholder="Enter birth place"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.birthPlace ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.birthPlace}
              onChange={(e) => handleInputChange('birthPlace', e.target.value)}
            />
            {errors.birthPlace && (
              <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {errors.birthPlace}
              </p>
            )}
          </div>

          {/* Height */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={formData.height.value}
              onChange={(e) => handleInputChange('height', e.target.value, 'value')}
            >
              <option value="">Feet / cms</option>
              {heightOptions.map((height, index) => (
                <option key={index} value={height}>{height}</option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="inline w-4 h-4 mr-1" />
              Weight
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter weight"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.weight.value}
                onChange={(e) => handleInputChange('weight', e.target.value, 'value')}
              />
              <select
                className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.weight.unit}
                onChange={(e) => handleInputChange('weight', e.target.value, 'unit')}
              >
                <option value="kg">KG</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Astrological Sign */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="inline w-4 h-4 mr-1" />
              Astrological Sign (Rashi)
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={formData.astrologicalSign}
              onChange={(e) => handleInputChange('astrologicalSign', e.target.value)}
            >
              <option value="">Select option</option>
              {astrologicalSigns.map((sign, index) => (
                <option key={index} value={sign.en}>
                  {sign.en} ({sign.hi})
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            disabled={showAgeRedirect}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Save and Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;