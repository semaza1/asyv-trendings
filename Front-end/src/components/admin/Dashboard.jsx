import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats once, fetch activity on page change
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/dashboard/stats`)
      .then((res) => res.json())
      .then((statsRes) => {
        if (!statsRes.success) throw new Error("Failed to fetch stats");
        setStats(statsRes.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `${API_BASE_URL}/api/dashboard/recent-activity?page=${activityPage}&limit=10`,
    )
      .then((res) => res.json())
      .then((activityRes) => {
        if (!activityRes.success) throw new Error("Failed to fetch activity");
        setRecentActivity(activityRes.data);
        setActivityTotalPages(activityRes.pages || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activityPage]);

  // Stat cards config
  const statCards = stats
    ? [
        {
          title: "Total Posts",
          value:
            stats.news +
            stats.opportunities +
            stats.events +
            stats.sports +
            stats.projects +
            stats.didYouKnow,
          icon: FileText,
          gradient: "bg-gradient-primary",
        },
        {
          title: "Featured Content",
          value: "-",
          icon: Star,
          gradient: "bg-gradient-secondary",
        },
        {
          title: "Upcoming Events",
          value: stats.events,
          icon: Calendar,
          gradient: "bg-gradient-accent",
        },
        {
          title: "Active Opportunities",
          value: stats.opportunities,
          icon: TrendingUp,
          gradient: "bg-gradient-primary",
        },
      ]
    : [];

  const sectionCounts = stats
    ? [
        { name: "News", count: stats.news, color: "bg-primary" },
        {
          name: "Opportunities",
          count: stats.opportunities,
          color: "bg-secondary",
        },
        { name: "Events", count: stats.events, color: "bg-accent" },
        { name: "Sports", count: stats.sports, color: "bg-primary" },
        {
          name: "Student Projects",
          count: stats.projects,
          color: "bg-primary",
        },
        { name: "Did You Know", count: stats.didYouKnow, color: "bg-primary" },
        { name: "Visitors", count: stats.visitors, color: "bg-primary" },
        { name: "Users", count: stats.users, color: "bg-primary" },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to ASYV Trendings admin panel. Manage your content and track
          performance.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading dashboard...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.gradient}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  {/* You can add change % if you implement it in backend */}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates across all content sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-muted-foreground">
                    No recent activity.
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {activity.date
                              ? new Date(activity.date).toLocaleString()
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full bg-primary`} />
                    </div>
                  ))
                )}
                {/* Pagination Controls */}
                {activityTotalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      className="px-3 py-1 rounded bg-muted text-foreground disabled:opacity-50"
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      disabled={activityPage === 1}
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1">
                      Page {activityPage} of {activityTotalPages}
                    </span>
                    <button
                      className="px-3 py-1 rounded bg-muted text-foreground disabled:opacity-50"
                      onClick={() =>
                        setActivityPage((p) =>
                          Math.min(activityTotalPages, p + 1),
                        )
                      }
                      disabled={activityPage === activityTotalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Sections */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  Content Sections
                </CardTitle>
                <CardDescription>
                  Quick overview of all content sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sectionCounts.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${section.color}`}
                      />
                      <span className="font-medium text-foreground">
                        {section.name}
                      </span>
                    </div>
                    <Badge variant="secondary">{section.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
