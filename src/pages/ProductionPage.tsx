import { Target, Save, CheckCircle2, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, tables } from '../lib/supabase';

export default function ProductionPage() {
  const [qty, setQty] = useState('');
  const [defects, setDefects] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  useEffect(() => {
    // Initial Fetch
    const fetchRecentEntries = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from(tables.PRODUCTION)
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setRecentEntries(data);
    };

    fetchRecentEntries();

    // Realtime Subscription
    const channel = supabase
      .channel('production_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tables.PRODUCTION },
        (payload) => {
          setRecentEntries((prev) => [payload.new, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || parseFloat(qty) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from(tables.PRODUCTION)
        .insert({
          worker_id: 'System', // Mandatory field in schema
          quantity: parseFloat(qty),
          defects: parseFloat(defects) || 0,
          notes: notes.trim(),
          shift: 'Morning' // Default shift for MVP
        });

      if (error) throw error;
      setQty('');
      setDefects('');
      setNotes('');
      alert('Production units logged successfully!');
    } catch (error) {
      console.error('Error logging production:', error);
      alert('Failed to save. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center">
          <Target className="mr-3 text-blue-400" size={28} />
          Production Entry
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="financial-card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Produced Quantity</label>
            <input 
              type="number" 
              className="financial-input w-full py-3" 
              placeholder="0.00" 
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Defects (الهالك)</label>
            <input 
              type="number" 
              className="financial-input w-full py-3" 
              placeholder="0" 
              value={defects}
              onChange={(e) => setDefects(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Production Notes</label>
          <textarea 
            className="financial-input w-full min-h-[80px] py-3 text-sm" 
            placeholder="Shift details, machine issues..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:-0.3s]"></span>
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Submit Production Unit
            </>
          )}
        </button>
      </form>

      {recentEntries.length > 0 && (
        <div className="financial-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-300 flex items-center text-sm">
              <History className="mr-2 text-slate-500" size={16} />
              Recent Shift Records
            </h3>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{entry.quantity} Units Produced</div>
                    <div className="text-[10px] text-slate-500 font-mono">Defects: {entry.defects}</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-600">
                  {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
