import { apiRequest } from './client';

export const consultationApi = {
  analyzeSymptoms: (symptoms) => {
    // Strategy: 
    // 1. If symptoms contain newlines or are very long, treat as one descriptive block
    // 2. Otherwise, split by commas as before
    let symptomsArray = [];
    
    if (symptoms.includes('\n') || symptoms.length > 50) {
      symptomsArray = [symptoms.trim()];
    } else {
      symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s.length >= 2);
    }
    
    // Safety check: if after processing we have nothing, send the raw string trimmed
    if (symptomsArray.length === 0 && symptoms.trim().length > 0) {
      symptomsArray = [symptoms.trim()];
    }
    
    return apiRequest('/api/consultation/analyze-symptoms', {
      method: 'POST',
      body: JSON.stringify({ symptoms: symptomsArray })
    });
  },

  chatWithAI: (message, userName = null, history = []) => {
    return apiRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userName, history })
    });
  }
};

