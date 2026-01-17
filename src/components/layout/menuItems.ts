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
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

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

const churchMenu: MenuItem[] = [
  { path: '', label: 'church.sidebar.dashboard', icon: LayoutDashboard },
  { path: '/members', label: 'church.sidebar.members', icon: Users },
  { path: '/groups', label: 'church.sidebar.groups', icon: UsersRound },
  { path: '/services', label: 'church.sidebar.services', icon: Church },
  { path: '/media', label: 'church.sidebar.media', icon: Video },
  { path: '/finance', label: 'church.sidebar.finance', icon: DollarSign },
  { path: '/discipleship', label: 'church.sidebar.discipleship', icon: BookOpen },
  { path: '/visitors', label: 'church.sidebar.visitors', icon: UserPlus },
  { path: '/tasks', label: 'common.tasks', icon: CheckSquare },
  { path: '/events', label: 'church.sidebar.events', icon: Calendar },
  { path: '/communication', label: 'church.sidebar.communication', icon: MessageSquare },
  { path: '/settings', label: 'church.sidebar.settings', icon: Settings },
];

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
