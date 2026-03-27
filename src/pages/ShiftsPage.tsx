import { Clock, User } from 'lucide-react';

export default function ShiftsPage() {
  const shifts = [
    { name: 'محمد جمعة (Mohammed Gomaa)', time: '08:00 – 16:00', active: true },
    { name: 'إبراهيم (Ibrahim)', time: '16:00 – 00:00', active: false },
    { name: 'محمود (Mahmoud)', time: '00:00 – 08:00', active: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center">
          <Clock className="mr-3 text-blue-400" size={28} />
          Shift Management
        </h1>
      </div>

      <div className="space-y-4">
        {shifts.map((shift, idx) => (
          <div key={idx} className={`financial-card p-6 border ${shift.active ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-slate-800/60'}`}>
            <div className="flex justify-between items-center border-slate-800">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${shift.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <User size={20} />
                </div>
                <div>
                  <span className="text-lg font-semibold text-slate-100 block">{shift.name}</span>
                  <span className="text-sm text-slate-400 font-medium">{shift.time}</span>
                </div>
              </div>
              {shift.active ? (
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
                  Active Now
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-semibold">
                  Scheduled
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
