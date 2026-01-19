import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { useAttendance, useAttendanceStats, useUpdateAttendance, useDeleteAttendance } from '@/hooks/useAttendance';
import { useMembers } from '@/hooks/useMembers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AttendanceCheckIn from '@/components/attendance/AttendanceCheckIn';
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  BarChart3,
  Bell,
  Users,
  TrendingUp,
  Trash2,
  Edit
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AttendancePageProps {
  category?: 'school' | 'church' | 'organization';
}

const AttendancePage = ({ category = 'school' }: AttendancePageProps) => {
  const { t } = useTranslation();
  const { organization, loading: orgLoading } = useOrganization();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('daily');
  const [checkInOpen, setCheckInOpen] = useState(false);
  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance(
    organization?.id, 
    formattedDate
  );
  
  const { data: members = [] } = useMembers(organization?.id);
  
  // Stats for different periods
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  
  const { data: dailyStats } = useAttendanceStats(organization?.id, today, today);
  const { data: weeklyStats } = useAttendanceStats(organization?.id, weekStart, weekEnd);
  const { data: monthlyStats } = useAttendanceStats(organization?.id, monthStart, monthEnd);
  
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();
  
  // Get unique classes from members
  const classes = Array.from(new Set(members.map(m => m.grade_level).filter(Boolean)));
  
  // Filter attendance by class
  const filteredAttendance = selectedClass === 'all' 
    ? attendance 
    : attendance.filter(a => a.class_name === selectedClass);

  if (orgLoading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'excused': return <MinusCircle className="h-5 w-5 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Présent</Badge>;
      case 'absent': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Absent</Badge>;
      case 'late': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">En retard</Badge>;
      case 'excused': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Excusé</Badge>;
      default: return null;
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'present' | 'absent' | 'late' | 'excused') => {
    await updateAttendance.mutateAsync({ id, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (organization?.id) {
      await deleteAttendance.mutateAsync({ id, organizationId: organization.id });
    }
  };

  const stats = dailyStats || { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
  const percentPresent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const memberLabel = category === 'school' ? 'élèves' : 'membres';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('school.sidebar.attendance')}</h1>
          <p className="text-muted-foreground">
            Gérez la présence des {memberLabel}
          </p>
        </div>
        <Button onClick={() => setCheckInOpen(true)}>
          <Users className="mr-2 h-4 w-4" />
          Faire l'Appel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="daily">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Appel Journalier
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {category === 'school' && classes.length > 0 && (
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls!}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Présents</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground">{percentPresent}% du total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absents</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% du total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Retard</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% du total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excusés</CardTitle>
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.excused / stats.total) * 100) : 0}% du total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Appel du {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                {selectedClass !== 'all' && ` - ${selectedClass}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center h-32">
                  <span className="text-muted-foreground">Chargement...</span>
                </div>
              ) : filteredAttendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune présence enregistrée pour cette date</p>
                  <Button variant="outline" className="mt-4" onClick={() => setCheckInOpen(true)}>
                    Faire l'appel maintenant
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{category === 'school' ? 'Élève' : 'Membre'}</TableHead>
                      {category === 'school' && <TableHead>Classe</TableHead>}
                      <TableHead>Statut</TableHead>
                      <TableHead>Heure</TableHead>
                      <TableHead>Remarque</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={record.member?.photo_url || undefined} />
                              <AvatarFallback>
                                {record.member?.first_name?.[0]}{record.member?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {record.member?.first_name} {record.member?.last_name}
                            </span>
                          </div>
                        </TableCell>
                        {category === 'school' && (
                          <TableCell>{record.class_name || record.member?.grade_level || '-'}</TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            {getStatusBadge(record.status)}
                          </div>
                        </TableCell>
                        <TableCell>{record.check_in_time || '-'}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {record.note || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleStatusChange(record.id, 'present')}
                              title="Marquer présent"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleStatusChange(record.id, 'absent')}
                              title="Marquer absent"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleStatusChange(record.id, 'late')}
                              title="Marquer en retard"
                            >
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(record.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{dailyStats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Présents</span>
                    <span className="font-bold text-green-600">{dailyStats?.present || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Absents</span>
                    <span className="font-bold text-red-600">{dailyStats?.absent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">En retard</span>
                    <span className="font-bold text-yellow-600">{dailyStats?.late || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{weeklyStats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Présents</span>
                    <span className="font-bold text-green-600">{weeklyStats?.present || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Absents</span>
                    <span className="font-bold text-red-600">{weeklyStats?.absent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">En retard</span>
                    <span className="font-bold text-yellow-600">{weeklyStats?.late || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ce mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{monthlyStats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Présents</span>
                    <span className="font-bold text-green-600">{monthlyStats?.present || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Absents</span>
                    <span className="font-bold text-red-600">{monthlyStats?.absent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">En retard</span>
                    <span className="font-bold text-yellow-600">{monthlyStats?.late || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Rapports détaillés</h3>
              <p>Les graphiques et rapports détaillés seront disponibles prochainement.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notifications Parents</h3>
              <p>Configurez les notifications automatiques pour les absences.</p>
              <Button variant="outline" className="mt-4">
                Configurer les notifications
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Check-in Dialog */}
      {organization && (
        <AttendanceCheckIn
          open={checkInOpen}
          onOpenChange={setCheckInOpen}
          organizationId={organization.id}
          category={category}
        />
      )}
    </motion.div>
  );
};

export default AttendancePage;
