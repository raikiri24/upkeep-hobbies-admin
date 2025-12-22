import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, Users, DollarSign, AlertTriangle, ShoppingCart } from "lucide-react";
import RecentSales from "./RecentSales";
import { formatCurrency, getCurrencySymbol, formatCurrencyPlain } from "../utils/currency";
import { useItems } from "../hooks";

// All analytics data is currently unavailable
const salesData = [];
const categoryData = [];

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  isPositive: boolean;
}> = ({ title, value, icon, trend, isPositive }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
    <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
      <span className="text-6xl opacity-20">{icon}</span>
    </div>
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-slate-800 rounded-lg text-indigo-400 border border-slate-700 group-hover:text-indigo-300 group-hover:border-indigo-500/30 transition-colors">
        {icon}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
      {title}
    </h3>
    <div className="flex items-end gap-3 mt-1">
      <span className="text-2xl font-bold text-white font-display">
        {value}
      </span>
      <span
        className={`text-xs font-semibold mb-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}
      >
        {trend}
      </span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // Analytics data currently unavailable
  const monthlySales = 0;
  const lowStockCount = 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-white tracking-wide mb-6">
        Performance Overview
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Sales"
          value="Unavailable"
          icon={<ShoppingCart />}
          trend="No data"
          isPositive={false}
        />
        <StatCard
          title="Low Stock Items"
          value="Unavailable"
          icon={<AlertTriangle />}
          trend="No data"
          isPositive={false}
        />
        <StatCard
          title="Total Customers"
          value="Unavailable"
          icon={<Users />}
          trend="No data"
          isPositive={false}
        />
        <StatCard
          title="Avg. Order Value"
          value="Unavailable"
          icon={<TrendingUp />}
          trend="No data"
          isPositive={false}
        />
      </div>

      {/* Recent Sales Widget */}
      <RecentSales />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 font-display">
            Weekly Revenue Analysis
          </h3>
          <div className="h-64 sm:h-80 w-full flex flex-col items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium mb-2">Analytics Currently Unavailable</p>
              <p className="text-sm">Sales analytics will be available in a future update</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 font-display">
            Sales by Category
          </h3>
          <div className="h-64 sm:h-80 w-full flex flex-col items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium mb-2">Analytics Currently Unavailable</p>
              <p className="text-sm">Category analytics will be available in a future update</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
