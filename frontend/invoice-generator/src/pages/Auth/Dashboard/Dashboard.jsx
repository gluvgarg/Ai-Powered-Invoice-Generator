import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPath";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    paidCount: 0,
    pendingCount: 0
  });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch invoices first as they are critical
        const invoicesRes = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
        const invoices = invoicesRes.data;
        const paid = invoices.filter(inv => inv.status === "Paid");
        const pending = invoices.filter(inv => inv.status !== "Paid");

        setStats({
          totalRevenue: paid.reduce((acc, inv) => acc + inv.total, 0),
          outstanding: pending.reduce((acc, inv) => acc + inv.total, 0),
          paidCount: paid.length,
          pendingCount: pending.length
        });

        // Attempt to fetch AI Insights, but don't crash if it fails
        try {
          const insightsRes = await axiosInstance.get(API_PATHS.AI.GET_DASHBOARD_SUMMARY);
          setInsights(insightsRes.data.insights || []);
        } catch (aiError) {
          console.error("Error fetching AI insights", aiError);
          setInsights(["AI insights are currently unavailable."]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2a5a]"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Revenue", 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Outstanding", 
      value: `$${stats.outstanding.toLocaleString()}`, 
      icon: Clock, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
    { 
      label: "Paid Invoices", 
      value: stats.paidCount, 
      icon: CheckCircle, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Pending Invoices", 
      value: stats.pendingCount, 
      icon: AlertCircle, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your invoice summary.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-hover duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-[#1e2a5a] to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-300" />
            <h2 className="text-xl font-bold">AI Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-start space-x-4"
              >
                <div className="bg-white/20 p-2 rounded-lg mt-1">
                  <CheckCircle className="w-4 h-4 text-blue-200" />
                </div>
                <p className="text-blue-50 font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <p className="text-blue-200">No insights available at the moment. Create more invoices to see AI suggestions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
