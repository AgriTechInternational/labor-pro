import { Users, LogIn, LogOut, Clock, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';

export default function AttendancePage() {
  const [workerName, setWorkerName] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial Fetch
    const fetchRecords = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from(tables.ATTENDANCE)
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (data) setRecords(data);
    };

    fetchRecords();

    // Realtime Subscription
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tables.ATTENDANCE },
        (payload) => {
          setRecords((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAttendance = async (type: 'IN' | 'OUT') => {
    if (!workerName.trim()) {
      alert('Please enter worker name');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from(tables.ATTENDANCE)
        .insert({
          worker_id: workerName.trim(), // Mapping workerName to worker_id for now
          type,
          location: 'Main Factory'
        });

      if (error) throw error;
      setWorkerName('');
    } catch (error) {
      console.error('Error adding record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center">
          <Users className="mr-3 text-blue-400" size={28} />
          Attendance Track
        </h1>
      </div>

      <div className="financial-card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Worker Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              className="financial-input w-full pl-11 py-3.5"
              placeholder="Full name of worker..."
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleAttendance('IN')}
          disabled={loading}
          className="financial-card p-6 flex flex-col items-center justify-center space-y-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 active:scale-95 group transition-all"
        >
          <div className="w-14 h-14 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <LogIn size={28} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-emerald-500">Check In</span>
        </button>

        <button 
          onClick={() => handleAttendance('OUT')}
          disabled={loading}
          className="financial-card p-6 flex flex-col items-center justify-center space-y-3 hover:border-red-500/50 hover:bg-red-500/5 active:scale-95 group transition-all"
        >
          <div className="w-14 h-14 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <LogOut size={28} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-red-500">Check Out</span>
        </button>
      </div>

      <div className="financial-card p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-200 flex items-center">
            <Clock className="mr-2 text-slate-500" size={18} />
            Today's Log
          </h3>
          <span className="text-[10px] font-black bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-tighter">Live Sync</span>
        </div>
        
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-slate-600 mb-2">No active records yet</div>
              <p className="text-[10px] text-slate-700 font-mono uppercase">Scanning database...</p>
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/50 bg-slate-900/30 animate-in translate-y-0 opacity-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${rec.type === 'IN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                  <span className="font-semibold text-slate-200">{rec.worker_id}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${rec.type === 'IN' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {rec.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
