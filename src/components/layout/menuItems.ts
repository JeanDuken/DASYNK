import {
  LayoutDashboard,
  Users,
  UsersRound,
  Church,
  Video,
  DollarSign,
  BookOpen,
  UserPlus,
  Calendar,
  MessageSquare,
  Settings,
  GraduationCap,
  School,
  BookOpenCheck,
  ClipboardList,
  Wallet,
  UserCog,
  ClipboardCheck,
  Briefcase,
  FolderOpen,
  Package,
  CheckSquare,
  Building2,
  Music,
  Heart,
  FileText,
  Radio,
  Image,
  Play,
  type LucideIcon,
} from 'lucide-react';

// Interface pour les sous-menus
export interface SubMenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// Interface pour les items de menu (avec ou sans sous-menus)
export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  children?: SubMenuItem[];
}

// ==================== MENU ÉCOLE ====================
const schoolMenu: MenuItem[] = [
  { path: '', label: 'school.sidebar.dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'school.sidebar.students', icon: Users },
  { path: '/classes', label: 'school.sidebar.classes', icon: School },
  { path: '/courses', label: 'school.sidebar.courses', icon: BookOpenCheck },
  { path: '/grades', label: 'school.sidebar.grades', icon: ClipboardList },
  { path: '/tasks', label: 'common.tasks', icon: CheckSquare },
  { path: '/finance', label: 'school.sidebar.finance', icon: Wallet },
  { path: '/staff', label: 'school.sidebar.staff', icon: UserCog },
  { path: '/attendance', label: 'school.sidebar.attendance', icon: ClipboardCheck },
  { path: '/events', label: 'school.sidebar.events', icon: Calendar },
  { path: '/settings', label: 'school.sidebar.settings', icon: Settings },
];

// ==================== MENU ÉGLISE ====================
const churchMenu: MenuItem[] = [
  { path: '', label: 'church.sidebar.dashboard', icon: LayoutDashboard },
  
  // Section Membres
  {
    path: '/members',
    label: 'church.sidebar.members',
    icon: Users,
    children: [
      { path: '/members', label: 'church.members.list', icon: Users },
      { path: '/members/new', label: 'church.members.add', icon: UserPlus },
      { path: '/visitors', label: 'church.sidebar.visitors', icon: Heart },
    ],
  },

  // Section Groupes & Départements
  {
    path: '/groups',
    label: 'church.sidebar.groups',
    icon: UsersRound,
    children: [
      { path: '/groups', label: 'church.groups.list', icon: UsersRound },
      { path: '/groups/departments', label: 'church.groups.departments', icon: Building2 },
      { path: '/groups/ministries', label: 'church.groups.ministries', icon: Church },
    ],
  },

  // Section Services & Cultes
  {
    path: '/services',
    label: 'church.sidebar.services',
    icon: Church,
    children: [
      { path: '/services', label: 'church.services.schedule', icon: Calendar },
      { path: '/services/teams', label: 'church.services.teams', icon: Users },
      { path: '/services/attendance', label: 'church.services.attendance', icon: ClipboardCheck },
    ],
  },

  // Section Dons & Finances
  {
    path: '/finance',
    label: 'church.sidebar.finance',
    icon: DollarSign,
    children: [
      { path: '/finance', label: 'church.finance.dashboard', icon: LayoutDashboard },
      { path: '/finance/donations', label: 'church.finance.donations', icon: Heart },
      { path: '/finance/tithes', label: 'church.finance.tithes', icon: DollarSign },
      { path: '/finance/expenses', label: 'church.finance.expenses', icon: FileText },
      { path: '/finance/reports', label: 'church.finance.reports', icon: ClipboardList },
    ],
  },

  // Section Média & Streaming
  {
    path: '/media',
    label: 'church.sidebar.media',
    icon: Video,
    children: [
      { path: '/media', label: 'church.media.library', icon: Video },
      { path: '/media/sermons', label: 'church.media.sermons', icon: BookOpen },
      { path: '/media/worship', label: 'church.media.worship', icon: Music },
      { path: '/media/gallery', label: 'church.media.gallery', icon: Image },
      { path: '/media/livestream', label: 'church.media.livestream', icon: Radio },
    ],
  },

  // Autres sections
  { path: '/discipleship', label: 'church.sidebar.discipleship', icon: BookOpen },
  { path: '/tasks', label: 'common.tasks', icon: CheckSquare },
  { path: '/events', label: 'church.sidebar.events', icon: Calendar },
  { path: '/communication', label: 'church.sidebar.communication', icon: MessageSquare },
  { path: '/settings', label: 'church.sidebar.settings', icon: Settings },
];

// ==================== MENU ORGANISATION ====================
const organizationMenu: MenuItem[] = [
  { path: '', label: 'organization.sidebar.dashboard', icon: LayoutDashboard },
  { path: '/members', label: 'organization.sidebar.members', icon: Users },
  { path: '/projects', label: 'organization.sidebar.projects', icon: Briefcase },
  { path: '/volunteers', label: 'organization.sidebar.volunteers', icon: UsersRound },
  { path: '/finance', label: 'organization.sidebar.finance', icon: DollarSign },
  { path: '/documents', label: 'organization.sidebar.documents', icon: FolderOpen },
  { path: '/tasks', label: 'common.tasks', icon: CheckSquare },
  { path: '/communication', label: 'organization.sidebar.communication', icon: MessageSquare },
  { path: '/events', label: 'organization.sidebar.events', icon: Calendar },
  { path: '/inventory', label: 'organization.sidebar.inventory', icon: Package },
  { path: '/settings', label: 'organization.sidebar.settings', icon: Settings },
];

export const getMenuItems = (category: 'church' | 'school' | 'organization'): MenuItem[] => {
  switch (category) {
    case 'school':
      return schoolMenu;
    case 'church':
      return churchMenu;
    case 'organization':
      return organizationMenu;
    default:
      return [];
  }
};
