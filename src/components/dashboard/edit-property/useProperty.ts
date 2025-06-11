import { useEffect, useState, useCallback } from 'react';
import { getData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import { PropertyData, ToastState, PropertyStatistics } from './PropertyTypes';

export const useProperty = (propertyId: string, token: string) => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [propertystat, setPropertystat] = useState<PropertyStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    show: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchProperty = useCallback(async (authToken: string, id: string) => {
    try {
      setLoading(true);
      const res = await getData(`agent/property_listings/${id}`, {}, new AxiosHeaders({
        Authorization: `Bearer ${authToken}`,
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
  }, []);

  const fetchPropertyStatistics = useCallback(async (authToken: string, id: string) => {
    try {
      const res = await getData(`agent/property/${id}/statistics`, {}, new AxiosHeaders({
        Authorization: `Bearer ${authToken}`,
      }));
      
      if (res.data) {
        setPropertystat(res.data);
      } else {
        showToast('Property statistics not found', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch property statistics', error);
      showToast('Failed to load property statistics', 'error');
    }
  }, []);

  useEffect(() => {
    if (token) {
      // Token is available
    } else {
      console.error('Token not found');
      showToast('Authentication required', 'error');
    }
  }, [token]);

  useEffect(() => {
    if (token && propertyId) {
      fetchProperty(token, propertyId);
      fetchPropertyStatistics(token, propertyId);
    }
  }, [token, propertyId, fetchProperty, fetchPropertyStatistics]);

  return {
    property,
    propertystat,
    loading,
    toast,
    showToast,
    fetchProperty, // Export fetchProperty for manual refetching
    fetchPropertyStatistics // Export fetchPropertyStatistics for manual refetching
  };
};