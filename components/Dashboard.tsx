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

const salesData = [
  { name: "Mon", sales: 4000, orders: 24 },
  { name: "Tue", sales: 3000, orders: 13 },
  { name: "Wed", sales: 2000, orders: 18 },
  { name: "Thu", sales: 2780, orders: 39 },
  { name: "Fri", sales: 1890, orders: 48 },
  { name: "Sat", sales: 2390, orders: 38 },
  { name: "Sun", sales: 3490, orders: 43 },
];

const categoryData = [
  { name: "RC Vehicles", value: 45 },
  { name: "Drones", value: 25 },
  { name: "Kits", value: 20 },
  { name: "Supplies", value: 10 },
];

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
  // Calculate monthly sales from mock data (in real app, this would come from API)
  const monthlySales = salesData.reduce((total, day) => total + day.sales, 0);
  const lowStockCount = 8; // Mock data - in real app, this would be calculated from inventory
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-white tracking-wide mb-6">
        Performance Overview
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Sales"
          value={formatCurrencyPlain(monthlySales)}
          icon={<ShoppingCart />}
          trend="234 orders"
          isPositive={true}
        />
        <StatCard
          title="Low Stock Items"
          value="8"
          icon={<AlertTriangle />}
          trend="2 items critical"
          isPositive={false}
        />
        <StatCard
          title="Total Customers"
          value="1,203"
          icon={<Users />}
          trend="+2.4%"
          isPositive={true}
        />
        <StatCard
          title="Avg. Order Value"
          value={formatCurrencyPlain(monthlySales / 234)} // Mock 234 orders
          icon={<TrendingUp />}
          trend="+0.8%"
          isPositive={true}
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
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrencyPlain(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                  }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 font-display">
            Sales by Category
          </h3>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
