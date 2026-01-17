-- Table des tâches avec isolation par organisation
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to UUID REFERENCES public.members(id) ON DELETE SET NULL,
  created_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Les membres peuvent voir les tâches de leur organisation
CREATE POLICY "Users can view tasks of their organization"
ON public.tasks
FOR SELECT
USING (is_organization_member(organization_id, auth.uid()));

-- Policy: Les admins peuvent gérer toutes les tâches de leur organisation
CREATE POLICY "Admins can manage tasks"
ON public.tasks
FOR ALL
USING (is_organization_admin(organization_id, auth.uid()));

-- Policy: Les membres peuvent créer des tâches dans leur organisation
CREATE POLICY "Members can create tasks"
ON public.tasks
FOR INSERT
WITH CHECK (is_organization_member(organization_id, auth.uid()));

-- Policy: Les membres peuvent modifier les tâches qu'ils ont créées
CREATE POLICY "Members can update their tasks"
ON public.tasks
FOR UPDATE
USING (
  is_organization_member(organization_id, auth.uid()) 
  AND created_by = auth.uid()
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);