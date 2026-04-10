# Dashboard Component Integration Examples

## How to Use StatCard

```tsx
import { StatCard } from "./StatCard";
import { Users, FileText, TrendingUp } from "lucide-react";

// In your workspace component:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard
    icon={Users}
    number={people?.users.length ?? 0}
    label="Total Faculty"
    color="indigo"
  />
  <StatCard
    icon={FileText}
    number={123}
    label="Active Questions"
    trend={{ value: 12, direction: "up" }}
    color="violet"
  />
  <StatCard
    icon={TrendingUp}
    number="87%"
    label="Completion Rate"
    color="emerald"
  />
</div>
```

## How to Use Table

```tsx
import { Table, TableColumn } from "./Table";

interface User {
  id: string;
  displayName: string;
  status: string;
  roleCodes: string[];
  joinedAt: string;
}

const columns: TableColumn<User>[] = [
  { key: "displayName", label: "Name", width: "200px" },
  { key: "status", label: "Status", width: "100px" },
  {
    key: "roleCodes",
    label: "Role",
    render: (roles) => roles.join(", ")
  },
  {
    key: "joinedAt",
    label: "Joined",
    render: (date) => format(new Date(date), "MMM d, yyyy")
  }
];

// In your render:
<Table<User>
  title="Team Members"
  columns={columns}
  data={people?.users ?? []}
  rowKey="id"
  emptyMessage="No team members yet"
  actions={(user) => (
    <div className="flex gap-2">
      <button className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Edit</button>
      <button className="text-xs px-2 py-1 rounded bg-red-600 text-white">Remove</button>
    </div>
  )}
/>
```

## How to Use ActivityFeed

```tsx
import { ActivityFeed } from "./ActivityFeed";

interface Activity {
  type: "user_added" | "question_created" | "paper_approved";
  description: string;
  timestamp: Date;
  actor?: string;
}

const activities: Activity[] = [
  {
    type: "user_added",
    description: "Dr. Sarah Mitchell joined the team",
    timestamp: new Date("2024-04-08"),
    actor: "Admin"
  },
  {
    type: "question_created",
    description: "New question set added to repository",
    timestamp: new Date("2024-04-08"),
    actor: "Dr. Mitchell"
  }
];

// In your render:
<ActivityFeed
  title="Recent Activity"
  activities={activities}
  maxItems={5}
/>
```

## Integration Checklist

For each workspace file, you can:

✅ **Institution Admin Workspace:**
- Replace the stats cards grid with StatCard components
- Replace the team list with Table component
- Replace activity list with ActivityFeed component
- Keep all existing API calls and state management

✅ **Faculty Workspace:**
- Use StatCard for questions/drafts/submitted stats
- Use Table for recent questions display
- Keep existing tab structure

✅ **Academic Head Workspace:**
- Use StatCard for department stats
- Use Table for pending review queue
- Keep existing analytics display

## Notes

- All new components are fully typed with TypeScript
- Components handle empty states gracefully
- Styling matches the existing dark SaaS aesthetic
- No breaking changes to existing API contracts
- All components support responsive design
