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
import { Plus, Search, Calendar, Clock, MapPin, Users, CalendarDays } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  attendees: number;
  maxAttendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface EventsPageProps {
  category: 'school' | 'church' | 'organization';
}

const mockEvents: Event[] = [
  { id: '1', title: 'Réunion Parents-Professeurs', description: 'Rencontre trimestrielle avec les parents', date: '2024-01-20', time: '18:00', location: 'Salle des fêtes', type: 'Réunion', attendees: 45, maxAttendees: 100, status: 'upcoming' },
  { id: '2', title: 'Fête de l\'École', description: 'Célébration annuelle de fin d\'année', date: '2024-06-28', time: '14:00', location: 'Cour de l\'école', type: 'Fête', attendees: 200, maxAttendees: 300, status: 'upcoming' },
  { id: '3', title: 'Sortie au Musée', description: 'Visite pédagogique pour les 6ème', date: '2024-02-15', time: '09:00', location: 'Musée d\'Histoire', type: 'Sortie', attendees: 35, maxAttendees: 40, status: 'upcoming' },
  { id: '4', title: 'Conseil de Classe', description: 'Conseil du 1er trimestre - 6ème A', date: '2024-01-10', time: '17:00', location: 'Salle de réunion', type: 'Réunion', attendees: 12, maxAttendees: 15, status: 'completed' },
];

const EventsPage = ({ category }: EventsPageProps) => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  const getTitle = () => {
    switch (category) {
      case 'school': return t('school.sidebar.events');
      case 'church': return t('church.sidebar.events');
      case 'organization': return t('organization.sidebar.events');
    }
  };

  const filteredEvents = mockEvents.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || e.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <Badge className="bg-blue-100 text-blue-800">À venir</Badge>;
      case 'ongoing': return <Badge className="bg-green-100 text-green-800">En cours</Badge>;
      case 'completed': return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un Événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouvel Événement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">Formulaire de création d'événement à venir...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="ongoing">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockEvents.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">À Venir</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {mockEvents.filter(e => e.status === 'upcoming').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockEvents.reduce((acc, e) => acc + e.attendees, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{event.type}</Badge>
                    {getStatusBadge(event.status)}
                  </div>
                  <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} / {event.maxAttendees} participants</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <CalendarDays className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun événement trouvé</h3>
                <p>Créez votre premier événement pour commencer.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EventsPage;
