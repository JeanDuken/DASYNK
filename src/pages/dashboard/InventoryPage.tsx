import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, AlertTriangle, TrendingDown } from 'lucide-react';

const InventoryPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('organization.sidebar.inventory')}</h1>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter Article</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Articles</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">248</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Catégories</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Stock faible</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">8</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Valeur totale</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">€15,420</div></CardContent></Card>
      </div>
      <Card className="p-6 text-center text-muted-foreground">
        <Package className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gestion des Stocks</h3>
        <p>Suivez vos équipements, fournitures et ressources matérielles.</p>
      </Card>
    </motion.div>
  );
};

export default InventoryPage;
