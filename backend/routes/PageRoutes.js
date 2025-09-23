const pageController = require('../controllers/PageController');

app.post('/api/personal-details', pageController.create);

// Get all personal details (with pagination and filtering)
app.get('/api/personal-details', pageController.getAll);

// Get personal details by ID
app.get('/api/personal-details/:id', pageController.getById);

// Update personal details
app.put('/api/personal-details/:id', pageController.udpateById);

// Delete personal details
app.delete('/api/personal-details/:id', pageController.deleteById);

// Get statistics
app.get('/api/stats', pageController.stats);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});