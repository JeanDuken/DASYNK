import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Church, GraduationCap, Building2, ArrowRight, Check } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type CategoryType = 'church' | 'school' | 'organization';

const categories: { type: CategoryType; icon: typeof Church; color: string }[] = [
  { type: 'church', icon: Church, color: 'from-church to-church/80' },
  { type: 'school', icon: GraduationCap, color: 'from-school to-school/80' },
  { type: 'organization', icon: Building2, color: 'from-organization to-organization/80' },
];

const SelectCategory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user already has an organization and redirect
  useEffect(() => {
    const checkExistingOrganization = async () => {
      if (!user) return;
      
      const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('id, type')
        .eq('owner_id', user.id)
        .limit(1);
      
      if (existingOrgs && existingOrgs.length > 0) {
        // User already has an organization, redirect to dashboard
        navigate(`/dashboard/${existingOrgs[0].type}`);
      }
    };
    
    checkExistingOrganization();
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!selectedCategory || !user) return;
    
    setIsLoading(true);
    try {
      // Create organization with selected category
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: `My ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
          slug: `${selectedCategory}-${user.id.substring(0, 8)}`,
          type: selectedCategory,
          owner_id: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Update profile as onboarding completed
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      navigate(`/dashboard/${selectedCategory}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('categorySelection.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('categorySelection.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {categories.map(({ type, icon: Icon, color }, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedCategory === type
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:ring-1 hover:ring-primary/50'
                }`}
                onClick={() => setSelectedCategory(type)}
              >
                <CardHeader className="text-center pb-2">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${color} mx-auto mb-4 relative`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                    {selectedCategory === type && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {t(`categorySelection.${type}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm">
                    {t(`categorySelection.${type}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedCategory || isLoading}
            className="gap-2 text-lg px-8 py-6"
          >
            {isLoading
              ? t('common.loading')
              : t('categorySelection.continue', { category: selectedCategory ? t(`categorySelection.${selectedCategory}.title`) : '' })}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SelectCategory;
