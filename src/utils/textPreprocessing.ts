// Enhanced NLP text preprocessing utilities
export class TextPreprocessor {
  private static stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'are', 'as', 'able', 'about', 'above',
    'according', 'accordingly', 'across', 'actually', 'after', 'afterwards',
    'again', 'against', 'aint', 'all', 'allow', 'allows', 'almost', 'alone',
    'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst',
    'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything',
    'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate',
    'appropriate', 'around', 'aside', 'ask', 'asking', 'associated', 'available',
    'away', 'awfully', 'be', 'became', 'because', 'become', 'becomes', 'becoming',
    'been', 'before', 'beforehand', 'behind', 'being', 'believe', 'below',
    'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief',
    'but', 'by', 'came', 'can', 'cannot', 'cant', 'cause', 'causes', 'certain',
    'certainly', 'changes', 'clearly', 'co', 'com', 'come', 'comes', 'concerning',
    'consequently', 'consider', 'considering', 'contain', 'containing', 'contains',
    'corresponding', 'could', 'course', 'currently', 'said', 'says', 'according',
    'reported', 'reports', 'news', 'article', 'story', 'breaking', 'update', 'latest'
  ]);

  static cleanText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, ' ')
      // Remove email addresses
      .replace(/\S+@\S+/g, ' ')
      // Remove HTML tags
      .replace(/<[^>]*>/g, ' ')
      // Remove non-alphabetic characters except spaces
      .replace(/[^a-zA-Z\s]/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  static removeStopWords(text: string): string {
    return text
      .split(' ')
      .filter(word => word.length > 2 && !this.stopWords.has(word))
      .join(' ');
  }

  static stemWord(word: string): string {
    if (!word || word.length < 3) return word;
    
    word = word.toLowerCase();
    
    // Enhanced stemming rules
    const stemmingRules = [
      { suffix: 'ational', replacement: 'ate' },
      { suffix: 'tional', replacement: 'tion' },
      { suffix: 'enci', replacement: 'ence' },
      { suffix: 'anci', replacement: 'ance' },
      { suffix: 'izer', replacement: 'ize' },
      { suffix: 'alli', replacement: 'al' },
      { suffix: 'entli', replacement: 'ent' },
      { suffix: 'eli', replacement: 'e' },
      { suffix: 'ousli', replacement: 'ous' },
      { suffix: 'ization', replacement: 'ize' },
      { suffix: 'ation', replacement: 'ate' },
      { suffix: 'ator', replacement: 'ate' },
      { suffix: 'alism', replacement: 'al' },
      { suffix: 'iveness', replacement: 'ive' },
      { suffix: 'fulness', replacement: 'ful' },
      { suffix: 'ousness', replacement: 'ous' },
      { suffix: 'aliti', replacement: 'al' },
      { suffix: 'iviti', replacement: 'ive' },
      { suffix: 'biliti', replacement: 'ble' },
      { suffix: 'ing', replacement: '' },
      { suffix: 'ly', replacement: '' },
      { suffix: 'ed', replacement: '' },
      { suffix: 'ies', replacement: 'i' },
      { suffix: 'ied', replacement: 'i' },
      { suffix: 'ies', replacement: 'i' },
      { suffix: 's', replacement: '' }
    ];

    for (const rule of stemmingRules) {
      if (word.endsWith(rule.suffix) && word.length > rule.suffix.length + 2) {
        return word.slice(0, -rule.suffix.length) + rule.replacement;
      }
    }
    
    return word;
  }

  static preprocess(text: string): string {
    const cleaned = this.cleanText(text);
    const withoutStopWords = this.removeStopWords(cleaned);
    const stemmed = withoutStopWords
      .split(' ')
      .map(word => this.stemWord(word))
      .filter(word => word.length > 1)
      .join(' ');
    
    return stemmed;
  }

  static extractFeatures(text: string): { [key: string]: number } {
    const features: { [key: string]: number } = {};
    
    if (!text || typeof text !== 'string') {
      return features;
    }
    
    // Basic text statistics
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    features.char_count = text.length;
    features.word_count = words.length;
    features.sentence_count = sentences.length;
    
    // Word-level features
    if (words.length > 0) {
      features.avg_word_length = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      features.long_words = words.filter(word => word.length > 6).length;
      features.short_words = words.filter(word => word.length <= 3).length;
    }
    
    // Punctuation features
    features.exclamation_count = (text.match(/!/g) || []).length;
    features.question_count = (text.match(/\?/g) || []).length;
    features.period_count = (text.match(/\./g) || []).length;
    
    // Ratio features
    if (text.length > 0) {
      features.punctuation_ratio = (text.match(/[.!?,;:]/g) || []).length / text.length;
      features.caps_ratio = (text.match(/[A-Z]/g) || []).length / text.length;
      features.digit_ratio = (text.match(/\d/g) || []).length / text.length;
    }
    
    // Sensational language detection
    const sensationalWords = [
      'shocking', 'amazing', 'incredible', 'unbelievable', 'stunning',
      'miracle', 'secret', 'hidden', 'exposed', 'revealed', 'urgent',
      'breaking', 'exclusive', 'conspiracy', 'scandal', 'forbidden',
      'dangerous', 'terrifying', 'outrageous', 'devastating'
    ];
    
    const textLower = text.toLowerCase();
    features.sensational_count = sensationalWords.filter(word => 
      textLower.includes(word)
    ).length;
    
    features.sensational_ratio = words.length > 0 ? 
      features.sensational_count / words.length : 0;
    
    // Credibility indicators
    const credibilityWords = [
      'study', 'research', 'university', 'scientist', 'doctor',
      'professor', 'evidence', 'data', 'analysis', 'report',
      'journal', 'published', 'peer-reviewed', 'clinical'
    ];
    
    features.credibility_count = credibilityWords.filter(word => 
      textLower.includes(word)
    ).length;
    
    features.credibility_ratio = words.length > 0 ? 
      features.credibility_count / words.length : 0;
    
    // Readability approximation (Flesch Reading Ease)
    if (sentences.length > 0 && words.length > 0) {
      const avgSentenceLength = words.length / sentences.length;
      const avgSyllables = this.estimateAvgSyllables(words);
      features.readability_score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);
    }
    
    return features;
  }

  private static estimateAvgSyllables(words: string[]): number {
    const totalSyllables = words.reduce((total, word) => {
      return total + this.countSyllables(word);
    }, 0);
    
    return words.length > 0 ? totalSyllables / words.length : 0;
  }

  private static countSyllables(word: string): number {
    if (!word || word.length <= 3) return 1;
    
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    
    // Count vowel groups
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiouy'.includes(word[i]);
      
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      
      previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    // Minimum one syllable
    return Math.max(1, syllableCount);
  }
}