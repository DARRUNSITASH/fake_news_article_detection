import requests
import json
import time
from text_preprocessing import TextPreprocessor

class GoogleAIService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-pro"
        self.preprocessor = TextPreprocessor()
    
    def analyze_news(self, content):
        """Analyze news content using Google Gemini AI"""
        try:
            # Preprocess content
            processed_content = self.preprocessor.preprocess(content)
            
            # Create analysis prompt
            prompt = self._create_analysis_prompt(content)
            
            # Make API request
            response = self._make_api_request(prompt)
            
            if response and 'candidates' in response:
                generated_text = response['candidates'][0]['content']['parts'][0]['text']
                return self._parse_ai_response(generated_text)
            else:
                raise Exception("Invalid API response format")
                
        except Exception as e:
            print(f"Google AI analysis failed: {e}")
            # Fallback to simple rule-based analysis
            return self._fallback_analysis(content)
    
    def _create_analysis_prompt(self, content):
        """Create a detailed analysis prompt for the AI model"""
        return f"""
You are an expert fake news detection system. Analyze the following news content and determine if it's REAL or FAKE news.

Consider these factors:
1. Factual accuracy and verifiability of claims
2. Source credibility indicators
3. Emotional manipulation or sensational language
4. Logical consistency and coherence
5. Potential bias or agenda
6. Writing style and professionalism
7. Use of evidence and citations

News Content to Analyze:
"{content}"

Please provide your analysis in this exact JSON format:
{{"prediction": "REAL" or "FAKE", "confidence": number between 0.70 and 1.00, "reasoning": "brief explanation"}}

Be precise and objective in your assessment.
"""
    
    def _make_api_request(self, prompt):
        """Make API request to Google Gemini"""
        url = f"{self.base_url}/models/{self.model}:generateContent"
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(
            f"{url}?key={self.api_key}",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")
    
    def _parse_ai_response(self, generated_text):
        """Parse AI response and extract prediction"""
        try:
            # Look for JSON in the response
            import re
            json_match = re.search(r'\{[^}]*\}', generated_text)
            
            if json_match:
                result = json.loads(json_match.group())
                prediction = result.get('prediction', 'REAL')
                confidence = float(result.get('confidence', 0.8))
                
                # Validate prediction
                if prediction not in ['REAL', 'FAKE']:
                    prediction = 'REAL'
                
                # Clamp confidence
                confidence = max(0.7, min(1.0, confidence))
                
                return {
                    'prediction': prediction,
                    'confidence': confidence
                }
            else:
                # Fallback parsing
                if 'FAKE' in generated_text.upper():
                    return {'prediction': 'FAKE', 'confidence': 0.85}
                else:
                    return {'prediction': 'REAL', 'confidence': 0.80}
                    
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return {'prediction': 'REAL', 'confidence': 0.75}
    
    def _fallback_analysis(self, content):
        """Fallback analysis when AI fails"""
        try:
            # Simple rule-based analysis
            content_lower = content.lower()
            
            # Fake news indicators
            fake_indicators = [
                'shocking', 'urgent', 'breaking news', 'miracle', 'secret',
                'exposed', 'incredible', 'amazing', 'forbidden', 'conspiracy',
                'doctors hate', 'they don\'t want you to know', 'one weird trick',
                'this will shock you', 'unbelievable', 'stunning revelation'
            ]
            
            # Real news indicators
            real_indicators = [
                'according to', 'study shows', 'research indicates', 'data reveals',
                'scientists', 'university', 'published', 'peer-reviewed',
                'evidence suggests', 'analysis found', 'report states'
            ]
            
            fake_score = sum(1 for indicator in fake_indicators if indicator in content_lower)
            real_score = sum(1 for indicator in real_indicators if indicator in content_lower)
            
            # Additional factors
            exclamation_count = content.count('!')
            caps_words = sum(1 for word in content.split() if word.isupper() and len(word) > 2)
            
            fake_score += exclamation_count * 0.3 + caps_words * 0.2
            
            # Determine prediction
            if fake_score > real_score + 1:
                prediction = 'FAKE'
                confidence = min(0.9, 0.7 + (fake_score - real_score) * 0.05)
            else:
                prediction = 'REAL'
                confidence = min(0.9, 0.7 + (real_score - fake_score) * 0.05)
            
            return {
                'prediction': prediction,
                'confidence': max(0.7, confidence)
            }
            
        except Exception as e:
            print(f"Fallback analysis error: {e}")
            return {'prediction': 'REAL', 'confidence': 0.7}