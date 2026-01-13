import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap, Plus } from 'lucide-react';

const DiscipleshipPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('church.sidebar.discipleship')}</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Nouveau Programme</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Programmes actifs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">5</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Participants</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">87</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Formateurs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Diplômés</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">156</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <BookOpen className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Formation et Discipolat</h3>
        <p>Gérez les programmes de formation, suivez la progression des disciples.</p>
      </Card>
    </motion.div>
  );
};

export default DiscipleshipPage;
