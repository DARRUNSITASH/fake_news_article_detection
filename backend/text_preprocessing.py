import re
import string
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
import nltk

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class TextPreprocessor:
    def __init__(self):
        self.stemmer = PorterStemmer()
        self.stop_words = set(stopwords.words('english'))
        
        # Add custom stop words for news domain
        custom_stops = {
            'said', 'says', 'according', 'reported', 'reports', 'news',
            'article', 'story', 'breaking', 'update', 'latest', 'new'
        }
        self.stop_words.update(custom_stops)
    
    def clean_text(self, text):
        """Clean and normalize text"""
        if not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove HTML tags
        text = re.sub(r'<.*?>', '', text)
        
        # Remove special characters and digits, keep only letters and spaces
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_text(self, text):
        """Tokenize text into words"""
        try:
            tokens = word_tokenize(text)
            return tokens
        except:
            # Fallback tokenization
            return text.split()
    
    def remove_stopwords(self, tokens):
        """Remove stop words from tokens"""
        return [token for token in tokens if token not in self.stop_words and len(token) > 2]
    
    def stem_tokens(self, tokens):
        """Apply stemming to tokens"""
        return [self.stemmer.stem(token) for token in tokens]
    
    def preprocess(self, text):
        """Complete preprocessing pipeline"""
        if not text or not isinstance(text, str):
            return ""
        
        # Clean text
        cleaned_text = self.clean_text(text)
        
        if not cleaned_text:
            return ""
        
        # Tokenize
        tokens = self.tokenize_text(cleaned_text)
        
        # Remove stop words
        filtered_tokens = self.remove_stopwords(tokens)
        
        # Apply stemming
        stemmed_tokens = self.stem_tokens(filtered_tokens)
        
        # Join back into string
        processed_text = ' '.join(stemmed_tokens)
        
        return processed_text
    
    def extract_features(self, text):
        """Extract various text features for analysis"""
        if not text or not isinstance(text, str):
            return {}
        
        features = {}
        
        # Basic text statistics
        features['char_count'] = len(text)
        features['word_count'] = len(text.split())
        features['sentence_count'] = len(re.split(r'[.!?]+', text))
        
        # Punctuation features
        features['exclamation_count'] = text.count('!')
        features['question_count'] = text.count('?')
        features['punctuation_ratio'] = sum(1 for c in text if c in string.punctuation) / len(text) if text else 0
        
        # Capitalization features
        features['caps_count'] = sum(1 for c in text if c.isupper())
        features['caps_ratio'] = features['caps_count'] / len(text) if text else 0
        
        # Word-level features
        words = text.split()
        if words:
            features['avg_word_length'] = sum(len(word) for word in words) / len(words)
            features['long_words'] = sum(1 for word in words if len(word) > 6)
            features['short_words'] = sum(1 for word in words if len(word) <= 3)
        else:
            features['avg_word_length'] = 0
            features['long_words'] = 0
            features['short_words'] = 0
        
        # Sensational language indicators
        sensational_words = [
            'shocking', 'amazing', 'incredible', 'unbelievable', 'stunning',
            'miracle', 'secret', 'hidden', 'exposed', 'revealed', 'urgent',
            'breaking', 'exclusive', 'conspiracy', 'scandal'
        ]
        
        text_lower = text.lower()
        features['sensational_count'] = sum(1 for word in sensational_words if word in text_lower)
        features['sensational_ratio'] = features['sensational_count'] / len(words) if words else 0
        
        return features
    
    def get_readability_score(self, text):
        """Calculate simple readability metrics"""
        if not text or not isinstance(text, str):
            return 0
        
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not words or not sentences:
            return 0
        
        # Simple readability approximation
        avg_sentence_length = len(words) / len(sentences)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Lower scores indicate easier readability
        readability = (avg_sentence_length * 1.015) + (avg_word_length * 84.6) - 206.835
        
        return max(0, min(100, readability))