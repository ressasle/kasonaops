import { MessageSquare, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    type: 'chat',
    title: 'Disney Analyse abgeschlossen',
    time: 'Vor 2 Stunden',
    icon: MessageSquare,
    color: 'text-accent',
  },
  {
    type: 'alert',
    title: 'Klumpenrisiko: MSFT bei 12.5%',
    time: 'Vor 4 Stunden',
    icon: AlertTriangle,
    color: 'text-primary',
  },
  {
    type: 'insight',
    title: 'Portfolio +2.34% heute',
    time: 'Vor 6 Stunden',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    type: 'document',
    title: 'MSFT Q3 Report analysiert',
    time: 'Gestern',
    icon: FileText,
    color: 'text-muted-foreground',
  },
];

export function RecentActivity() {
  return (
    <div className="glass-panel rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Letzte Aktivität</h2>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 group cursor-pointer"
          >
            <div
              className={cn(
                'p-2 rounded-lg bg-muted/50 transition-colors',
                'group-hover:bg-muted'
              )}
            >
              <activity.icon size={16} className={activity.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
