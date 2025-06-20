import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { TimeSeriesData, FunnelStageData, DrillDownData } from '../../services/analyticsService';

// Color schemes for different chart types
const COLORS = {
  primary: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'],
  gradient: ['#3B82F6', '#1D4ED8'],
  funnel: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22'],
  trend: {
    up: '#10B981',
    down: '#EF4444',
    stable: '#6B7280'
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Time Series Chart Component
interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
  dataKey: string;
  color?: string;
  showArea?: boolean;
  height?: number;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title,
  dataKey,
  color = COLORS.primary[0],
  showArea = false,
  height = 300
}) => {
  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="label" 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={showArea ? `url(#gradient-${dataKey})` : undefined}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
          {showArea && (
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

// Funnel Chart Component
interface FunnelChartProps {
  data: FunnelStageData[];
  title: string;
  height?: number;
}

export const FunnelChartComponent: React.FC<FunnelChartProps> = ({
  data,
  title,
  height = 400
}) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const funnelData = data.map((stage, index) => ({
    name: stage.stage,
    value: stage.count,
    percentage: stage.percentage,
    dropoffRate: stage.dropoffRate,
    averageTime: stage.averageTime,
    fill: COLORS.funnel[index] || COLORS.primary[index % COLORS.primary.length]
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Visualization */}
        <div>
          <ResponsiveContainer width="100%" height={height}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel
                dataKey="value"
                data={funnelData}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Details */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Stage Details</h4>
          {data.map((stage, index) => (
            <div
              key={stage.stage}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedStage === stage.stage
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedStage(selectedStage === stage.stage ? null : stage.stage)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">{stage.stage}</h5>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{stage.count}</span>
                  <span className="text-xs text-gray-500">({stage.percentage}%)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Dropoff Rate:</span>
                  <span className={`ml-2 font-medium ${
                    stage.dropoffRate > 20 ? 'text-red-600' : 
                    stage.dropoffRate > 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {stage.dropoffRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Avg Time:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {stage.averageTime} days
                  </span>
                </div>
              </div>

              {selectedStage === stage.stage && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Click to drill down for detailed analysis and recommendations
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Drill Down Chart Component
interface DrillDownChartProps {
  data: DrillDownData;
  onDrillDown?: (category: string, subcategory: string) => void;
}

export const DrillDownChart: React.FC<DrillDownChartProps> = ({
  data,
  onDrillDown
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const chartData = data.subcategories.map((sub, index) => ({
    name: sub.name,
    value: sub.value,
    trend: sub.trend,
    fill: COLORS.primary[index % COLORS.primary.length]
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{data.category}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subcategory Details */}
        <div className="space-y-3">
          {data.subcategories.map((sub, index) => (
            <div
              key={sub.name}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-all"
              onClick={() => {
                setSelectedCategory(sub.name);
                onDrillDown?.(data.category, sub.name);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.primary[index % COLORS.primary.length] }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{sub.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{sub.value}%</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sub.trend > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : sub.trend < 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {sub.trend > 0 ? '+' : ''}{sub.trend}%
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {sub.details.length} detailed items • Click to explore
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Performance Metrics Chart
interface PerformanceMetricsProps {
  metrics: {
    conversionRate: number;
    averageTimeToComplete: number;
    efficiency: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  };
}

export const PerformanceMetricsChart: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  const metricsData = [
    {
      name: 'Conversion Rate',
      value: metrics.conversionRate,
      target: 60,
      unit: '%'
    },
    {
      name: 'Avg Time to Complete',
      value: metrics.averageTimeToComplete,
      target: 20,
      unit: ' days'
    },
    {
      name: 'Efficiency',
      value: metrics.efficiency,
      target: 85,
      unit: '%'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          metrics.trend === 'up' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : metrics.trend === 'down'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          <span>{metrics.trend === 'up' ? '↗' : metrics.trend === 'down' ? '↘' : '→'}</span>
          <span>{metrics.trendPercentage}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={metricsData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" stroke="#6B7280" fontSize={12} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#6B7280" 
            fontSize={12}
            width={120}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current: <span className="font-medium">{data.value}{data.unit}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Target: <span className="font-medium">{data.target}{data.unit}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" fill={COLORS.primary[0]} radius={[0, 4, 4, 0]} />
          <Bar dataKey="target" fill={COLORS.primary[1]} opacity={0.3} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  TimeSeriesChart,
  FunnelChartComponent,
  DrillDownChart,
  PerformanceMetricsChart
}; 