import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, Briefcase, GraduationCap, Building, Mail, Phone } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'leave';
  hireDate: string;
  photo?: string;
}

const mockStaff: StaffMember[] = [
  { id: '1', name: 'Jean Dupont', email: 'jean.dupont@ecole.com', phone: '+33 6 12 34 56 78', role: 'Enseignant', department: 'Mathématiques', status: 'active', hireDate: '2020-09-01' },
  { id: '2', name: 'Marie Martin', email: 'marie.martin@ecole.com', phone: '+33 6 23 45 67 89', role: 'Enseignant', department: 'Français', status: 'active', hireDate: '2019-09-01' },
  { id: '3', name: 'Pierre Bernard', email: 'pierre.bernard@ecole.com', phone: '+33 6 34 56 78 90', role: 'Directeur', department: 'Administration', status: 'active', hireDate: '2015-09-01' },
  { id: '4', name: 'Sophie Petit', email: 'sophie.petit@ecole.com', phone: '+33 6 45 67 89 01', role: 'Secrétaire', department: 'Administration', status: 'leave', hireDate: '2021-01-15' },
];

const StaffPage = () => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('staff');

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  const filteredStaff = mockStaff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
      case 'leave': return <Badge className="bg-yellow-100 text-yellow-800">En congé</Badge>;
      default: return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('school.sidebar.staff')}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter Personnel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Membre du Personnel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">Formulaire d'ajout à venir...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Personnel</TabsTrigger>
          <TabsTrigger value="teachers">Enseignants</TabsTrigger>
          <TabsTrigger value="admin">Administration</TabsTrigger>
          <TabsTrigger value="payroll">Paie</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre du personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStaff.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStaff.filter(s => s.role === 'Enseignant').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administration</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStaff.filter(s => s.department === 'Administration').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Congé</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStaff.filter(s => s.status === 'leave').length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Date d'embauche</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.photo} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" /> {member.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" /> {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.department}</Badge>
                    </TableCell>
                    <TableCell>{new Date(member.hireDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <GraduationCap className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enseignants</h3>
              <p>Gérez les enseignants, leurs matières et leurs emplois du temps.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Building className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Personnel Administratif</h3>
              <p>Gérez le personnel administratif et de support.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestion de la Paie</h3>
              <p>Gérez les salaires, les primes et les fiches de paie.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StaffPage;
