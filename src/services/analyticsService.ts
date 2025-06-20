import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

// Analytics data types
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate: number;
  averageTime: number; // in days
}

export interface PerformanceMetrics {
  conversionRate: number;
  averageTimeToComplete: number;
  bottleneckStage: string;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface PredictiveInsights {
  expectedCompletions: number;
  riskFactors: string[];
  recommendations: string[];
  confidenceScore: number;
}

export interface DrillDownData {
  category: string;
  subcategories: {
    name: string;
    value: number;
    trend: number;
    details: any[];
  }[];
}

export interface AnalyticsDashboardData {
  overview: {
    totalContacts: number;
    activeDeals: number;
    completedDeals: number;
    revenue: number;
    trends: {
      contacts: number;
      deals: number;
      revenue: number;
    };
  };
  timeSeries: {
    contacts: TimeSeriesData[];
    revenue: TimeSeriesData[];
    activities: TimeSeriesData[];
  };
  funnel: FunnelStageData[];
  performance: PerformanceMetrics;
  predictions: PredictiveInsights;
  drillDown: DrillDownData[];
}

// Mock data generators for realistic analytics
class AnalyticsService {
  private generateTimeSeriesData(days: number, baseValue: number, variance: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const startDate = subDays(new Date(), days);
    const dates = eachDayOfInterval({ start: startDate, end: new Date() });

    dates.forEach((date, index) => {
      const trend = Math.sin(index * 0.1) * variance * 0.3; // Seasonal trend
      const randomVariation = (Math.random() - 0.5) * variance;
      const growth = index * (variance * 0.02); // Gradual growth
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        value: Math.max(0, Math.round(baseValue + trend + randomVariation + growth)),
        label: format(date, 'MMM dd')
      });
    });

