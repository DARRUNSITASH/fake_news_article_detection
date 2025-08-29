from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd
import json
import os
from datetime import datetime
import hashlib
import uuid

# Import our ML model and AI service
from ml_model import FakeNewsMLModel
from ai_service import GoogleAIService
from text_preprocessing import TextPreprocessor

app = Flask(__name__)
CORS(app)

# Configuration
ADMIN_PASSWORD_HASH = hashlib.sha256('admin123'.encode()).hexdigest()
DB_PATH = 'fake_news_db.sqlite'
UPLOAD_FOLDER = 'uploads'

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize ML model and AI service
ml_model = FakeNewsMLModel()
ai_service = GoogleAIService('AIzaSyAMmyPGhsi1EZO1od1BLn2NeivF_YFVdTU')

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            size INTEGER NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed BOOLEAN DEFAULT FALSE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS verifications (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            prediction TEXT NOT NULL,
            confidence REAL NOT NULL,
            method TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS training_data (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            label INTEGER NOT NULL,
            dataset_id TEXT,
            FOREIGN KEY (dataset_id) REFERENCES datasets (id)
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/api/verify', methods=['POST'])
def verify_news():
    """Verify news content using AI and ML models"""
    try:
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        if len(content) < 50:
            return jsonify({'error': 'Content too short for accurate analysis'}), 400
        
        # Try AI first, fallback to ML
        try:
            result = ai_service.analyze_news(content)
            method = 'AI'
        except Exception as ai_error:
            print(f"AI analysis failed: {ai_error}")
            result = ml_model.predict(content)
            method = 'ML'
        
        # Store verification in database
        verification_id = str(uuid.uuid4())
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO verifications (id, content, prediction, confidence, method, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (verification_id, content[:500], result['prediction'], result['confidence'], method, datetime.now()))
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': verification_id,
            'title': 'Analyzed Article',
            'content': content,
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'method': method,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Verification error: {e}")
        return jsonify({'error': 'Verification failed'}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if password_hash == ADMIN_PASSWORD_HASH:
            # Generate simple token
            token = hashlib.sha256(f"{password}{datetime.now()}".encode()).hexdigest()
            return jsonify({'success': True, 'token': token})
        else:
            return jsonify({'success': False}), 401
            
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'success': False}), 500

@app.route('/api/admin/upload', methods=['POST'])
def upload_dataset():
    """Upload training dataset"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '' or not file.filename.endswith('.csv'):
            return jsonify({'error': 'Invalid file format. CSV required.'}), 400
        
        # Save file
        dataset_id = str(uuid.uuid4())
        filename = f"{dataset_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Process CSV
        try:
            df = pd.read_csv(file_path)
            if 'content' not in df.columns or 'label' not in df.columns:
                return jsonify({'error': 'CSV must contain "content" and "label" columns'}), 400
            
            # Store dataset info
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO datasets (id, filename, size, uploaded_at, processed)
                VALUES (?, ?, ?, ?, ?)
            ''', (dataset_id, file.filename, os.path.getsize(file_path), datetime.now(), True))
            
            # Store training data
            for _, row in df.iterrows():
                cursor.execute('''
                    INSERT INTO training_data (id, content, label, dataset_id)
                    VALUES (?, ?, ?, ?)
                ''', (str(uuid.uuid4()), str(row['content'])[:1000], int(row['label']), dataset_id))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                'id': dataset_id,
                'filename': file.filename,
                'size': os.path.getsize(file_path),
                'uploadedAt': datetime.now().isoformat(),
                'processed': True
            })
            
        except Exception as process_error:
            print(f"CSV processing error: {process_error}")
            return jsonify({'error': 'Failed to process CSV file'}), 400
            
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': 'Upload failed'}), 500

@app.route('/api/admin/datasets', methods=['GET'])
def get_datasets():
    """Get all uploaded datasets"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM datasets ORDER BY uploaded_at DESC')
        datasets = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': row[0],
            'filename': row[1],
            'size': row[2],
            'uploadedAt': row[3],
            'processed': bool(row[4])
        } for row in datasets])
        
    except Exception as e:
        print(f"Get datasets error: {e}")
        return jsonify({'error': 'Failed to fetch datasets'}), 500

@app.route('/api/admin/metrics', methods=['GET'])
def get_metrics():
    """Get model performance metrics"""
    try:
        metrics = ml_model.get_metrics()
        return jsonify(metrics)
    except Exception as e:
        print(f"Get metrics error: {e}")
        return jsonify({'error': 'Failed to fetch metrics'}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    """Get admin statistics"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get verification stats
        cursor.execute('SELECT COUNT(*) FROM verifications')
        total_verifications = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM verifications WHERE prediction = "REAL"')
        real_news = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM verifications WHERE prediction = "FAKE"')
        fake_news = cursor.fetchone()[0]
        
        cursor.execute('SELECT AVG(confidence) FROM verifications')
        avg_confidence = cursor.fetchone()[0] or 0.0
        
        conn.close()
        
        return jsonify({
            'totalVerifications': total_verifications,
            'realNews': real_news,
            'fakeNews': fake_news,
            'averageConfidence': avg_confidence,
            'recentActivity': []
        })
        
    except Exception as e:
        print(f"Get stats error: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

@app.route('/api/admin/retrain', methods=['POST'])
def retrain_model():
    """Retrain the ML model"""
    try:
        # Get training data from database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT content, label FROM training_data')
        training_data = cursor.fetchall()
        conn.close()
        
        if len(training_data) < 10:
            return jsonify({'success': False, 'message': 'Insufficient training data'})
        
        # Retrain model (simulation)
        ml_model.retrain(training_data)
        
        return jsonify({
            'success': True,
            'message': f'Model retrained successfully with {len(training_data)} samples!'
        })
        
    except Exception as e:
        print(f"Retrain error: {e}")
        return jsonify({'success': False, 'message': 'Retraining failed'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)