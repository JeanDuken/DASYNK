import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Church, Heart, TrendingUp, TrendingDown, Calendar, BookOpen } from 'lucide-react';

const stats = [
  { key: 'members', icon: Users, value: '856', change: '+24', trend: 'up' },
  { key: 'tithes', icon: DollarSign, value: '$12,450', change: '+15%', trend: 'up' },
  { key: 'attendance', icon: Church, value: '342', change: '+8%', trend: 'up' },
  { key: 'visitors', icon: Heart, value: '18', change: '+5', trend: 'up' },
];

const recentActivities = [
  { id: 1, type: 'member', message: 'New member registered: Sarah Johnson', time: '1 hour ago' },
  { id: 2, type: 'tithe', message: 'Tithe received: $500 from John D.', time: '3 hours ago' },
  { id: 3, type: 'baptism', message: 'Baptism ceremony completed for 5 members', time: '1 day ago' },
  { id: 4, type: 'event', message: 'Youth retreat registration opened', time: '2 days ago' },
];

const upcomingEvents = [
  { id: 1, title: 'Sunday Worship Service', date: 'Jan 14, 2026', type: 'service' },
  { id: 2, title: 'Youth Retreat', date: 'Jan 20, 2026', type: 'event' },
  { id: 3, title: 'Bible Study Group', date: 'Jan 16, 2026', type: 'study' },
];

const ChurchDashboard = () => {
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
                    <div className="w-12 h-12 rounded-xl bg-church/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-church" />
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
                <BookOpen className="h-5 w-5 text-church" />
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>Latest updates from your church</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-church" />
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
                <Calendar className="h-5 w-5 text-church" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Scheduled services and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-church/10 text-church capitalize">
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

export default ChurchDashboard;
