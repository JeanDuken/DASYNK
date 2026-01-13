import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Upload, Play, Image, Music, FileVideo } from 'lucide-react';

const MediaPage = () => {
  const { t } = useTranslation();
  const { loading } = useOrganization();
  if (loading) return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('church.sidebar.media')}</h1>
        <Button><Upload className="mr-2 h-4 w-4" />Téléverser</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Vidéos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">24</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Photos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">156</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Audio</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">48</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Live Streams</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">12</div></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 text-center hover:shadow-lg cursor-pointer"><FileVideo className="mx-auto h-12 w-12 mb-4 text-blue-600" /><h3 className="font-semibold">Sermons</h3><p className="text-sm text-muted-foreground">Enregistrements des prédications</p></Card>
        <Card className="p-6 text-center hover:shadow-lg cursor-pointer"><Image className="mx-auto h-12 w-12 mb-4 text-green-600" /><h3 className="font-semibold">Galerie Photos</h3><p className="text-sm text-muted-foreground">Albums et événements</p></Card>
        <Card className="p-6 text-center hover:shadow-lg cursor-pointer"><Music className="mx-auto h-12 w-12 mb-4 text-purple-600" /><h3 className="font-semibold">Musique</h3><p className="text-sm text-muted-foreground">Louanges et chants</p></Card>
      </div>
    </motion.div>
  );
};

export default MediaPage;
