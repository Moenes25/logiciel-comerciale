import { useState, useEffect } from 'react';

// Hook personnalisé pour fetcher des données
const useFetch = (fetchFunction, params = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchFunction(params);

        if (isMounted) {
          if (result.success) {
            setData(result.data);
          } else {
            setError(result.message || 'Une erreur est survenue');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Une erreur est survenue');
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction(params);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export default useFetch;