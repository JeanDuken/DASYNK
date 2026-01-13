import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Phone, Bell, Send } from 'lucide-react';

interface CommunicationPageProps {
  category: 'church' | 'organization';
}

const CommunicationPage = ({ category }: CommunicationPageProps) => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t(`${category}.sidebar.communication`)}</h1>
        <Button><Send className="mr-2 h-4 w-4" />Nouveau Message</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Emails envoyés</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">156</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">SMS envoyés</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">89</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Annonces</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Taux d'ouverture</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">68%</div></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 text-center hover:shadow-lg cursor-pointer"><Mail className="mx-auto h-12 w-12 mb-4 text-blue-600" /><h3 className="font-semibold">Email</h3><p className="text-sm text-muted-foreground">Envoi d'emails en masse</p></Card>
        <Card className="p-6 text-center hover:shadow-lg cursor-pointer"><Phone className="mx-auto h-12 w-12 mb-4 text-green-600" /><h3 className="font-semibold">SMS</h3><p className="text-sm text-muted-foreground">Messages texte</p></Card>
        <Card className="p-6 text-center hover:shadow-lg cursor-pointer"><Bell className="mx-auto h-12 w-12 mb-4 text-purple-600" /><h3 className="font-semibold">Annonces</h3><p className="text-sm text-muted-foreground">Notifications push</p></Card>
      </div>
    </motion.div>
  );
};

export default CommunicationPage;
