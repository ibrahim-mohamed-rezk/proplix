import { useEffect, useState, useCallback } from 'react';
import { getData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import { PropertyData, ToastState } from './PropertyTypes';

export const useProperty = (propertyId: string,token:string) => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  // const [token, setToken] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    show: false
  });
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchProperty = useCallback(async (token: string, id: string) => {
    try {
      setLoading(true);
      const res = await getData(`agent/property_listings/${id}`, {}, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
      }));
      if (res.data) {
        setProperty(res.data);
      } else {
        showToast('Property not found', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch property', error);
      showToast('Failed to load property details', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // const storedToken = localStorage.getItem('token');
    if (token) {
      // setToken(token);
    } else {
      console.error('Token not found in localStorage');
      showToast('Authentication required', 'error');
    }
  }, [token]);

  useEffect(() => {
    if (token && propertyId) {
      fetchProperty(token, propertyId);
    }
  }, [token, propertyId, fetchProperty]);

  return {
    property,
    loading,
    toast,
    showToast,
    fetchProperty // Export fetchProperty for manual refetching
  };
};