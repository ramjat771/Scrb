import { ScheduledPost } from '../lib/supabase';
import { CalendarClock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
interface StatsBarProps {
  posts: ScheduledPost[];
}
export default function StatsBar({ posts }: StatsBarProps) {
  const scheduled = posts.filter(p => p.status === 'scheduled').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const published = posts.filter(p => p.status === 'published').length;
  const failed = posts.filter(p => p.status === 'failed').length;
  const stats = [
    { label: 'Scheduled', value: scheduled, icon: CalendarClock, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Drafts', value: drafts, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Published', value: published, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Failed', value: failed, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={color} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}