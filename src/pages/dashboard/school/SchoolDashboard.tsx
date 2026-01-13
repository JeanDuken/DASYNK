import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, DollarSign, ClipboardCheck, TrendingUp, TrendingDown, Calendar, BookOpen } from 'lucide-react';

const stats = [
  { key: 'students', icon: Users, value: '1,234', change: '+12%', trend: 'up' },
  { key: 'teachers', icon: GraduationCap, value: '56', change: '+3', trend: 'up' },
  { key: 'revenue', icon: DollarSign, value: '$45,678', change: '+8%', trend: 'up' },
  { key: 'attendance', icon: ClipboardCheck, value: '94%', change: '-2%', trend: 'down' },
];

const recentActivities = [
  { id: 1, type: 'enrollment', message: 'New student enrolled: John Doe', time: '2 hours ago' },
  { id: 2, type: 'payment', message: 'Tuition payment received: $500', time: '4 hours ago' },
  { id: 3, type: 'grade', message: 'Grades published for Math Class A', time: '6 hours ago' },
  { id: 4, type: 'event', message: 'Parent meeting scheduled for Friday', time: '1 day ago' },
];

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: 'Jan 15, 2026', type: 'meeting' },
  { id: 2, title: 'Science Fair', date: 'Jan 20, 2026', type: 'event' },
  { id: 3, title: 'Mid-term Exams', date: 'Jan 25, 2026', type: 'exam' },
];

const SchoolDashboard = () => {
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
                    <div className="w-12 h-12 rounded-xl bg-school/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-school" />
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
                <BookOpen className="h-5 w-5 text-school" />
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>Latest updates from your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-school" />
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
                <Calendar className="h-5 w-5 text-school" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Scheduled events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-school/10 text-school capitalize">
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

export default SchoolDashboard;
