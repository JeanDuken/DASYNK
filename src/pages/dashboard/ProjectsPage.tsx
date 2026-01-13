import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, CheckCircle, Clock, Users } from 'lucide-react';

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('organization.sidebar.projects')}</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Nouveau Projet</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Projets actifs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">8</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">En cours</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">5</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Terminés</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">12</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Bénéficiaires</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1,250</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <Briefcase className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gestion des Projets</h3>
        <p>Créez et suivez vos projets, programmes et initiatives.</p>
      </Card>
    </motion.div>
  );
};

export default ProjectsPage;
