import apiClient from '../services/api';

export const saveOfflineAssessment = (answers) => {
  const pending = JSON.parse(localStorage.getItem('pendingAssessments')) || [];
  pending.push({ answers, timestamp: new Date().toISOString() });
  localStorage.setItem('pendingAssessments', JSON.stringify(pending));
};

export const syncOfflineData = async () => {
  const pending = JSON.parse(localStorage.getItem('pendingAssessments')) || [];
  
  if (pending.length === 0) return;

  console.log(`[SYNC] Attempting to sync ${pending.length} offline assessments...`);
  
  const failedSyncs = [];

  for (const assessment of pending) {
    try {
      await apiClient.post('/assessments', { answers: assessment.answers });
    } catch (error) {
      console.error('[SYNC ERROR] Failed to sync record, keeping in queue', error);
      failedSyncs.push(assessment);
    }
  }

  // Update local storage with any that still failed (e.g., server down)
  if (failedSyncs.length === 0) {
    localStorage.removeItem('pendingAssessments');
    console.log('[SYNC] All offline data synced successfully.');
  } else {
    localStorage.setItem('pendingAssessments', JSON.stringify(failedSyncs));
  }
};

// Listen for the browser coming back online
window.addEventListener('online', syncOfflineData);