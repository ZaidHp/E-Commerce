import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "react-toastify";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];
const API_BASE_URL = "http://localhost:8080";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const generateEmptyData = (viewType, month, year) => {
  if (viewType === "monthly") {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, sales: 0 }));
  } else {
    return MONTHS.map((month, i) => ({ month, sales: 0 }));
  }
};

const StatCard = ({ title, value }) => (
  <div className="bg-white shadow rounded-2xl p-4 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [view, setView] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartKey, setChartKey] = useState(0);
  const [yearlySales, setYearlySales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const businessId = localStorage.getItem("business_id");
      if (!businessId) {
        toast.error("Business ID not found.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      const businessId = localStorage.getItem("business_id");
      if (!businessId) {
        toast.error("Business ID not found.");
        setLoading(false);
        return;
      }

      try {
        const queryParams = new URLSearchParams({
          view,
          year: selectedYear,
        });
        if (view === "monthly") queryParams.append("month", selectedMonth);

        const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}/sales-trend?${queryParams}`);
        
        const emptyData = generateEmptyData(view, selectedMonth, selectedYear);
        const mappedData = emptyData.map(entry => {
          const found = res.data.find(d =>
            view === "monthly" ? d.day === entry.day : d.month === (MONTHS.indexOf(entry.month) + 1)
          );
          return found ? { ...entry, sales: found.sales } : entry;
        });
        
        setSalesData(mappedData);
      } catch (err) {
        console.error("Sales Data Fetch Error:", err);
        toast.error("Failed to load sales trend data.");
      }
    };

    fetchSalesData();
  }, [view, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchYearlySales = async () => {
      const businessId = localStorage.getItem("business_id");
      if (!businessId) {
        toast.error("Business ID not found.");
        return;
      }
  
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}/lifetime-sales`);
        setYearlySales(res.data);
      } catch (err) {
        console.error("Error fetching yearly sales:", err);
        toast.error("Failed to load lifetime sales data.");
      }
    };
  
    fetchYearlySales();
  }, []);
  

  useEffect(() => {
    const handleResize = () => {
      setChartKey(prev => prev + 1);
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">No data available</div>;

  const {
    total_sales,
    total_earnings,
    monthly_sales,
    monthly_earnings,
    best_selling_product,
    category_sales = [],
    average_order_value,
    weekly_sales = {},
    customer_retention_rate
  } = data;

  const maxSales = Math.max(...yearlySales.map(sale => Number(sale.total_sales)));

  const normalizedDataSales = yearlySales.map(sale => ({
    year: sale.year,
    total_sales: Number(sale.total_sales),
    normalized_sales: (Number(sale.total_sales) / maxSales) * 100,
  }));

  const formattedCategorySales = category_sales.map((sale) => ({
    category_name: sale.category_name,
    sales: Number(sale.sales),
  }));  

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, year, total_sales }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {` $${total_sales}`}
      </text>
    );
  };

  const renderCategoryLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category_name, sales }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${sales}`} 
      </text>
    );
};


  return (
    <div className="p-6 pl-20 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Business Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard title="Total Sales" value={`$${Number(total_sales || 0).toFixed(2)}`} />
        <StatCard title="Total Earnings" value={`$${Number(total_earnings || 0).toFixed(2)}`} />
        <StatCard title="Monthly Sales" value={`$${Number(monthly_sales || 0).toFixed(2)}`} />
        <StatCard title="Monthly Earnings" value={`$${Number(monthly_earnings || 0).toFixed(2)}`} />
        <StatCard title="Avg Order Value" value={`$${Number(average_order_value || 0).toFixed(2)}`} />
        <StatCard title="Customer Retention" value={`${Number(customer_retention_rate || 0).toFixed(2)}%`} />
      </div>

      <div className="flex flex-wrap gap-4 w-full">
      <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[800px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h4 className="text-lg font-semibold">Sales Trend</h4>
          <div className="flex space-x-4">
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            {view === "monthly" && (
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          )}

          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>

        
        <ResponsiveContainer key={chartKey} width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey={view === "monthly" ? "day" : "month"} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales">
              {salesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lifetime Sales by Year */}
      <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
      <h4 className="text-lg font-semibold mb-2">Lifetime Sales by Year</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={normalizedDataSales}
            dataKey="normalized_sales"
            nameKey="year"
            cx="50%"
            cy="50%"
            outerRadius={100}
            minAngle={10}
            label={renderCustomLabel}
            labelLine={false}
          >
            {normalizedDataSales.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip formatter={(value, name, entry) => [`${entry.payload.total_sales}`, "Total Sales"]} />
        </PieChart>
      </ResponsiveContainer>
  </div>


        
        
      </div>

      <div className="flex flex-wrap gap-4 w-full">
        {/* Weekly Sales Comparison */}
        <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
          <h4 className="text-lg font-semibold mb-2">Weekly Sales Comparison</h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Previous Week", sales: weekly_sales?.previous_week ?? 0 },
                { name: "This Week", sales: weekly_sales?.current_week ?? 0 },
              ]}
            >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales">
              <Cell fill="#FF5733" />
              <Cell fill="#3B82F6" />
            </Bar>
            </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Sales */}
        <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
          <h4 className="text-lg font-semibold mb-2">Category-wise Sales</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
              data={formattedCategorySales}
              dataKey="sales"
              nameKey="category_name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCategoryLabel}
              labelLine={false}
            >
              {formattedCategorySales.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
            </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
          
          {best_selling_product && best_selling_product.length > 0 ? (
          <div className="bg-white p-4 rounded-2xl shadow">
          <h4 className="text-lg font-semibold mb-2">Top Best-Selling Products</h4>
          <ul className="space-y-1 text-gray-700">
            {best_selling_product.map((product, index) => (
            <li key={product.product_id} className="flex justify-between">
            <span>
              {index + 1}. <span className="font-medium">{product.product_name}</span>
            </span>
            <span className="text-sm text-gray-600">{product.total_sold ?? 0} sold</span>
          </li>
          ))}
          </ul>
          </div>
          ) : (
          <div className="bg-white p-4 rounded-2xl shadow text-gray-500 text-center">
            No best-selling products available.
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

