// models/Opportunities.js
const mongoose = require('mongoose');

const opportunitiesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  // Optional rich content shown on details page (paragraphs, images, and PDFs)
  content: {
    type: [
      new mongoose.Schema({
        type: {
          type: String,
          enum: ['paragraph', 'image', 'pdf', 'link'],
          required: true
        },
        // Paragraph block
        text: {
          type: String,
          trim: true,
          maxlength: [5000, 'Paragraph cannot exceed 5000 characters']
        },
        // Image block
        url: {
          type: String,
          trim: true
        },
        caption: {
          type: String,
          trim: true,
          maxlength: [300, 'Caption cannot exceed 300 characters']
        },
        alt: {
          type: String,
          trim: true,
          maxlength: [200, 'Alt text cannot exceed 200 characters']
        },
        // PDF block
        title: {
          type: String,
          trim: true,
          maxlength: [200, 'PDF title cannot exceed 200 characters']
        },
        fileName: {
          type: String,
          trim: true
        }
      }, { _id: false, timestamps: false })
    ],
    default: []
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  applicationLink: {
    type: String,
    required: [true, 'Application link is required'],
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  publishedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
opportunitiesSchema.index({ category: 1, deadline: 1 });
opportunitiesSchema.index({ tags: 1 });
opportunitiesSchema.index({ deadline: 1 }); // For filtering active opportunities

module.exports = mongoose.model('Opportunities', opportunitiesSchema);