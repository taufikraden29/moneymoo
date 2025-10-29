import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 max-w-[200px]"
      >
        <p className="font-semibold text-gray-800 text-sm mb-1 truncate">
          {data.name}
        </p>
        <p className="text-blue-600 font-bold text-base">
          Rp {data.value.toLocaleString("id-ID")}
        </p>
        <p className="text-gray-600 text-xs mt-1">
          {((data.value / payload[0].payload.total) * 100).toFixed(1)}% dari
          total
        </p>
      </motion.div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] font-semibold pointer-events-none"
      stroke="rgba(0,0,0,0.3)"
      strokeWidth={2}
      paintOrder="stroke"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportChart({ data = [] }) {
  const [chartDimensions, setChartDimensions] = useState({
    height: 300,
    outerRadius: 80,
    innerRadius: 40,
  });

  // Adjust chart dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;

      if (width < 640) {
        // Mobile
        setChartDimensions({ height: 200, outerRadius: 60, innerRadius: 30 });
      } else if (width < 768) {
        // Tablet
        setChartDimensions({ height: 250, outerRadius: 70, innerRadius: 35 });
      } else {
        // Desktop
        setChartDimensions({ height: 300, outerRadius: 80, innerRadius: 40 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="text-4xl sm:text-5xl md:text-6xl text-gray-300 mb-2 sm:mb-3 md:mb-4">
          📊
        </div>
        <p className="text-gray-500 text-xs sm:text-sm text-center mb-1 sm:mb-2">
          Belum ada data transaksi
        </p>
        <p className="text-gray-400 text-xs text-center">
          Tambahkan transaksi untuk melihat grafik
        </p>
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((item) => ({
    ...item,
    total: totalValue,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="h-48 sm:h-56 md:h-64 lg:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={chartDimensions.outerRadius}
              innerRadius={chartDimensions.innerRadius}
              paddingAngle={1}
              label={renderCustomizedLabel}
              labelLine={false}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={2}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                paddingLeft: "10px",
                fontSize: "11px",
                maxWidth: "40%",
              }}
              formatter={(value, entry) => (
                <span className="text-gray-700 text-xs font-medium truncate block">
                  {value.length > 12 ? `${value.substring(0, 12)}...` : value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Info - Responsive */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 px-2">
        <div className="text-center min-w-[80px]">
          <p className="text-xs text-gray-500">Total Kategori</p>
          <p className="font-bold text-gray-800 text-sm">{data.length}</p>
        </div>
        <div className="text-center min-w-[100px]">
          <p className="text-xs text-gray-500">Total Nilai</p>
          <p className="font-bold text-gray-800 text-sm">
            Rp {totalValue.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-center min-w-[90px]">
          <p className="text-xs text-gray-500">Rata-rata</p>
          <p className="font-bold text-gray-800 text-sm">
            Rp {Math.round(totalValue / data.length).toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
