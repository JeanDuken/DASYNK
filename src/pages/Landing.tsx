import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Users, DollarSign, Mail, Calendar, Shield, Church, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';

const Landing = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Globe, key: 'website' },
    { icon: Users, key: 'database' },
    { icon: DollarSign, key: 'finance' },
    { icon: Mail, key: 'communication' },
    { icon: Calendar, key: 'events' },
    { icon: Shield, key: 'security' },
  ];

  const categories = [
    { key: 'church', icon: Church, gradient: 'card-church' },
    { key: 'school', icon: GraduationCap, gradient: 'card-school' },
    { key: 'organization', icon: Building2, gradient: 'card-organization' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-gradient">DASYNK</Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/auth">
              <Button variant="ghost">{t('auth.login')}</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="btn-hero px-6 py-2 text-sm">{t('auth.signup')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
              {t('landing.hero.title')} <br />
              <span className="text-primary">{t('landing.hero.titleHighlight')}</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">{t('landing.hero.subtitle')}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button className="btn-hero">{t('landing.hero.cta')}</Button>
              </Link>
              <Button variant="outline" className="btn-hero-outline border-white/30 text-white hover:bg-white/10">
                {t('landing.hero.secondaryCta')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, key }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-elevated">
                <div className="feature-icon mb-4"><Icon className="w-6 h-6 text-white" /></div>
                <h3 className="font-display text-xl font-semibold mb-2">{t(`landing.features.${key}.title`)}</h3>
                <p className="text-muted-foreground">{t(`landing.features.${key}.description`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">{t('landing.categories.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('landing.categories.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map(({ key, icon: Icon, gradient }) => (
              <motion.div key={key} whileHover={{ scale: 1.03 }} className={`card-category ${gradient}`}>
                <Icon className="w-16 h-16 mb-6 opacity-90" />
                <h3 className="font-display text-2xl font-bold mb-3">{t(`landing.categories.${key}.title`)}</h3>
                <p className="opacity-90">{t(`landing.categories.${key}.description`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground">© 2024 DASYNK. {t('landing.footer.rights')}</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground">{t('landing.footer.privacy')}</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">{t('landing.footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
