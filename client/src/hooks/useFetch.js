// useFetch Hook
// Custom hook for fetching data from API

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(url, {
          ...options,
          signal: controller.signal
        });

        if (isMounted) {
          setData(response.data.data || response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted && err.name !== 'CanceledError') {
          setError(err.response?.data?.message || err.message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, options]);

  return { data, loading, error };
}

export default useFetch;
