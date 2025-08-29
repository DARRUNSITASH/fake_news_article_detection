export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  prediction: 'REAL' | 'FAKE' | null;
  confidence: number;
  method: 'AI' | 'ML' | null;
  timestamp: Date;
}

export interface Dataset {
  id: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

export interface AdminStats {
  totalVerifications: number;
  realNews: number;
  fakeNews: number;
  averageConfidence: number;
  recentActivity: NewsArticle[];
}