const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();

// Import routes
const userRoutes = require('./routes/userRoutes.js');
const trendingNewsRoutes = require('./routes/trendingNewsRoutes.js');
const opportunitiesRoutes = require('./routes/opportunitiesRoutes.js');
const eventsRoutes = require('./routes/eventsRoutes.js');
const sportsRoutes = require('./routes/sportsRoutes.js');
const projectsRoutes = require('./routes/projectsRoutes.js');
const didYouKnowRoutes = require('./routes/didYouKnowRoutes.js');
const visitorsRoutes = require('./routes/visitorsRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const postsRoutes = require('./routes/postsRoutes.js');
const itItemRoutes = require('./routes/itItemRoutes.js');
const deviceActionRoutes = require('./routes/deviceActions.js');
const uploadRoutes = require('./routes/uploadRoutes.js');

// connect to the database
const connectDB = require('./config/db.js');

// Middlewares
app.use(cors());

// Increase payload limits for handling large images
app.use(express.json({ limit: '50mb' })); // Increase from default 100kb to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory with proper headers for PDFs
app.use('/uploads', (req, res, next) => {
  // If it's a PDF file, set Content-Disposition to inline
  if (req.path.endsWith('.pdf')) {
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', 'application/pdf');
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/users', userRoutes); // Mount user routes at /api/users
app.use('/api/trending-news', trendingNewsRoutes); // Mount trending news routes
app.use('/api/opportunities', opportunitiesRoutes); // Mount opportunities routes
app.use('/api/events', eventsRoutes); // Mount events routes
app.use('/api/sports', sportsRoutes); // Mount sports routes
app.use('/api/projects', projectsRoutes); // Mount projects routes
app.use('/api/did-you-know', didYouKnowRoutes); // Mount did you know routes
app.use('/api/visitors', visitorsRoutes); // Mount visitors routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes
app.use('/api/posts', postsRoutes); // Mount posts routes
app.use('/api/it-items', itItemRoutes); // Mount IT items routes
app.use('/api/device-actions', deviceActionRoutes); // Mount device actions routes
app.use('/api/upload', uploadRoutes); // Mount upload routes

// Root route
app.get('/', (req, res) => {
  res.send('ASYV Trendings API is running...');
});

const PORT = process.env.PORT || 5000;
// Start the server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to the database:', err);
});