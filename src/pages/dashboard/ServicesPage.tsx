import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Church, Calendar, Clock, Users, Plus, Video } from 'lucide-react';

const ServicesPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('church.sidebar.services')}</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Planifier un Culte</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Cultes ce mois</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">8</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Moyenne présence</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">145</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Prochain culte</CardTitle></CardHeader><CardContent><div className="text-lg font-bold">Dimanche 10h</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Équipes de service</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">6</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <Church className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gestion des Cultes</h3>
        <p>Planifiez les cultes, gérez les équipes de service et suivez les présences.</p>
      </Card>
    </motion.div>
  );
};

export default ServicesPage;
