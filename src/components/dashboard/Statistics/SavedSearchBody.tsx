"use client";

import React, { useState, useEffect } from "react";
import { getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import {
  TrendingUp,
  Users,
  UserCheck,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Building2,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Timer,
  ShoppingCart,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ApiResponse {
  status: boolean;
  msg?: string;
  data: {
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
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  isLoading,
  subtitle,
  trend,
  color = "primary",
  t,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient?: string;
  isLoading?: boolean;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color?: string;
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="col mb-4">
    <div
      className={`card h-100 border-0 shadow-sm position-relative overflow-hidden ${
        gradient || ""
      }`}
    >
      <div
        className={`position-absolute top-0 end-0 w-25 h-100 bg-${color} opacity-10`}
      ></div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`p-3 rounded-3 bg-${color} bg-opacity-10`}>
            <Icon size={24} className={`text-${color}`} />
          </div>
          {trend && (
            <div
              className={`badge rounded-pill ${
                trend.isPositive ? "bg-success" : "bg-danger"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight size={14} className="me-1" />
              ) : (
                <ArrowDownRight size={14} className="me-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div>
          <h6 className="text-muted fw-normal mb-2">{title}</h6>
          {isLoading ? (
            <div className="d-flex align-items-center">
              <Loader2
                size={20}
                className="me-2 text-muted spinner-border spinner-border-sm"
              />
              <span className="text-muted">{t("Dashboard.loading")}</span>
            </div>
          ) : (
            <>
              <h3 className="fw-bold mb-1">{value}</h3>
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ModernChartCard = ({
  title,
  data,
  isLoading,
  icon: Icon,
  color = "primary",
  t,
}: {
  title: string;
  data: Array<{ name: string; count: number }>;
  isLoading?: boolean;
  icon: React.ElementType;
  color?: string;
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="col mb-4">
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <div className="d-flex align-items-center">
          <div className={`p-2 rounded-3 bg-${color} bg-opacity-10 me-3`}>
            <Icon size={20} className={`text-${color}`} />
          </div>
          <h5 className="card-title mb-0 fw-semibold">{title}</h5>
        </div>
      </div>

      <div className="card-body">
        {isLoading ? (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t("Dashboard.loading")}</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <Icon size={48} className="mb-3 opacity-25" />
            <p>{t("Dashboard.noDataAvailable")}</p>
          </div>
        ) : (
          <div>
            {data.map((item, index) => {
              const maxCount = Math.max(...data.map((d) => d.count));
              const percentage =
                maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const colors = [
                "primary",
                "success",
                "info",
                "warning",
                "danger",
              ];
              const currentColor = colors[index % colors.length];

              return (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">{item.name}</span>
                    <span
                      className={`badge bg-${currentColor} bg-opacity-10 text-${currentColor} fw-semibold`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className={`progress-bar bg-${currentColor} rounded-pill`}
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
);

const StatusCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
  t,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="col mb-4">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body text-center">
        <div
          className={`p-3 rounded-circle bg-${color} bg-opacity-10 d-inline-flex mb-3`}
        >
          <Icon size={24} className={`text-${color}`} />
        </div>
        <h6 className="text-muted fw-normal mb-2">{title}</h6>
        {isLoading ? (
          <div className="spinner-border spinner-border-sm text-muted" />
        ) : (
          <h4 className="fw-bold mb-0">{value}</h4>
        )}
      </div>
    </div>
  </div>
);

const ErrorCard = ({
  message,
  onRetry,
  t,
}: {
  message: string;
  onRetry: () => void;
  t: ReturnType<typeof useTranslations>;
}) => (
  <div className="col-12">
    <div
      className="alert alert-danger d-flex align-items-center shadow-sm border-0"
      role="alert"
    >
      <div className="p-2 bg-warning bg-opacity-10 rounded-3 me-3">
        <AlertCircle size={24} className="text-warning" />
      </div>
      <div className="flex-grow-1">
        <h6 className="alert-heading mb-1">{t("Home.unableToLoadDashboard")}</h6>
        <p className="mb-0">{message}</p>
      </div>
      <button onClick={onRetry} className="btn btn-outline-light">
        {t("Home.retry")}
      </button>
    </div>
  </div>
);

export default function DashBoard({ token }: { token: string }) {
  const [statistics, setStatistics] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error(t("Home.authenticationTokenNotFound"));
      }

      const response = await getData(
        "agent/statistics",
        {},
        new AxiosHeaders({
          Authorization: `Bearer ${token}`,
        })
      );

      if (response.data) {
        setStatistics(response.data);
      } else {
        throw new Error(t("Home.failedToFetchStatistics"));
      }
    } catch (error) {
      setError(t("Home.failedToLoadData"));
      console.error(t("Home.failedToFetchStatistics"), error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [token]);

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <ErrorCard message={error} onRetry={fetchStatistics} t={t} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex align-items-center mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
              <BarChart3 size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="fw-bold mb-0 px-3">{t("Dashboard.dashboardOverview")}</h2>
              <p className="text-muted mb-0 px-3">
                {t("Dashboard.realTimePropertyStatistics")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
        <StatCard
          title={t("Home.totalProperties")}
          value={statistics?.data?.total ?? 0}
          icon={Home}
          color="primary"
          isLoading={loading}
          t={t}
        />

        <StatCard
          title={t("Home.averagePrice")}
          value={
            statistics?.data
              ? formatCurrency(statistics.data.average_price)
              : "$0"
          }
          icon={DollarSign}
          color="success"
          isLoading={loading}
          t={t}
        />

        <StatCard
          title={t("Dashboard.forSaleTotal")}
          value={
            statistics?.data
              ? formatCurrency(statistics.data.total_price_for_sale)
              : "$0"
          }
          icon={ShoppingCart}
          color="info"
          isLoading={loading}
          t={t}
        />

        <StatCard
          title={t("Dashboard.forRentTotal")}
          value={
            statistics?.data
              ? formatCurrency(statistics.data.total_price_for_rent)
              : "$0"
          }
          icon={Building2}
          color="warning"
          isLoading={loading}
          t={t}
        />
      </div>

      {/* Property Status Cards */}
      <div className="row mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0 fw-semibold">
                {t("Dashboard.propertyStatusOverview")}
              </h5>
            </div>
            <div className="card-body">
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3">
                <StatusCard
                  title={t("Dashboard.pending")}
                  value={statistics?.data?.pending ?? 0}
                  icon={Clock}
                  color="warning"
                  isLoading={loading}
                  t={t}
                />
                <StatusCard
                  title={t("Dashboard.accepted")}
                  value={statistics?.data?.accepted ?? 0}
                  icon={CheckCircle}
                  color="success"
                  isLoading={loading}
                  t={t}
                />
                <StatusCard
                  title={t("Dashboard.cancelled")}
                  value={statistics?.data?.cancelled ?? 0}
                  icon={XCircle}
                  color="danger"
                  isLoading={loading}
                  t={t}
                />
                <StatusCard
                  title={t("Dashboard.forSale")}
                  value={statistics?.data?.for_sale ?? 0}
                  icon={ShoppingCart}
                  color="primary"
                  isLoading={loading}
                  t={t}
                />
                <StatusCard
                  title={t("Dashboard.forRent")}
                  value={statistics?.data?.for_rent ?? 0}
                  icon={Building2}
                  color="info"
                  isLoading={loading}
                  t={t}
                />
                <StatusCard
                  title={t("Dashboard.immediateDelivery")}
                  value={statistics?.data?.immediate_delivery ?? 0}
                  icon={Timer}
                  color="success"
                  isLoading={loading}
                  t={t}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row row-cols-1 row-cols-xl-2 g-4">
        <ModernChartCard
          title={t("Home.propertiesByArea")}
          data={
            statistics?.data?.by_area?.map((area) => ({
              name: area.area_name,
              count: area.count,
            })) ?? []
          }
          isLoading={loading}
          icon={MapPin}
          color="primary"
          t={t}
        />

        <ModernChartCard
          title={t("Home.propertiesByType")}
          data={
            statistics?.data?.by_type?.map((type) => ({
              name: type.type_name,
              count: type.count,
            })) ?? []
          }
          isLoading={loading}
          icon={PieChart}
          color="success"
          t={t}
        />
      </div>
    </div>
  );
}