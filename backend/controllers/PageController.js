const PersonalDetails = require('../schemas/personalDetailsSchema');
require('dotenv').config();

const create = async (req, res) => {
  try {
    const personalDetails = new PersonalDetails({
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    
    const savedDetails = await personalDetails.save();
    
    res.status(201).json({
      success: true,
      message: 'Personal details saved successfully',
      data: savedDetails,
      id: savedDetails._id
    });
    
  } catch (error) {
    console.error('Error saving personal details:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.astrologicalSign) filter.astrologicalSign = req.query.astrologicalSign;
    if (req.query.isEligible !== undefined) filter.isEligible = req.query.isEligible === 'true';
    
    // Age range filter
    if (req.query.minAge || req.query.maxAge) {
      filter.calculatedAge = {};
      if (req.query.minAge) filter.calculatedAge.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) filter.calculatedAge.$lte = parseInt(req.query.maxAge);
    }
    
    const [details, totalCount] = await Promise.all([
      PersonalDetails.find(filter)
        .select('-ipAddress -userAgent') // Exclude sensitive fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PersonalDetails.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: details,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + details.length < totalCount,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching personal details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const getById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const details = await PersonalDetails.findById(req.params.id)
      .select('-ipAddress -userAgent');
    
    if (!details) {
      return res.status(404).json({
        success: false,
        message: 'Personal details not found'
      });
    }
    
    res.json({
      success: true,
      data: details
    });
    
  } catch (error) {
    console.error('Error fetching personal details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const udpateById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const updatedDetails = await PersonalDetails.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-ipAddress -userAgent');
    
    if (!updatedDetails) {
      return res.status(404).json({
        success: false,
        message: 'Personal details not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Personal details updated successfully',
      data: updatedDetails
    });
    
  } catch (error) {
    console.error('Error updating personal details:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const deleteById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    const deletedDetails = await PersonalDetails.findByIdAndDelete(req.params.id);
    
    if (!deletedDetails) {
      return res.status(404).json({
        success: false,
        message: 'Personal details not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Personal details deleted successfully',
      deletedId: req.params.id
    });
    
  } catch (error) {
    console.error('Error deleting personal details:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const stats = async (req, res) => {
  try {
    const [
      totalUsers,
      eligibleUsers,
      genderStats,
      ageStats,
      signStats
    ] = await Promise.all([
      PersonalDetails.countDocuments(),
      PersonalDetails.countDocuments({ isEligible: true }),
      PersonalDetails.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      PersonalDetails.aggregate([
        {
          $group: {
            _id: null,
            avgAge: { $avg: '$calculatedAge' },
            minAge: { $min: '$calculatedAge' },
            maxAge: { $max: '$calculatedAge' }
          }
        }
      ]),
      PersonalDetails.aggregate([
        { $match: { astrologicalSign: { $ne: null } } },
        { $group: { _id: '$astrologicalSign', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        eligibleUsers,
        eligibilityRate: totalUsers > 0 ? ((eligibleUsers / totalUsers) * 100).toFixed(2) : 0,
        genderDistribution: genderStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ageStatistics: ageStats[0] || { avgAge: 0, minAge: 0, maxAge: 0 },
        popularSigns: signStats.slice(0, 5)
      }
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
    create,
    getAll,
    getById,
    udpateById,
    deleteById,
    stats
}