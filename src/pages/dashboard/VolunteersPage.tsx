import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Heart, Clock } from 'lucide-react';

const VolunteersPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('organization.sidebar.volunteers')}</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter Bénévole</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Bénévoles actifs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">45</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Équipes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">6</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Heures ce mois</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">320</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Missions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">15</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <Heart className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gestion des Bénévoles</h3>
        <p>Gérez vos bénévoles, leurs disponibilités et leurs missions.</p>
      </Card>
    </motion.div>
  );
};

export default VolunteersPage;
