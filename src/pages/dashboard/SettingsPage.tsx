import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Palette, CreditCard, Shield, Users, Download, Upload, Globe, Bell, Mail } from 'lucide-react';

interface SettingsPageProps {
  category: 'school' | 'church' | 'organization';
}

const SettingsPage = ({ category }: SettingsPageProps) => {
  const { t } = useTranslation();
  const { organization, loading } = useOrganization();
  const [activeTab, setActiveTab] = useState('general');

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
          <TabsTrigger value="organization">{t('settings.organization')}</TabsTrigger>
          <TabsTrigger value="branding">{t('settings.branding')}</TabsTrigger>
          <TabsTrigger value="payments">{t('settings.payments')}</TabsTrigger>
          <TabsTrigger value="roles">{t('settings.roles')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Paramètres Généraux
              </CardTitle>
              <CardDescription>Configurez les paramètres de base de votre plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuseau Horaire</Label>
                  <Select defaultValue="europe-paris">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-paris">Europe/Paris</SelectItem>
                      <SelectItem value="america-new-york">America/New York</SelectItem>
                      <SelectItem value="africa-kinshasa">Africa/Kinshasa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select defaultValue="EUR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar ($)</SelectItem>
                      <SelectItem value="XOF">Franc CFA (FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format de Date</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">JJ/MM/AAAA</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/JJ/AAAA</SelectItem>
                      <SelectItem value="yyyy-mm-dd">AAAA-MM-JJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Enregistrer les modifications</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications push dans le navigateur</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Résumé hebdomadaire</Label>
                  <p className="text-sm text-muted-foreground">Recevoir un résumé hebdomadaire par email</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informations de l'Organisation
              </CardTitle>
              <CardDescription>Modifiez les informations de votre {category === 'school' ? 'école' : category === 'church' ? 'église' : 'organisation'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input defaultValue={organization?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue={organization?.email || ''} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input defaultValue={organization?.phone || ''} />
                </div>
                <div className="space-y-2">
                  <Label>Site Web</Label>
                  <Input defaultValue={organization?.website || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Textarea defaultValue={organization?.address || ''} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={organization?.description || ''} rows={4} />
              </div>
              <Button>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Image de Marque
              </CardTitle>
              <CardDescription>Personnalisez l'apparence de votre plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline">Télécharger un logo</Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Couleur Principale</Label>
                  <div className="flex gap-2">
                    <Input type="color" defaultValue={organization?.primary_color || '#3B82F6'} className="w-16 h-10" />
                    <Input defaultValue={organization?.primary_color || '#3B82F6'} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Couleur Secondaire</Label>
                  <div className="flex gap-2">
                    <Input type="color" defaultValue={organization?.secondary_color || '#10B981'} className="w-16 h-10" />
                    <Input defaultValue={organization?.secondary_color || '#10B981'} />
                  </div>
                </div>
              </div>
              <Button>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configuration des Paiements
              </CardTitle>
              <CardDescription>Configurez les méthodes de paiement acceptées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                    STRIPE
                  </div>
                  <div>
                    <Label>Stripe</Label>
                    <p className="text-sm text-muted-foreground">Acceptez les cartes bancaires</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                    PP
                  </div>
                  <div>
                    <Label>PayPal</Label>
                    <p className="text-sm text-muted-foreground">Acceptez les paiements PayPal</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                    MM
                  </div>
                  <div>
                    <Label>Mobile Money</Label>
                    <p className="text-sm text-muted-foreground">Acceptez Orange Money, MTN Money, etc.</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rôles et Permissions
              </CardTitle>
              <CardDescription>Gérez les rôles et les accès des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg divide-y">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <Label>Administrateur</Label>
                    <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <Label>Gestionnaire</Label>
                    <p className="text-sm text-muted-foreground">Gestion des membres et des finances</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <Label>Membre</Label>
                    <p className="text-sm text-muted-foreground">Accès en lecture seule</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
              </div>
              <Button variant="outline">
                Ajouter un nouveau rôle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Authentification à deux facteurs (2FA)</Label>
                  <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sessions actives</Label>
                  <p className="text-sm text-muted-foreground">Gérez les appareils connectés</p>
                </div>
                <Button variant="outline" size="sm">Voir</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Historique des connexions</Label>
                  <p className="text-sm text-muted-foreground">Consultez l'historique des connexions</p>
                </div>
                <Button variant="outline" size="sm">Voir</Button>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline">Changer le mot de passe</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Import / Export
              </CardTitle>
              <CardDescription>Importez ou exportez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importer des données
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter toutes les données
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SettingsPage;
