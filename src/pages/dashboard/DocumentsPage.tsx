import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, FileText, Upload } from 'lucide-react';

const DocumentsPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('organization.sidebar.documents')}</h1>
        <Button><Upload className="mr-2 h-4 w-4" />Téléverser</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Documents</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">156</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Dossiers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">24</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Espace utilisé</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">2.4 GB</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Partagés</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">18</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <FolderOpen className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gestion Documentaire</h3>
        <p>Organisez, partagez et archivez vos documents importants.</p>
      </Card>
    </motion.div>
  );
};

export default DocumentsPage;
