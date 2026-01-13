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
import { Plus, Search, Users, UsersRound, UserPlus } from 'lucide-react';

const GroupsPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  const mockGroups = [
    { id: '1', name: 'Chorale', type: 'Département', members: 25, leader: 'Marie Martin' },
    { id: '2', name: 'Jeunesse', type: 'Groupe', members: 45, leader: 'Jean Dupont' },
    { id: '3', name: 'Diacres', type: 'Département', members: 12, leader: 'Pierre Bernard' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('church.sidebar.groups')}</h1>
        <Dialog>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Créer un Groupe</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Créer un Groupe</DialogTitle></DialogHeader></DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Groupes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{mockGroups.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Membres Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{mockGroups.reduce((a, g) => a + g.members, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Départements</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{mockGroups.filter(g => g.type === 'Département').length}</div></CardContent></Card>
      </div>
      <Card>
        <div className="p-4"><Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Responsable</TableHead><TableHead>Membres</TableHead></TableRow></TableHeader>
          <TableBody>
            {mockGroups.map(g => (
              <TableRow key={g.id}><TableCell>{g.name}</TableCell><TableCell><Badge variant="outline">{g.type}</Badge></TableCell><TableCell>{g.leader}</TableCell><TableCell>{g.members}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
};

export default GroupsPage;
