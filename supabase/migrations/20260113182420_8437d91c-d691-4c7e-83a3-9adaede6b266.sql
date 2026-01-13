-- Table for groups (church groups, ministries, etc.)
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'ministry',
  leader_id UUID REFERENCES public.members(id),
  meeting_day TEXT,
  meeting_time TEXT,
  meeting_location TEXT,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for group members
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- Table for services (church services)
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT DEFAULT 'sunday',
  day_of_week TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for service attendance
CREATE TABLE public.service_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  total_attendees INTEGER DEFAULT 0,
  men_count INTEGER DEFAULT 0,
  women_count INTEGER DEFAULT 0,
  children_count INTEGER DEFAULT 0,
  visitors_count INTEGER DEFAULT 0,
  offering_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_attendees INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for event registrations
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  status TEXT DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false
);

-- Table for visitors
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  how_heard TEXT,
  prayer_request TEXT,
  follow_up_status TEXT DEFAULT 'pending',
  follow_up_notes TEXT,
  assigned_to UUID REFERENCES public.members(id),
  converted_to_member BOOLEAN DEFAULT false,
  member_id UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for communications (messages, announcements)
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'announcement',
  channel TEXT DEFAULT 'email',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for communication recipients
CREATE TABLE public.communication_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  communication_id UUID NOT NULL REFERENCES public.communications(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE
);

-- Table for media (sermons, videos, etc.)
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'sermon',
  url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  speaker TEXT,
  recorded_date DATE,
  series TEXT,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for discipleship tracking
CREATE TABLE public.discipleship (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.members(id),
  program_name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  status TEXT DEFAULT 'in_progress',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipleship ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view groups of their organization" ON public.groups
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage groups of their organization" ON public.groups
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    group_id IN (SELECT id FROM public.groups WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can manage group members" ON public.group_members
  FOR ALL USING (
    group_id IN (SELECT id FROM public.groups WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()))
  );

-- RLS Policies for services
CREATE POLICY "Users can view services of their organization" ON public.services
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage services of their organization" ON public.services
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for service_attendance
CREATE POLICY "Users can view attendance of their organization" ON public.service_attendance
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage attendance of their organization" ON public.service_attendance
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for events
CREATE POLICY "Users can view events of their organization" ON public.events
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage events of their organization" ON public.events
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for event_registrations
CREATE POLICY "Users can view event registrations" ON public.event_registrations
  FOR SELECT USING (
    event_id IN (SELECT id FROM public.events WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can manage event registrations" ON public.event_registrations
  FOR ALL USING (
    event_id IN (SELECT id FROM public.events WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()))
  );

-- RLS Policies for visitors
CREATE POLICY "Users can view visitors of their organization" ON public.visitors
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage visitors of their organization" ON public.visitors
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for communications
CREATE POLICY "Users can view communications of their organization" ON public.communications
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage communications of their organization" ON public.communications
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for communication_recipients
CREATE POLICY "Users can view recipients" ON public.communication_recipients
  FOR SELECT USING (
    communication_id IN (SELECT id FROM public.communications WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can manage recipients" ON public.communication_recipients
  FOR ALL USING (
    communication_id IN (SELECT id FROM public.communications WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()))
  );

-- RLS Policies for media
CREATE POLICY "Users can view media of their organization" ON public.media
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage media of their organization" ON public.media
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- RLS Policies for discipleship
CREATE POLICY "Users can view discipleship of their organization" ON public.discipleship
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage discipleship of their organization" ON public.discipleship
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- Create trigger for updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON public.visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON public.communications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discipleship_updated_at BEFORE UPDATE ON public.discipleship FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();