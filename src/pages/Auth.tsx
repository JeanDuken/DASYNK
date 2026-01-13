import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(form.email, form.password, form.fullName);
        if (error) throw error;
        navigate('/welcome');
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--gradient-hero)' }}>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="text-white">
          <Link to="/" className="font-display text-4xl font-bold mb-8 block">DASYNK</Link>
          <h2 className="font-display text-3xl font-semibold mb-4">
            {isSignUp ? t('auth.createYourAccount') : t('auth.welcomeBack')}
          </h2>
          <p className="text-white/70 text-lg">
            {isSignUp ? t('auth.joinDasynk') : t('auth.signInToContinue')}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md bg-card rounded-2xl p-8 shadow-xl">
          <h1 className="font-display text-2xl font-bold mb-6">
            {isSignUp ? t('auth.createAccount') : t('auth.login')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <Input id="fullName" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input-focus" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-focus" required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-focus" required minLength={6} />
            </div>
            <Button type="submit" className="w-full btn-hero" disabled={loading}>
              {loading ? t('common.loading') : isSignUp ? t('auth.createAccount') : t('auth.login')}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
              {isSignUp ? t('auth.login') : t('auth.signup')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
