import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, TrendingUp, Award, Calculator, Download } from 'lucide-react';

interface GradeRecord {
  id: string;
  student: string;
  class: string;
  subject: string;
  exam: string;
  grade: number;
  maxGrade: number;
  date: string;
  status: 'validated' | 'pending' | 'draft';
}

const mockGrades: GradeRecord[] = [
  { id: '1', student: 'Jean Dupont', class: '6ème A', subject: 'Maths', exam: 'Contrôle 1', grade: 15, maxGrade: 20, date: '2024-01-15', status: 'validated' },
  { id: '2', student: 'Marie Martin', class: '6ème A', subject: 'Français', exam: 'Dictée', grade: 18, maxGrade: 20, date: '2024-01-14', status: 'validated' },
  { id: '3', student: 'Pierre Bernard', class: '5ème B', subject: 'Sciences', exam: 'TP Chimie', grade: 14, maxGrade: 20, date: '2024-01-13', status: 'pending' },
  { id: '4', student: 'Sophie Petit', class: '4ème A', subject: 'Histoire', exam: 'Exposé', grade: 16, maxGrade: 20, date: '2024-01-12', status: 'validated' },
];

const GradesPage = () => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [activeTab, setActiveTab] = useState('grades');

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  const filteredGrades = mockGrades.filter(g => {
    const matchesSearch = g.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || g.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated': return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'draft': return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      default: return null;
    }
  };

  const getGradeColor = (grade: number, max: number) => {
    const percentage = (grade / max) * 100;
    if (percentage >= 80) return 'text-green-600 font-bold';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('school.sidebar.grades')}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Saisir Notes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="grades">Notes</TabsTrigger>
          <TabsTrigger value="exams">Examens</TabsTrigger>
          <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève ou une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="6ème A">6ème A</SelectItem>
                <SelectItem value="5ème B">5ème B</SelectItem>
                <SelectItem value="4ème A">4ème A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14.5/20</div>
                <p className="text-xs text-muted-foreground">+0.3 vs trimestre précédent</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notes Saisies</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockGrades.length}</div>
                <p className="text-xs text-muted-foreground">Ce mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">Notes ≥ 10/20</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellences</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Notes ≥ 16/20</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Examen</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.exam}</TableCell>
                    <TableCell className={getGradeColor(record.grade, record.maxGrade)}>
                      {record.grade}/{record.maxGrade}
                    </TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion des Examens</h3>
              <p>Planifiez et gérez les examens, contrôles et évaluations.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bulletins">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bulletins Scolaires</h3>
              <p>Générez et imprimez les bulletins de notes.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Statistiques</h3>
              <p>Analysez les performances par classe, matière et période.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default GradesPage;
