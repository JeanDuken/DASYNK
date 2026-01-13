import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, BookOpen, Clock, Calendar } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  level: string;
  teacher: string;
  students: number;
  schedule: string;
  room: string;
}

const mockClasses: ClassData[] = [
  { id: '1', name: '6ème A', level: '6ème', teacher: 'M. Dupont', students: 32, schedule: 'Lun-Ven 8h-16h', room: 'Salle 101' },
  { id: '2', name: '5ème B', level: '5ème', teacher: 'Mme Martin', students: 28, schedule: 'Lun-Ven 8h-16h', room: 'Salle 102' },
  { id: '3', name: '4ème A', level: '4ème', teacher: 'M. Bernard', students: 30, schedule: 'Lun-Ven 8h-16h', room: 'Salle 201' },
];

const ClassesPage = () => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('classes');

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  const filteredClasses = mockClasses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('school.sidebar.classes')}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('common.add')} Classe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Classe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">Formulaire de création de classe à venir...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="levels">Niveaux</TabsTrigger>
          <TabsTrigger value="schedule">Emplois du temps</TabsTrigger>
          <TabsTrigger value="subjects">Matières</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockClasses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockClasses.reduce((acc, c) => acc + c.students, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne/Classe</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(mockClasses.reduce((acc, c) => acc + c.students, 0) / mockClasses.length)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Élèves</TableHead>
                  <TableHead>Horaires</TableHead>
                  <TableHead>Salle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{classItem.level}</Badge>
                    </TableCell>
                    <TableCell>{classItem.teacher}</TableCell>
                    <TableCell>{classItem.students}</TableCell>
                    <TableCell>{classItem.schedule}</TableCell>
                    <TableCell>{classItem.room}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion des Niveaux</h3>
              <p>Configurez les niveaux scolaires et les cycles d'enseignement.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Emplois du Temps</h3>
              <p>Gérez les plannings de cours et les affectations des salles.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Matières</h3>
              <p>Configurez les matières enseignées et les coefficients.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ClassesPage;
