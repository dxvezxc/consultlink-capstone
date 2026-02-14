import API from './axios';

// Request deduplication cache
let subjectsCache = null;
let subjectsCacheTime = 0;
const CACHE_DURATION = 60000; // Cache for 60 seconds

// Track pending requests
let subjectsPending = null;

export const subjectsAPI = {
  // Get all subjects with request deduplication and caching
  getAll: async () => {
    const now = Date.now();
    
    // Return cached result if still valid
    if (subjectsCache && (now - subjectsCacheTime) < CACHE_DURATION) {
      console.log('[subjectsAPI] Returning cached subjects');
      return subjectsCache;
    }
    
    // If request already in flight, return that promise instead of making a new one
    if (subjectsPending) {
      console.log('[subjectsAPI] Request already in flight, returning pending promise');
      return subjectsPending;
    }
    
    // Create new request promise
    subjectsPending = API.get('/subjects')
      .then(response => {
        // Update cache
        subjectsCache = response;
        subjectsCacheTime = now;
        console.log('[subjectsAPI] Subjects response cached:', response);
        return response;
      })
      .catch(error => {
        console.error('[subjectsAPI] Error fetching subjects:', error);
        throw error;
      })
      .finally(() => {
        // Clear pending request marker
        subjectsPending = null;
      });
    
    return subjectsPending;
  },

  getById: async (id) => {
    try {
      return await API.get(`/subjects/${id}`);
    } catch (error) {
      console.error('[subjectsAPI] Error fetching subject by ID:', error);
      throw error;
    }
  },

  getWithConsultants: async () => {
    try {
      return await API.get('/subjects');
    } catch (error) {
      console.error('[subjectsAPI] Error fetching subjects with consultants:', error);
      throw error;
    }
  },

  /**
   * Clear the cache - call this after performing mutations that affect subjects
   */
  clearCache: () => {
    subjectsCache = null;
    subjectsCacheTime = 0;
    console.log('[subjectsAPI] Cache cleared');
  }
};