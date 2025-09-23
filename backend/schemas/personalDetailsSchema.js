const mongoose = require("mongoose");

const personalDetailsSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female']
  },
  dateOfBirth: {
    year: {
      type: Number,
      required: [true, 'Birth year is required'],
      min: [1924, 'Year must be valid'],
      max: [2009, 'Must be at least 16 years old']
    },
    month: {
      type: Number,
      required: [true, 'Birth month is required'],
      min: 1,
      max: 12
    },
    day: {
      type: Number,
      required: [true, 'Birth day is required'],
      min: 1,
      max: 31
    }
  },
  timeOfBirth: {
    hour: {
      type: Number,
      min: 0,
      max: 23,
      default: null
    },
    minute: {
      type: Number,
      min: 0,
      max: 59,
      default: null
    }
  },
  birthPlace: {
    type: String,
    required: [true, 'Birth place is required'],
    trim: true,
    maxlength: [200, 'Birth place cannot exceed 200 characters']
  },
  height: {
    value: {
      type: String,
      default: null
    },
    unit: {
      type: String,
      enum: ['cms', 'feet'],
      default: 'cms'
    }
  },
  weight: {
    value: {
      type: Number,
      min: [20, 'Weight must be at least 20'],
      max: [500, 'Weight cannot exceed 500'],
      default: null
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  astrologicalSign: {
    type: String,
    enum: [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 
      'Leo', 'Virgo', 'Libra', 'Scorpio', 
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ],
    default: null
  },
  // Calculated fields
  calculatedAge: {
    type: Number,
    default: null
  },
  isEligible: {
    type: Boolean,
    default: true
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

// Pre-save middleware to calculate age and validate eligibility
personalDetailsSchema.pre('save', function(next) {
  // Calculate age
  const birthDate = new Date(this.dateOfBirth.year, this.dateOfBirth.month - 1, this.dateOfBirth.day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  this.calculatedAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
  
  // Check eligibility
  const minAge = this.gender === 'Male' ? 21 : 18;
  const maxAge = 40;
  
  this.isEligible = this.calculatedAge >= minAge && this.calculatedAge <= maxAge;
  
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
personalDetailsSchema.index({ createdAt: -1 });
personalDetailsSchema.index({ gender: 1, calculatedAge: 1 });
personalDetailsSchema.index({ astrologicalSign: 1 });

module.exports = mongoose.model('PersonalDetails', personalDetailsSchema);