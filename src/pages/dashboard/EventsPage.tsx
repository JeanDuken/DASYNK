import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEvents, EventInsert } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Calendar, Clock, MapPin, Users, CalendarDays, Edit, Trash2 } from 'lucide-react';

interface EventsPageProps {
  category: 'school' | 'church' | 'organization';
}

const EventsPage = ({ category }: EventsPageProps) => {
  const { t } = useTranslation();
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof events[0] | null>(null);
  const [formData, setFormData] = useState<EventInsert>({
    title: '',
    description: '',
    event_type: 'general',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: '',
    location: '',
    max_attendees: undefined,
    registration_required: false,
    status: 'upcoming',
  });

  const resetForm = () => {
    setFormData({
      title: '', description: '', event_type: 'general',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: '', location: '', max_attendees: undefined, registration_required: false, status: 'upcoming',
    });
    setEditingEvent(null);
  };

  const handleSubmit = async () => {
    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...formData });
    } else {
      await createEvent.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (event: typeof events[0]) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type || 'general',
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date?.slice(0, 16) || '',
      location: event.location || '',
      max_attendees: event.max_attendees || undefined,
      registration_required: event.registration_required || false,
      status: event.status || 'upcoming',
    });
    setIsDialogOpen(true);
  };

  const getTitle = () => {
    switch (category) {
      case 'school': return t('school.sidebar.events');
      case 'church': return t('church.sidebar.events');
      case 'organization': return t('organization.sidebar.events');
    }
  };

  const eventTypes = [
    { value: 'general', label: 'Général' },
    { value: 'meeting', label: 'Réunion' },
    { value: 'celebration', label: 'Célébration' },
    { value: 'training', label: 'Formation' },
    { value: 'outreach', label: 'Évangélisation' },
    { value: 'conference', label: 'Conférence' },
    { value: 'retreat', label: 'Retraite' },
    { value: 'other', label: 'Autre' },
  ];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const now = new Date();
    const eventDate = new Date(e.start_date);
    
    if (activeTab === 'upcoming') return matchesSearch && eventDate >= now && e.status !== 'cancelled';
    if (activeTab === 'completed') return matchesSearch && (eventDate < now || e.status === 'completed');
    if (activeTab === 'cancelled') return matchesSearch && e.status === 'cancelled';
    return matchesSearch;
  });

  const getStatusBadge = (status: string | null, startDate: string) => {
    const now = new Date();
    const eventDate = new Date(startDate);
    
    if (status === 'cancelled') return <Badge variant="destructive">Annulé</Badge>;
    if (eventDate < now) return <Badge variant="secondary">Terminé</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">À venir</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Créer un Événement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Modifier l\'Événement' : 'Créer un Événement'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Conférence annuelle" />
              </div>
              <div className="space-y-2">
                <Label>Type d'événement</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description de l'événement..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date/Heure de début *</Label>
                  <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date/Heure de fin</Label>
                  <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lieu</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Ex: Salle principale" />
              </div>
              <div className="space-y-2">
                <Label>Nombre max de participants</Label>
                <Input type="number" value={formData.max_attendees || ''} onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || undefined })} placeholder="Illimité" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Inscription requise</Label>
                <Switch checked={formData.registration_required} onCheckedChange={(c) => setFormData({ ...formData, registration_required: c })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={!formData.title || !formData.start_date}>
                {editingEvent ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un événement..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Événements</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{events.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">À Venir</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">
                {events.filter(e => new Date(e.start_date) >= new Date() && e.status !== 'cancelled').length}
              </div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Inscriptions</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{events.reduce((acc, e) => acc + (e.registration_count || 0), 0)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Ce Mois</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">
                {events.filter(e => new Date(e.start_date).getMonth() === new Date().getMonth()).length}
              </div></CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}</Badge>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(event.status, event.start_date)}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEvent.mutate(event.id)}>Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                  {event.description && <CardDescription>{event.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.start_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(event.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.registration_count || 0}{event.max_attendees ? ` / ${event.max_attendees}` : ''} inscrits</span>
                  </div>
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
