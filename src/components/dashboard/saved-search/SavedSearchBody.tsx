"use client";

import React, { useState, useEffect } from 'react';
import { getData } from '@/libs/server/backendServer';
import { AxiosHeaders } from 'axios';
import { TrendingUp, Users, UserCheck, Home, Clock, CheckCircle, XCircle, DollarSign, MapPin, Building2, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, BarChart3, PieChart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatisticsData {
  total_customers: number;
  total_agents: number;
  total: number;
  cancelled: number;
  pending: number;
  accepted: number;
  for_sale: number;
  for_rent: number;
  immediate_delivery: number;
  average_price: number;
  total_price_for_sale: number;
  total_price_for_rent: number;
  by_area: Array<{ area_name: string; count: number }>;
  by_type: Array<{ type_name: string; count: number }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatCard = ({ title, value, icon: Icon, gradient, isLoading, subtitle, trend }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient?: string;
  isLoading?: boolean;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <div className={`bg-white border p-4 rounded shadow-sm ${gradient || 'bg-gradient-primary'}`}>
    <div className="d-flex justify-content-between mb-4">
      <div className={`p-3 rounded bg-light ${gradient ? 'shadow-lg' : ''}`}>
        <Icon className="text-primary" />
      </div>
      {trend && (
        <div className={`badge ${trend.isPositive ? 'bg-success' : 'bg-danger'}`}>
          {trend.isPositive ? <ArrowUpRight className="me-1" /> : <ArrowDownRight className="me-1" />}
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>

    <div>
      <p className="text-muted mb-2">{title}</p>
      {isLoading ? (
        <div className="d-flex align-items-center">
          <Loader2 className="me-2 text-muted" />
          <div className="spinner-grow spinner-grow-sm text-muted" />
        </div>
      ) : (
        <>
          <h4>{value}</h4>
          {subtitle && (
            <p className="text-muted">{subtitle}</p>
          )}
        </>
      )}
    </div>
  </div>
);

const ModernChartCard = ({ title, data, isLoading, icon: Icon }: {
  title: string;
  data: Array<{ name: string; count: number }>;
  isLoading?: boolean;
  icon: React.ElementType;
}) => (
  <div className="bg-white border p-4 rounded shadow-sm">
    <div className="d-flex align-items-center mb-4">
      <div className="p-2 bg-light rounded">
        <Icon className="text-primary" />
      </div>
      <h5 className="ms-3">{title}</h5>
    </div>

    {isLoading ? (
      <div className="spinner-border text-primary" />
    ) : (
      <div>
        {data.map((item, index) => {
          const maxCount = Math.max(...data.map(d => d.count));
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const colors = [
            'bg-primary',
            'bg-secondary',
            'bg-success',
            'bg-warning',
            'bg-info'
          ];

          return (
            <div key={index} className="mb-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">{item.name}</span>
                <span>{item.count}</span>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const ErrorCard = ({ message, onRetry, t }: { message: string; onRetry: () => void; t: ReturnType<typeof useTranslations> }) => (
  <div className="col-12">
    <div className="bg-danger text-white p-4 rounded shadow-sm">
      <div className="d-flex">
        <div className="bg-warning p-2 rounded">
          <AlertCircle className="text-white" />
        </div>
        <div className="ms-3">
          <h6>{t('unableToLoadDashboard')}</h6>
          <p>{message}</p>
        </div>
        <button onClick={onRetry} className="btn btn-light ms-auto">
          {t('retry')}
        </button>
      </div>
    </div>
  </div>
);

export default function DashBoard({ token }: { token: string }) {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('Home');

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(t('authenticationTokenNotFound'));
      }

      const response = await getData('agent/statistics', {}, new AxiosHeaders({
        Authorization: `Bearer ${token}`,
      }));

      if (response.data && response.status) {
        setStatistics(response.data);
      } else {
        throw new Error( t('failedToFetchStatistics'));
      }
    } catch (error) {
      setError(t('failedToLoadData'));
      console.error(t('failedToFetchStatistics'), error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="row w-100">
          <ErrorCard message={error} onRetry={fetchStatistics} t={t} />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
        <div className="col">
          <StatCard
            title={t('totalProperties')}
            value={statistics?.total ?? 0}
            icon={Home}
            gradient="bg-gradient-primary"
            isLoading={loading}
          />
        </div>

        <div className="col">
          <StatCard
            title={t('totalCustomers')}
            value={statistics?.total_customers ?? 0}
            icon={Users}
            gradient="bg-gradient-success"
            isLoading={loading}
          />
        </div>

        <div className="col">
          <StatCard
            title={t('totalAgents')}
            value={statistics?.total_agents ?? 0}
            icon={UserCheck}
            gradient="bg-gradient-info"
            isLoading={loading}
          />
        </div>

        <div className="col">
          <StatCard
            title={t('averagePrice')}
            value={statistics ? formatCurrency(statistics.average_price) : "$0"}
            icon={DollarSign}
            gradient="bg-gradient-danger"
            isLoading={loading}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12 col-lg-6">
          <ModernChartCard
            title={t('propertiesByArea')}
            data={statistics?.by_area.map(area => ({ name: area.area_name, count: area.count })) ?? []}
            isLoading={loading}
            icon={MapPin}
          />
        </div>

        <div className="col-12 col-lg-6">
          <ModernChartCard
            title={t('propertiesByType')}
            data={statistics?.by_type.map(type => ({ name: type.type_name, count: type.count })) ?? []}
            isLoading={loading}
            icon={PieChart}
          />
        </div>
      </div>
    </div>
  );
}
