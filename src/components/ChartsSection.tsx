import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
} from 'chart.js';
import { StoreItem, MasterDataMap, WeekKey } from '../types';
import { BarChart3, LineChart, TrendingUp, Award, Layers } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
);

interface ChartsSectionProps {
  currentData: StoreItem[];
  masterData: MasterDataMap;
  currentMonth: string;
  currentWeek: WeekKey;
  periodLabel: string;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  currentData,
  masterData,
  currentMonth,
  currentWeek,
  periodLabel,
}) => {
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstanceRef = useRef<ChartJS | null>(null);
  const trendChartInstanceRef = useRef<ChartJS | null>(null);

  const [topCount, setTopCount] = useState<number>(10);

  // Render Bar Chart (Sell Out vs Sell In for Top Stores)
  useEffect(() => {
    if (!barCanvasRef.current) return;

    if (barChartInstanceRef.current) {
      barChartInstanceRef.current.destroy();
    }

    const sorted = [...currentData]
      .sort((a, b) => b.sellOut - a.sellOut)
      .slice(0, topCount);

    const labels = sorted.map((d) => {
      // Shorten name if too long for clean display
      const name = d.shop;
      return name.length > 18 ? name.substring(0, 16) + '...' : name;
    });

    const sellOuts = sorted.map((d) => d.sellOut);
    const sellIns = sorted.map((d) => d.sellIn);
    const renos = sorted.map((d) => d.reno);
    const a7s = sorted.map((d) => d.a7pro);

    const ctx = barCanvasRef.current.getContext('2d');
    if (!ctx) return;

    barChartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Sell Out (Máy)',
            data: sellOuts,
            backgroundColor: '#10b981',
            hoverBackgroundColor: '#059669',
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          },
          {
            label: 'Sell In (Máy)',
            data: sellIns,
            backgroundColor: '#3b82f6',
            hoverBackgroundColor: '#2563eb',
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { family: 'Inter', size: 12, weight: 600 },
            },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { family: 'Inter', size: 12, weight: 700 },
            bodyFont: { family: 'Inter', size: 11 },
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              afterBody: (context) => {
                const idx = context[0].dataIndex;
                const item = sorted[idx];
                const ratio = item.sellIn > 0 ? ((item.sellOut / item.sellIn) * 100).toFixed(1) : '0';
                return `Reno: ${item.reno} | A7PRO: ${item.a7pro} | Tỷ lệ: ${ratio}%`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxRotation: 35,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              font: { size: 11 },
            },
          },
        },
      },
    });

    return () => {
      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy();
      }
    };
  }, [currentData, topCount]);

  // Render Trend Line Chart (12 Months 2026)
  useEffect(() => {
    if (!trendCanvasRef.current) return;

    if (trendChartInstanceRef.current) {
      trendChartInstanceRef.current.destroy();
    }

    const months = [
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
    ];

    const labels = [
      'Thg 1',
      'Thg 2',
      'Thg 3',
      'Thg 4',
      'Thg 5',
      'Thg 6',
      'Thg 7',
      'Thg 8',
      'Thg 9',
      'Thg 10',
      'Thg 11',
      'Thg 12',
    ];

    const totalSOs = months.map((m) =>
      masterData[m]
        ? masterData[m].fullMonth.reduce((acc, cur) => acc + Number(cur.sellOut || 0), 0)
        : 0
    );

    const totalSIs = months.map((m) =>
      masterData[m]
        ? masterData[m].fullMonth.reduce((acc, cur) => acc + Number(cur.sellIn || 0), 0)
        : 0
    );

    const ctx = trendCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create gradient fills
    const soGradient = ctx.createLinearGradient(0, 0, 0, 300);
    soGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    soGradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    const siGradient = ctx.createLinearGradient(0, 0, 0, 300);
    siGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    siGradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');

    trendChartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sell Out',
            data: totalSOs,
            borderColor: '#10b981',
            backgroundColor: soGradient,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Sell In',
            data: totalSIs,
            borderColor: '#3b82f6',
            backgroundColor: siGradient,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { family: 'Inter', size: 12, weight: 600 },
            },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { family: 'Inter', size: 12, weight: 700 },
            bodyFont: { family: 'Inter', size: 11 },
            padding: 10,
            cornerRadius: 10,
            callbacks: {
              afterBody: (context) => {
                const idx = context[0].dataIndex;
                const so = totalSOs[idx];
                const si = totalSIs[idx];
                const r = si > 0 ? ((so / si) * 100).toFixed(1) : '0';
                return `Tỷ lệ hấp thụ: ${r}%`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } },
          },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
      }
    };
  }, [masterData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart (Top Dealers) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/70 lg:col-span-2 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              So Sánh Sell Out vs Sell In (Top Đại Lý)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Xếp hạng theo sản lượng thực bán của các điểm bán hàng đầu
            </p>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                onClick={() => setTopCount(5)}
                className={`px-2 py-1 rounded-md transition ${topCount === 5 ? 'bg-white shadow-xs text-emerald-700 font-bold' : ''}`}
              >
                Top 5
              </button>
              <button
                onClick={() => setTopCount(10)}
                className={`px-2 py-1 rounded-md transition ${topCount === 10 ? 'bg-white shadow-xs text-emerald-700 font-bold' : ''}`}
              >
                Top 10
              </button>
              <button
                onClick={() => setTopCount(15)}
                className={`px-2 py-1 rounded-md transition ${topCount === 15 ? 'bg-white shadow-xs text-emerald-700 font-bold' : ''}`}
              >
                Top 15
              </button>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 whitespace-nowrap">
              {periodLabel}
            </span>
          </div>
        </div>
        <div className="relative h-72 sm:h-80 w-full flex-grow">
          <canvas ref={barCanvasRef} />
        </div>
      </div>

      {/* Line Chart (12 Months Trend) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/70 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Xu Hướng 12 Tháng (2026)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Đường cong sản lượng tiêu thụ & nhập hàng
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            Năm 2026
          </span>
        </div>
        <div className="relative h-72 sm:h-80 w-full flex-grow">
          <canvas ref={trendCanvasRef} />
        </div>
      </div>
    </div>
  );
};
