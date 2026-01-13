import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Briefcase, Target, TrendingUp, TrendingDown, Calendar, BookOpen } from 'lucide-react';

const stats = [
  { key: 'members', icon: Users, value: '234', change: '+18', trend: 'up' },
  { key: 'donations', icon: DollarSign, value: '$28,750', change: '+22%', trend: 'up' },
  { key: 'projects', icon: Briefcase, value: '12', change: '+2', trend: 'up' },
  { key: 'goals', icon: Target, value: '85%', change: '+5%', trend: 'up' },
];

const recentActivities = [
  { id: 1, type: 'member', message: 'New volunteer registered: Maria Garcia', time: '30 min ago' },
  { id: 2, type: 'donation', message: 'Donation received: $1,000 from ABC Corp', time: '2 hours ago' },
  { id: 3, type: 'project', message: 'Project milestone completed: Water Well #3', time: '1 day ago' },
  { id: 4, type: 'event', message: 'Fundraiser event scheduled for next month', time: '2 days ago' },
];

const upcomingEvents = [
  { id: 1, title: 'Board Meeting', date: 'Jan 15, 2026', type: 'meeting' },
  { id: 2, title: 'Charity Gala', date: 'Jan 25, 2026', type: 'fundraiser' },
  { id: 3, title: 'Volunteer Training', date: 'Jan 18, 2026', type: 'training' },
];

const OrganizationDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.overview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-organization/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-organization" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground capitalize">{stat.key}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-organization" />
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>Latest updates from your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-organization" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-organization" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Scheduled activities and meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-organization/10 text-organization capitalize">
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
