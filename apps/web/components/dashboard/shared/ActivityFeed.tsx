"use client";

import { format } from "date-fns";

interface Activity {
  type: "user_added" | "question_created" | "paper_generated" | "paper_approved" | "paper_rejected" | "invite_sent";
  description: string;
  timestamp: string | Date;
  actor?: string;
}

const activityTypeLabels: Record<string, string> = {
  user_added: "User Added",
  question_created: "Question Created",
  paper_generated: "Paper Generated",
  paper_approved: "Paper Approved",
  paper_rejected: "Paper Rejected",
  invite_sent: "Invite Sent"
};

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
}

export function ActivityFeed({
  activities,
  title = "Recent Activity",
  maxItems = 5
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>

      {displayActivities.length === 0 ? (
        <p className="text-slate-400 text-sm">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between py-3 border-b border-white/5 last:border-0"
            >
              <div className="flex-1">
                <p className="text-slate-300 text-sm mb-1">{activity.description}</p>
                <p className="text-xs text-slate-500">
                  {activityTypeLabels[activity.type]}
                  {activity.actor && ` • by ${activity.actor}`}
                </p>
              </div>
              <time className="text-xs text-slate-500 ml-4 flex-shrink-0">
                {format(
                  new Date(activity.timestamp),
                  activity.timestamp instanceof Date
                    ? "MMM d, HH:mm"
                    : "MMM d, HH:mm"
                )}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
