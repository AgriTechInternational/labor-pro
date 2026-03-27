import { LayoutDashboard, Wallet, CheckCircle, Flame, Users, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';

export default function OverviewPage() {
  const [metrics, setMetrics] = useState({
    totalProduction: 0,
    attendanceCount: 0,
    activeWorkers: 0
  });

  const baseSalary = 5000;
  const productionBonus = metrics.totalProduction > 1000 ? 2500 : 0;
  const attendanceBonus = metrics.attendanceCount > 20 ? 2500 : 0;

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.toISOString();

    const fetchMetrics = async () => {
      // Fetch Today's Production
      const { data: prodData } = await supabase
        .from(tables.PRODUCTION)
        .select('quantity')
        .gte('created_at', startOfToday);
      
      const total = prodData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

      // Fetch Today's Attendance
      const { data: attData } = await supabase
        .from(tables.ATTENDANCE)
        .select('worker_id')
        .gte('created_at', startOfToday);

      const uniqueWorkers = new Set(attData?.map(item => item.worker_id)).size;

      setMetrics({
        totalProduction: total,
        attendanceCount: attData?.length || 0,
        activeWorkers: uniqueWorkers
      });
    };

    fetchMetrics();

    // Subscribe to both tables
    const channel = supabase
      .channel('dashboard_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tables.PRODUCTION }, () => fetchMetrics())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tables.ATTENDANCE }, () => fetchMetrics())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center">
          <LayoutDashboard className="mr-3 text-blue-400" size={28} />
          Labor Console
        </h1>
        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Realtime Data</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="financial-card p-5 group hover:border-blue-500/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Today's Output</span>
            <Target className="text-blue-400 group-hover:scale-110 transition-transform" size={18} />
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalProduction.toLocaleString()}</p>
          <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Units Produced</div>
        </div>
        
        <div className="financial-card p-5 group hover:border-emerald-500/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Staff</span>
            <Users className="text-emerald-400 group-hover:scale-110 transition-transform" size={18} />
          </div>
          <p className="text-2xl font-black text-emerald-400">{metrics.activeWorkers}</p>
          <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Workers On-Site</div>
        </div>
        
        <div className="financial-card p-5 col-span-2 md:col-span-1 group hover:border-orange-500/40">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Performance</span>
            <Flame className="text-orange-400 group-hover:scale-110 transition-transform" size={18} />
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalProduction > 0 ? (metrics.totalProduction / 10).toFixed(1) : 0}%</p>
          <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Efficiency Target</div>
        </div>
      </div>

      <div className="financial-card p-7 border-slate-700/50 relative overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-950/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="text-slate-500" size={16} />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Estimated Payout</h3>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter flex items-end">
            {(baseSalary + productionBonus + attendanceBonus).toLocaleString()} 
            <span className="text-lg text-slate-500 ml-2 mb-1.5 font-bold uppercase">EGP</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-xl">
              <CheckCircle size={14} className="text-emerald-500 mr-2" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Base Salary Locked</span>
            </div>
            {productionBonus > 0 && (
              <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <CheckCircle size={14} className="text-emerald-400 mr-2" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Production Bonus Match</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
