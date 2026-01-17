import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getMenuItems, type MenuItem, type SubMenuItem } from './menuItems';

interface SidebarProps {
  category: 'church' | 'school' | 'organization';
  isOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ category, isOpen, mobileOpen, onMobileClose }: SidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const menuItems = getMenuItems(category);
  
  // État pour les sous-menus ouverts
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  const categoryColors = {
    church: 'from-church to-church/90',
    school: 'from-school to-school/90',
    organization: 'from-organization to-organization/90',
  };

  const categoryLabels = {
    church: t('categorySelection.church.title'),
    school: t('categorySelection.school.title'),
    organization: t('categorySelection.organization.title'),
  };

  // Toggle sous-menu
  const toggleSubMenu = (path: string) => {
    setOpenSubMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    );
  };

  // Vérifier si un chemin est actif
  const isPathActive = (path: string, basePath: string) => {
    const fullPath = `${basePath}${path}`;
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + '/');
  };

  // Vérifier si un sous-menu contient un élément actif
  const hasActiveChild = (children: SubMenuItem[], basePath: string) => {
    return children.some(child => isPathActive(child.path, basePath));
  };

  // Rendu d'un item simple (sans enfants)
  const renderSimpleMenuItem = (item: MenuItem, basePath: string) => {
    const fullPath = `${basePath}${item.path}`;
    const isActive = location.pathname === fullPath || 
      (item.path === '' && location.pathname === basePath);
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path || 'dashboard'}
        to={fullPath}
        onClick={onMobileClose}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', !isOpen && 'mx-auto')} />
        {isOpen && (
          <span className="text-sm font-medium truncate">{t(item.label)}</span>
        )}
      </NavLink>
    );
  };

  // Rendu d'un item avec sous-menu
  const renderCollapsibleMenuItem = (item: MenuItem, basePath: string) => {
    const Icon = item.icon;
    const isSubMenuOpen = openSubMenus.includes(item.path) || hasActiveChild(item.children!, basePath);

    if (!isOpen) {
      // Mode collapsed - afficher juste l'icône principale
      const firstChild = item.children![0];
      const fullPath = `${basePath}${firstChild.path}`;
      return (
        <NavLink
          key={item.path}
          to={fullPath}
          onClick={onMobileClose}
          className={cn(
            'flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200',
            hasActiveChild(item.children!, basePath)
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Icon className="h-5 w-5" />
        </NavLink>
      );
    }

    return (
      <Collapsible
        key={item.path}
        open={isSubMenuOpen}
        onOpenChange={() => toggleSubMenu(item.path)}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200',
              hasActiveChild(item.children!, basePath)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium truncate flex-1 text-left">{t(item.label)}</span>
            {isSubMenuOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1">
          {item.children!.map((child) => {
            const fullPath = `${basePath}${child.path}`;
            const isActive = location.pathname === fullPath;
            const ChildIcon = child.icon;

            return (
              <NavLink
                key={child.path}
                to={fullPath}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <ChildIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(child.label)}</span>
              </NavLink>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Rendu d'un item de menu
  const renderMenuItem = (item: MenuItem, basePath: string) => {
    if (item.children && item.children.length > 0) {
      return renderCollapsibleMenuItem(item, basePath);
    }
    return renderSimpleMenuItem(item, basePath);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 hidden lg:block',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b">
          <div className={cn(
            'flex items-center gap-3',
            !isOpen && 'justify-center w-full'
          )}>
            <div className={cn(
              'w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shrink-0',
              categoryColors[category]
            )}>
              <span className="text-white font-bold text-lg">D</span>
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-lg">DASYNK</h1>
                <p className="text-xs text-muted-foreground">{categoryLabels[category]}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)] py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => renderMenuItem(item, `/dashboard/${category}`))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 border-r bg-card transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center',
              categoryColors[category]
            )}>
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">DASYNK</h1>
              <p className="text-xs text-muted-foreground">{categoryLabels[category]}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)] py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => renderMenuItem(item, `/dashboard/${category}`))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
};
