import { Calendar, CreditCard as Edit2, Trash2, Clock, Image } from 'lucide-react';
import { ScheduledPost } from '../lib/supabase';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-sky-100 text-sky-700',
  published: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-600',
};

interface PostCardProps {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return null;
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 24) return `${Math.floor(hrs / 24)}d from now`;
  if (hrs > 0) return `${hrs}h ${mins}m from now`;
  return `${mins}m from now`;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const until = timeUntil(post.scheduled_at);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[post.status] ?? STATUS_STYLES.draft}`}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(post)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 mb-3">{post.content}</p>

      {post.media_url && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Image size={12} />
          <span className="truncate max-w-[200px]">{post.media_url}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(post.scheduled_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatTime(post.scheduled_at)}
          </span>
        </div>
        {until && post.status === 'scheduled' && (
          <span className="text-xs text-sky-500 font-medium">{until}</span>
        )}
        <span className="text-xs text-gray-300">{post.character_count} chars</span>
      </div>
    </div>
  );
}
