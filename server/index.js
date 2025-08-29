import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuration
const ADMIN_PASSWORD_HASH = crypto.createHash('sha256').update('admin123').digest('hex');
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    cb(null, `${id}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// In-memory storage (replace with actual database in production)
let datasets = [];
let verifications = [];
let trainingData = [];

// Mock AI service
class MockAIService {
  async analyzeNews(content) {
    // Simulate AI analysis with some basic heuristics
    const suspiciousWords = ['breaking', 'shocking', 'unbelievable', 'exclusive', 'leaked'];
    const wordCount = content.split(' ').length;
    const suspiciousCount = suspiciousWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    const isFake = suspiciousCount > 2 || wordCount < 50;
    const confidence = Math.random() * 0.3 + (isFake ? 0.6 : 0.7);
    
    return {
      prediction: isFake ? 'FAKE' : 'REAL',
      confidence: Math.round(confidence * 100) / 100
    };
  }
}

// Mock ML model
class MockMLModel {
  predict(content) {
    // Simple heuristic-based prediction
    const words = content.toLowerCase().split(' ');
    const fakeIndicators = ['fake', 'hoax', 'conspiracy', 'secret', 'hidden'];
    const score = fakeIndicators.filter(indicator => 
      words.some(word => word.includes(indicator))
    ).length;
    
    const isFake = score > 0 || Math.random() > 0.6;
    const confidence = Math.random() * 0.2 + 0.7;
    
    return {
      prediction: isFake ? 'FAKE' : 'REAL',
      confidence: Math.round(confidence * 100) / 100
    };
  }

  getMetrics() {
    return {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85,
      confusionMatrix: {
        truePositive: 42,
        falsePositive: 8,
        trueNegative: 38,
        falseNegative: 12
      }
    };
  }

  retrain(data) {
    // Simulate retraining
    return true;
  }
}

const aiService = new MockAIService();
const mlModel = new MockMLModel();

// Routes
app.post('/api/verify', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    if (content.length < 50) {
      return res.status(400).json({ error: 'Content too short for accurate analysis' });
    }
    
    let result;
    let method;
    
    try {
      // Try AI first
      result = await aiService.analyzeNews(content);
      method = 'AI';
    } catch (aiError) {
      console.log('AI analysis failed, using ML fallback:', aiError.message);
      result = mlModel.predict(content);
      method = 'ML';
    }
    
    // Store verification
    const verification = {
      id: uuidv4(),
      content: content.substring(0, 500),
      prediction: result.prediction,
      confidence: result.confidence,
      method,
      timestamp: new Date().toISOString()
    };
    
    verifications.push(verification);
    
    res.json({
      id: verification.id,
      title: 'Analyzed Article',
      content,
      prediction: result.prediction,
      confidence: result.confidence,
      method,
      timestamp: verification.timestamp
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (passwordHash === ADMIN_PASSWORD_HASH) {
      const token = crypto.createHash('sha256').update(`${password}${Date.now()}`).digest('hex');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/api/admin/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    if (!req.file.originalname.endsWith('.csv')) {
      return res.status(400).json({ error: 'Invalid file format. CSV required.' });
    }
    
    const dataset = {
      id: uuidv4(),
      filename: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      processed: true
    };
    
    datasets.push(dataset);
    
    // Simulate processing CSV data
    const sampleData = [
      { content: 'Sample real news content', label: 0 },
      { content: 'Sample fake news content', label: 1 }
    ];
    
    sampleData.forEach(item => {
      trainingData.push({
        id: uuidv4(),
        content: item.content,
        label: item.label,
        datasetId: dataset.id
      });
    });
    
    res.json(dataset);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/admin/datasets', (req, res) => {
  try {
    res.json(datasets);
  } catch (error) {
    console.error('Get datasets error:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

app.get('/api/admin/metrics', (req, res) => {
  try {
    const metrics = mlModel.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  try {
    const totalVerifications = verifications.length;
    const realNews = verifications.filter(v => v.prediction === 'REAL').length;
    const fakeNews = verifications.filter(v => v.prediction === 'FAKE').length;
    const avgConfidence = verifications.length > 0 
      ? verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length 
      : 0;
    
    res.json({
      totalVerifications,
      realNews,
      fakeNews,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      recentActivity: verifications.slice(-10).reverse()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.post('/api/admin/retrain', (req, res) => {
  try {
    if (trainingData.length < 10) {
      return res.json({ 
        success: false, 
        message: 'Insufficient training data' 
      });
    }
    
    // Simulate retraining
    mlModel.retrain(trainingData);
    
    res.json({
      success: true,
      message: `Model retrained successfully with ${trainingData.length} samples!`
    });
  } catch (error) {
    console.error('Retrain error:', error);
    res.json({ 
      success: false, 
      message: 'Retraining failed' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});