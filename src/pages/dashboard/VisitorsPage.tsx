import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, PhoneCall, Plus } from 'lucide-react';

const VisitorsPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('church.sidebar.visitors')}</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Enregistrer Visiteur</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Visiteurs ce mois</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">23</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">À suivre</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">8</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Convertis</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">5</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Nouveaux membres</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">3</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <UserPlus className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Suivi des Visiteurs</h3>
        <p>Enregistrez les visiteurs, planifiez les suivis et convertissez-les en membres.</p>
      </Card>
    </motion.div>
  );
};

export default VisitorsPage;
