import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, UserCheck, UserX, Clock, AlertTriangle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  student: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  time?: string;
  note?: string;
}

const mockAttendance: AttendanceRecord[] = [
  { id: '1', student: 'Jean Dupont', class: '6ème A', date: '2024-01-15', status: 'present', time: '08:00' },
  { id: '2', student: 'Marie Martin', class: '6ème A', date: '2024-01-15', status: 'late', time: '08:15', note: 'Retard bus' },
  { id: '3', student: 'Pierre Bernard', class: '6ème A', date: '2024-01-15', status: 'absent' },
  { id: '4', student: 'Sophie Petit', class: '6ème A', date: '2024-01-15', status: 'excused', note: 'Rendez-vous médical' },
  { id: '5', student: 'Lucas Moreau', class: '6ème A', date: '2024-01-15', status: 'present', time: '08:00' },
];

const AttendancePage = () => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [selectedClass, setSelectedClass] = useState('6ème A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('daily');

  if (loading) {
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
      case 'present': return <Badge className="bg-green-100 text-green-800">Présent</Badge>;
      case 'absent': return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late': return <Badge className="bg-yellow-100 text-yellow-800">En retard</Badge>;
      case 'excused': return <Badge className="bg-blue-100 text-blue-800">Excusé</Badge>;
      default: return null;
    }
  };

  const stats = {
    present: mockAttendance.filter(a => a.status === 'present').length,
    absent: mockAttendance.filter(a => a.status === 'absent').length,
    late: mockAttendance.filter(a => a.status === 'late').length,
    excused: mockAttendance.filter(a => a.status === 'excused').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('school.sidebar.attendance')}</h1>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Faire l'Appel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="daily">Appel Journalier</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="discipline">Discipline</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6ème A">6ème A</SelectItem>
                <SelectItem value="5ème B">5ème B</SelectItem>
                <SelectItem value="4ème A">4ème A</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Présents</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground">{Math.round((stats.present / mockAttendance.length) * 100)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absents</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">{Math.round((stats.absent / mockAttendance.length) * 100)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Retard</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <p className="text-xs text-muted-foreground">{Math.round((stats.late / mockAttendance.length) * 100)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excusés</CardTitle>
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                <p className="text-xs text-muted-foreground">{Math.round((stats.excused / mockAttendance.length) * 100)}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Appel - {selectedClass} - {new Date(selectedDate).toLocaleDateString('fr-FR')}</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Remarque</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </TableCell>
                    <TableCell>{record.time || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{record.note || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Rapports de Présence</h3>
              <p>Consultez les statistiques et rapports de présence par période.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="discipline">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion de la Discipline</h3>
              <p>Gérez les incidents disciplinaires et les sanctions.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notifications Parents</h3>
              <p>Envoyez des notifications automatiques aux parents en cas d'absence.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AttendancePage;
