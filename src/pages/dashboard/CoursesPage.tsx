import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, BookOpen, Video, FileText, Play, Clock, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  lessons: number;
  duration: string;
  students: number;
  progress: number;
  status: 'active' | 'draft' | 'archived';
}

const mockCourses: Course[] = [
  { id: '1', title: 'Mathématiques - Algèbre', subject: 'Maths', teacher: 'M. Dupont', lessons: 12, duration: '8h', students: 45, progress: 75, status: 'active' },
  { id: '2', title: 'Français - Littérature', subject: 'Français', teacher: 'Mme Martin', lessons: 15, duration: '10h', students: 52, progress: 60, status: 'active' },
  { id: '3', title: 'Sciences - Physique', subject: 'Sciences', teacher: 'M. Bernard', lessons: 10, duration: '6h', students: 38, progress: 40, status: 'active' },
  { id: '4', title: 'Histoire - Moyen Âge', subject: 'Histoire', teacher: 'Mme Petit', lessons: 8, duration: '5h', students: 41, progress: 90, status: 'active' },
];

const CoursesPage = () => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  const filteredCourses = mockCourses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('school.sidebar.courses')}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un Cours
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Cours</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">Formulaire de création de cours à venir...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Cours</TabsTrigger>
          <TabsTrigger value="lessons">Leçons</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="assignments">Devoirs</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cours</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCourses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leçons</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCourses.reduce((acc, c) => acc + c.lessons, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Étudiants Inscrits</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCourses.reduce((acc, c) => acc + c.students, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heures de Contenu</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">29h</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{course.subject}</Badge>
                    <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.teacher}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" /> {course.lessons} leçons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {course.students}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                  <Button variant="outline" className="w-full">
                    <Play className="mr-2 h-4 w-4" /> Voir le cours
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lessons">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Video className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion des Leçons</h3>
              <p>Créez et organisez les leçons vidéo et contenus interactifs.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ressources Pédagogiques</h3>
              <p>Gérez les documents, fichiers et supports de cours.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Devoirs et Exercices</h3>
              <p>Assignez et corrigez les travaux des élèves.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CoursesPage;