    return data;
  }

  private generateWeeklyData(weeks: number, baseValue: number, variance: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const startDate = subWeeks(new Date(), weeks);
    const dates = eachWeekOfInterval({ start: startDate, end: new Date() });

    dates.forEach((date, index) => {
      const trend = Math.sin(index * 0.2) * variance * 0.4;
      const randomVariation = (Math.random() - 0.5) * variance;
      const growth = index * (variance * 0.05);
      
      data.push({
        date: format(startOfWeek(date), 'yyyy-MM-dd'),
        value: Math.max(0, Math.round(baseValue + trend + randomVariation + growth)),
        label: format(startOfWeek(date), 'MMM dd')
      });
    });

    return data;
  }

  private generateMonthlyData(months: number, baseValue: number, variance: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const startDate = subMonths(new Date(), months);
    const dates = eachMonthOfInterval({ start: startDate, end: new Date() });

    dates.forEach((date, index) => {
      const trend = Math.sin(index * 0.3) * variance * 0.5;
      const randomVariation = (Math.random() - 0.5) * variance;
      const growth = index * (variance * 0.1);
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        value: Math.max(0, Math.round(baseValue + trend + randomVariation + growth)),
        label: format(date, 'MMM yyyy')
      });
    });

    return data;
  }

  generatePartnerOnboardingFunnel(): FunnelStageData[] {
    const stages = [
      { stage: 'Initial Contact', baseCount: 100 },
      { stage: 'NDA Signed', baseCount: 85 },
      { stage: 'KYC Verification', baseCount: 72 },
      { stage: 'Commercial Terms', baseCount: 65 },
      { stage: 'Technical Integration', baseCount: 58 },
      { stage: 'Partnership Signed', baseCount: 52 }
    ];

    return stages.map((stageData, index) => {
      const variance = Math.random() * 10 - 5; // ±5 variance
      const count = Math.max(0, Math.round(stageData.baseCount + variance));
      const previousCount = index === 0 ? 100 : stages[index - 1].baseCount;
      const dropoffRate = index === 0 ? 0 : ((previousCount - count) / previousCount) * 100;
      const percentage = (count / stages[0].baseCount) * 100;
      const averageTime = 3 + index * 2 + Math.random() * 3; // Increasing time per stage

      return {
        stage: stageData.stage,
        count,
        percentage: Math.round(percentage * 10) / 10,
        dropoffRate: Math.round(dropoffRate * 10) / 10,
        averageTime: Math.round(averageTime * 10) / 10
      };
    });
  }

  generatePerformanceMetrics(): PerformanceMetrics {
    const conversionRate = 45 + Math.random() * 20; // 45-65%
    const averageTimeToComplete = 15 + Math.random() * 10; // 15-25 days
    const efficiency = 70 + Math.random() * 25; // 70-95%
    const trendValue = Math.random() * 20 - 10; // ±10%
    
    const bottlenecks = ['KYC Verification', 'Commercial Terms', 'Technical Integration'];
    const bottleneckStage = bottlenecks[Math.floor(Math.random() * bottlenecks.length)];

    return {
      conversionRate: Math.round(conversionRate * 10) / 10,
      averageTimeToComplete: Math.round(averageTimeToComplete * 10) / 10,
      bottleneckStage,
      efficiency: Math.round(efficiency * 10) / 10,
      trend: trendValue > 2 ? 'up' : trendValue < -2 ? 'down' : 'stable',
      trendPercentage: Math.round(Math.abs(trendValue) * 10) / 10
    };
  }

  generatePredictiveInsights(): PredictiveInsights {
    const expectedCompletions = 8 + Math.floor(Math.random() * 12); // 8-20 expected
    const confidenceScore = 75 + Math.random() * 20; // 75-95%

    const riskFactors = [
      'Increased KYC processing time',
      'Legal review backlog',
      'Technical integration complexity',
      'Market volatility affecting decisions',
      'Resource allocation constraints'
    ].slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 risk factors

    const recommendations = [
      'Streamline KYC verification process',
      'Increase legal team capacity',
      'Implement automated technical checks',
      'Provide dedicated integration support',
      'Create fast-track process for qualified partners',
      'Improve communication touchpoints'
    ].slice(0, 3 + Math.floor(Math.random() * 2)); // 3-4 recommendations

    return {
      expectedCompletions,
      riskFactors,
      recommendations,
      confidenceScore: Math.round(confidenceScore * 10) / 10
    };
  }

  generateDrillDownData(): DrillDownData[] {
    return [
      {
        category: 'Contact Sources',
        subcategories: [
          {
            name: 'Website',
            value: 45,
            trend: 12,
            details: [
              { source: 'Organic Search', count: 25, conversion: 15 },
              { source: 'Direct Traffic', count: 12, conversion: 22 },
              { source: 'Social Media', count: 8, conversion: 8 }
            ]
          },
          {
            name: 'Referrals',
            value: 30,
            trend: 8,
            details: [
              { source: 'Partner Referrals', count: 18, conversion: 35 },
              { source: 'Customer Referrals', count: 12, conversion: 28 }
            ]
          },
          {
            name: 'Events',
            value: 25,
            trend: -5,
            details: [
              { source: 'Trade Shows', count: 15, conversion: 18 },
              { source: 'Webinars', count: 10, conversion: 12 }
            ]
          }
        ]
      },
      {
        category: 'Deal Stages',
        subcategories: [
          {
            name: 'Qualification',
            value: 35,
            trend: 5,
            details: [
              { stage: 'Initial Contact', count: 20, avgTime: 2 },
              { stage: 'Needs Assessment', count: 15, avgTime: 5 }
            ]
          },
          {
            name: 'Negotiation',
            value: 40,
            trend: -3,
            details: [
              { stage: 'Proposal Sent', count: 25, avgTime: 7 },
              { stage: 'Terms Discussion', count: 15, avgTime: 12 }
            ]
          },
          {
            name: 'Closing',
            value: 25,
            trend: 15,
            details: [
              { stage: 'Contract Review', count: 15, avgTime: 8 },
              { stage: 'Final Approval', count: 10, avgTime: 3 }
            ]
          }
        ]
      }
    ];
  }

  generateComprehensiveAnalytics(): AnalyticsDashboardData {
    // Generate time series data for different periods
    const contactsDaily = this.generateTimeSeriesData(30, 15, 8);
    const revenueWeekly = this.generateWeeklyData(12, 250000, 50000);
    const activitiesDaily = this.generateTimeSeriesData(30, 45, 15);

    // Calculate overview metrics
    const totalContacts = contactsDaily.reduce((sum, day) => sum + day.value, 0);
    const activeDeals = 25 + Math.floor(Math.random() * 15);
    const completedDeals = 12 + Math.floor(Math.random() * 8);
    const revenue = revenueWeekly[revenueWeekly.length - 1]?.value || 0;

    // Calculate trends (comparing last week to previous week)
    const lastWeekContacts = contactsDaily.slice(-7).reduce((sum, day) => sum + day.value, 0);
    const prevWeekContacts = contactsDaily.slice(-14, -7).reduce((sum, day) => sum + day.value, 0);
    const contactsTrend = ((lastWeekContacts - prevWeekContacts) / prevWeekContacts) * 100;

    return {
      overview: {
        totalContacts,
        activeDeals,
        completedDeals,
        revenue,
        trends: {
          contacts: Math.round(contactsTrend * 10) / 10,
          deals: 8.5 + Math.random() * 10 - 5, // ±5% variance
          revenue: 12.3 + Math.random() * 10 - 5 // ±5% variance
        }
      },
      timeSeries: {
        contacts: contactsDaily,
        revenue: revenueWeekly,
        activities: activitiesDaily
      },
      funnel: this.generatePartnerOnboardingFunnel(),
      performance: this.generatePerformanceMetrics(),
      predictions: this.generatePredictiveInsights(),
      drillDown: this.generateDrillDownData()
    };
  }

  // Real-time data simulation
  generateRealTimeUpdate(): Partial<AnalyticsDashboardData> {
    return {
      overview: {
        totalContacts: Math.floor(Math.random() * 5), // New contacts today
        activeDeals: Math.floor(Math.random() * 3), // New deals
        completedDeals: Math.random() > 0.8 ? 1 : 0, // Occasional completion
        revenue: Math.floor(Math.random() * 50000), // Daily revenue
        trends: {
          contacts: Math.random() * 4 - 2, // ±2% daily change
          deals: Math.random() * 6 - 3, // ±3% daily change
          revenue: Math.random() * 8 - 4 // ±4% daily change
        }
      }
    };
  }

  // Bottleneck analysis
  identifyBottlenecks(funnelData: FunnelStageData[]): {
    stage: string;
    severity: 'low' | 'medium' | 'high';
    impact: number;
    suggestions: string[];
  }[] {
    return funnelData
      .filter(stage => stage.dropoffRate > 10) // Only stages with >10% dropoff
      .map(stage => {
        const severity: 'low' | 'medium' | 'high' = stage.dropoffRate > 25 ? 'high' : stage.dropoffRate > 15 ? 'medium' : 'low';
        const impact = stage.dropoffRate * stage.count / 100;
        
        const suggestions = {
          'NDA Signed': [
            'Simplify NDA language',
            'Provide NDA templates',
            'Offer legal consultation'
          ],
          'KYC Verification': [
            'Streamline document collection',
            'Implement automated verification',
            'Provide clear requirements checklist'
          ],
          'Commercial Terms': [
            'Create standard pricing tiers',
            'Offer flexible payment options',
            'Provide ROI calculators'
          ],
          'Technical Integration': [
            'Improve API documentation',
            'Offer integration support',
            'Create sandbox environment'
          ]
        };

        return {
          stage: stage.stage,
          severity,
          impact: Math.round(impact * 10) / 10,
          suggestions: suggestions[stage.stage as keyof typeof suggestions] || ['Review process efficiency']
        };
      })
      .sort((a, b) => b.impact - a.impact);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService; 