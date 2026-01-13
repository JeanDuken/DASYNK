import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Plus, Building2, Church, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import type { Tables } from '@/integrations/supabase/types';

type Organization = Tables<'organizations'>;

const getOrgIcon = (type: Organization['type']) => {
  switch (type) {
    case 'church':
      return Church;
    case 'school':
      return GraduationCap;
    default:
      return Building2;
  }
};

const getOrgColor = (type: Organization['type']) => {
  switch (type) {
    case 'church':
      return 'bg-church text-white';
    case 'school':
      return 'bg-school text-white';
    default:
      return 'bg-organization text-white';
  }
};

interface OrganizationSwitcherProps {
  collapsed?: boolean;
}

export const OrganizationSwitcher = ({ collapsed = false }: OrganizationSwitcherProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganizationContext();
  const [open, setOpen] = useState(false);

  const handleSelect = (org: Organization) => {
    setCurrentOrganization(org);
    setOpen(false);
    navigate(`/dashboard/${org.type}`);
  };

  const handleCreateNew = () => {
    setOpen(false);
    navigate('/select-category?new=true');
  };

  if (!currentOrganization) return null;

  const Icon = getOrgIcon(currentOrganization.type);
  const colorClass = getOrgColor(currentOrganization.type);

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 p-0"
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClass)}>
              <Icon className="h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start" side="right">
          <Command>
            <CommandInput placeholder={t('organizations.search')} />
            <CommandList>
              <CommandEmpty>{t('organizations.noResults')}</CommandEmpty>
              <CommandGroup heading={t('organizations.title')}>
                {organizations.map((org) => {
                  const OrgIcon = getOrgIcon(org.type);
                  const orgColor = getOrgColor(org.type);
                  return (
                    <CommandItem
                      key={org.id}
                      onSelect={() => handleSelect(org)}
                      className="cursor-pointer"
                    >
                      <div className={cn('w-6 h-6 rounded flex items-center justify-center mr-2', orgColor)}>
                        <OrgIcon className="h-3 w-3" />
                      </div>
                      <span className="flex-1 truncate">{org.name}</span>
                      {currentOrganization.id === org.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={handleCreateNew} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('organizations.createNew')}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2 px-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium truncate">{currentOrganization.name}</p>
              <p className="text-xs text-muted-foreground">
                {t(`categorySelection.${currentOrganization.type}.title`)}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={t('organizations.search')} />
          <CommandList>
            <CommandEmpty>{t('organizations.noResults')}</CommandEmpty>
            <CommandGroup heading={t('organizations.title')}>
              {organizations.map((org) => {
                const OrgIcon = getOrgIcon(org.type);
                const orgColor = getOrgColor(org.type);
                return (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleSelect(org)}
                    className="cursor-pointer"
                  >
                    <div className={cn('w-6 h-6 rounded flex items-center justify-center mr-2', orgColor)}>
                      <OrgIcon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`categorySelection.${org.type}.title`)}
                      </p>
                    </div>
                    {currentOrganization.id === org.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateNew} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                {t('organizations.createNew')}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
