import { useState, useMemo } from 'react';
import { ChecklistItem } from '@/types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggleItem: (itemId: string, completed: boolean) => void;
}

export function Checklist({ items, onToggleItem }: ChecklistProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};

    for (const item of items) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }

    return groups;
  }, [items]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const required = items.filter((i) => i.required).length;
    const requiredCompleted = items.filter((i) => i.required && i.completed).length;

    return {
      total,
      completed,
      pending: total - completed,
      required,
      requiredCompleted,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [items]);

  // Filtered items
  const filteredGroups = useMemo(() => {
    const result: Record<string, ChecklistItem[]> = {};

    for (const [category, categoryItems] of Object.entries(groupedItems)) {
      const filtered = categoryItems.filter((item) => {
        if (filter === 'pending') return !item.completed;
        if (filter === 'completed') return item.completed;
        return true;
      });

      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }

    return result;
  }, [groupedItems, filter]);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">התקדמות</span>
          <span className="text-sm text-secondary">
            {stats.completed}/{stats.total} הושלמו
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
        {stats.required > 0 && (
          <div className="text-xs text-secondary mt-2">
            מסמכי חובה: {stats.requiredCompleted}/{stats.required}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-surface text-secondary hover:bg-gray-100'
            }`}
          >
            {f === 'all' && `הכל (${stats.total})`}
            {f === 'pending' && `ממתינים (${stats.pending})`}
            {f === 'completed' && `הושלמו (${stats.completed})`}
          </button>
        ))}
      </div>

      {/* Grouped items */}
      <div className="space-y-4">
        {Object.entries(filteredGroups).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-secondary mb-2">{category}</h3>
            <div className="space-y-1">
              {categoryItems.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onToggle={(completed) => onToggleItem(item.id, completed)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(filteredGroups).length === 0 && (
        <div className="text-center py-8 text-secondary">
          {filter === 'pending' ? 'כל המסמכים הושלמו!' : 'אין פריטים'}
        </div>
      )}
    </div>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
}: {
  item: ChecklistItem;
  onToggle: (completed: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        item.completed ? 'bg-success/5' : 'bg-surface hover:bg-gray-100'
      }`}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            item.completed
              ? 'bg-success border-success'
              : 'border-border bg-white'
          }`}
        >
          {item.completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              item.completed ? 'text-secondary line-through' : 'text-primary'
            }`}
          >
            {item.item}
          </span>
          {item.required && !item.completed && (
            <span className="badge badge-danger">חובה</span>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-secondary mt-0.5">{item.notes}</p>
        )}
      </div>
    </label>
  );
}
