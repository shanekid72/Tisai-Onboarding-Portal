import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { analyticsService, AnalyticsDashboardData } from '../../services/analyticsService';
import { 
  TimeSeriesChart, 
  FunnelChartComponent, 
  DrillDownChart, 
  PerformanceMetricsChart 
} from '../../components/analytics/AdvancedCharts';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AnalyticsDashboard: React.FC = () => {
  const { authState } = useAdminAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrillDown, setSelectedDrillDown] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = analyticsService.generateComprehensiveAnalytics();
      setAnalyticsData(data);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [selectedTimeRange]);

  useEffect(() => {
    if (!isLoading && analyticsData) {
      // Animate dashboard sections on load
      gsap.fromTo('.analytics-section', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [isLoading, analyticsData]);

  const handleDrillDown = (category: string, subcategory: string) => {
    setSelectedDrillDown(`${category} > ${subcategory}`);
    // In a real app, this would fetch detailed data for the selected category
    console.log(`Drilling down into: ${category} > ${subcategory}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Failed to load analytics data. Please try again.
        </div>
      </div>
    );
  }

  const bottlenecks = analyticsService.identifyBottlenecks(analyticsData.funnel);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="analytics-section flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your partnership performance and trends
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          {/* Predictions Toggle */}
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showPredictions
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            🔮 Predictions
          </button>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="analytics-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analyticsData.overview.totalContacts}
              </p>
              <p className={`text-sm mt-1 ${
                analyticsData.overview.trends.contacts >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercentage(analyticsData.overview.trends.contacts)} vs last period
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Deals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analyticsData.overview.activeDeals}
              </p>
              <p className={`text-sm mt-1 ${
                analyticsData.overview.trends.deals >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercentage(analyticsData.overview.trends.deals)} vs last period
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Deals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analyticsData.overview.completedDeals}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {((analyticsData.overview.completedDeals / (analyticsData.overview.activeDeals + analyticsData.overview.completedDeals)) * 100).toFixed(1)}% success rate
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(analyticsData.overview.revenue)}
              </p>
              <p className={`text-sm mt-1 ${
                analyticsData.overview.trends.revenue >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercentage(analyticsData.overview.trends.revenue)} vs last period
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="analytics-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={analyticsData.timeSeries.contacts}
          title="Contact Acquisition Trend"
          dataKey="contacts"
          color="#3B82F6"
          showArea={true}
        />
        <TimeSeriesChart
          data={analyticsData.timeSeries.revenue}
          title="Revenue Trend"
          dataKey="revenue"
          color="#10B981"
          showArea={true}
        />
      </div>

      {/* Funnel Analysis and Performance */}
      <div className="analytics-section grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <FunnelChartComponent
            data={analyticsData.funnel}
            title="Partnership Onboarding Funnel"
            height={350}
          />
        </div>
        <div>
          <PerformanceMetricsChart metrics={analyticsData.performance} />
        </div>
      </div>

      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && (
        <div className="analytics-section bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚨 Bottleneck Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bottlenecks.map((bottleneck, index) => (
              <div
                key={bottleneck.stage}
                className={`p-4 rounded-lg border-l-4 ${
                  bottleneck.severity === 'high' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : bottleneck.severity === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{bottleneck.stage}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bottleneck.severity === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : bottleneck.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {bottleneck.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Impact: <span className="font-medium">{bottleneck.impact}</span> potential partners lost
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Suggestions:</p>
                  {bottleneck.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">• {suggestion}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill Down Analysis */}
      <div className="analytics-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsData.drillDown.map((drillDownData, index) => (
          <DrillDownChart
            key={drillDownData.category}
            data={drillDownData}
            onDrillDown={handleDrillDown}
          />
        ))}
      </div>

      {/* Predictive Insights */}
      {showPredictions && (
        <div className="analytics-section bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">🔮 Predictive Insights</h3>
              <p className="text-purple-600 dark:text-purple-400">
                AI-powered predictions based on historical data and current trends
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.predictions.confidenceScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Expected Completions */}
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Expected Completions</h4>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {analyticsData.predictions.expectedCompletions}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">partnerships this month</p>
            </div>

            {/* Risk Factors */}
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Risk Factors</h4>
              <div className="space-y-2">
                {analyticsData.predictions.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
              <div className="space-y-2">
                {analyticsData.predictions.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Drill Down Info */}
      {selectedDrillDown && (
        <div className="analytics-section bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Drill Down Active</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{selectedDrillDown}</p>
            </div>
            <button
              onClick={() => setSelectedDrillDown(null)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 