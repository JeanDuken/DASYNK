import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCommunications, CommunicationInsert } from '@/hooks/useCommunications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Send, Mail, MessageSquare, Bell, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';

interface CommunicationPageProps {
  category: 'church' | 'organization';
}

const CommunicationPage = ({ category }: CommunicationPageProps) => {
  const { t } = useTranslation();
  const { communications, isLoading, createCommunication, updateCommunication, deleteCommunication, sendCommunication } = useCommunications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComm, setEditingComm] = useState<typeof communications[0] | null>(null);
  const [formData, setFormData] = useState<CommunicationInsert>({
    title: '',
    content: '',
    type: 'announcement',
    channel: 'email',
    status: 'draft',
  });

  const resetForm = () => {
    setFormData({ title: '', content: '', type: 'announcement', channel: 'email', status: 'draft' });
    setEditingComm(null);
  };

  const handleSubmit = async () => {
    if (editingComm) {
      await updateCommunication.mutateAsync({ id: editingComm.id, ...formData });
    } else {
      await createCommunication.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (comm: typeof communications[0]) => {
    setEditingComm(comm);
    setFormData({
      title: comm.title,
      content: comm.content,
      type: comm.type || 'announcement',
      channel: comm.channel || 'email',
      status: comm.status || 'draft',
    });
    setIsDialogOpen(true);
  };

  const commTypes = [
    { value: 'announcement', label: 'Annonce' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'reminder', label: 'Rappel' },
    { value: 'invitation', label: 'Invitation' },
    { value: 'notification', label: 'Notification' },
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
    { value: 'push', label: 'Notification push', icon: Bell },
  ];

  const filteredComms = communications.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'draft') return matchesSearch && c.status === 'draft';
    if (activeTab === 'sent') return matchesSearch && c.status === 'sent';
    if (activeTab === 'scheduled') return matchesSearch && c.status === 'scheduled';
    return matchesSearch;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Brouillon</Badge>;
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-800">Programmé</Badge>;
      case 'sent': return <Badge className="bg-green-100 text-green-800">Envoyé</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string | null) => {
    const ch = channels.find(c => c.value === channel);
    if (ch) {
      const Icon = ch.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Mail className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t(`${category}.sidebar.communication`)}</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nouvelle Communication</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingComm ? 'Modifier la Communication' : 'Nouvelle Communication'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Annonce importante" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {commTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {channels.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contenu *</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Contenu du message..." rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={!formData.title || !formData.content}>
                {editingComm ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{communications.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Brouillons</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{communications.filter(c => c.status === 'draft').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Envoyés</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{communications.filter(c => c.status === 'sent').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Destinataires</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{communications.reduce((acc, c) => acc + (c.recipient_count || 0), 0)}</div></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="draft">Brouillons</TabsTrigger>
          <TabsTrigger value="scheduled">Programmés</TabsTrigger>
          <TabsTrigger value="sent">Envoyés</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComms.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell className="font-medium">{comm.title}</TableCell>
                      <TableCell>{commTypes.find(t => t.value === comm.type)?.label || comm.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(comm.channel)}
                          {channels.find(c => c.value === comm.channel)?.label || comm.channel}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(comm.status)}</TableCell>
                      <TableCell>
                        {comm.sent_at 
                          ? new Date(comm.sent_at).toLocaleDateString('fr-FR')
                          : new Date(comm.created_at).toLocaleDateString('fr-FR')
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {comm.status === 'draft' && (
                            <Button variant="ghost" size="icon" onClick={() => sendCommunication.mutate(comm.id)} title="Envoyer">
                              <Send className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(comm)}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette communication ?</AlertDialogTitle>
                                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCommunication.mutate(comm.id)}>Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredComms.length === 0 && (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune communication trouvée</h3>
                <p>Créez votre première communication pour commencer.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CommunicationPage;
