import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MembersList from '@/components/members/MembersList';
import MemberForm from '@/components/members/MemberForm';
import MemberProfile from '@/components/members/MemberProfile';
import { useMembers, useCreateMember, useUpdateMember, Member, MemberInsert } from '@/hooks/useMembers';
import { useOrganization } from '@/hooks/useOrganization';

interface MembersPageProps {
  category: 'school' | 'church' | 'organization';
}

type ViewMode = 'list' | 'profile' | 'add' | 'edit';

const MembersPage = ({ category }: MembersPageProps) => {
  const { t } = useTranslation();
  const { organization, loading: orgLoading } = useOrganization();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: members = [], isLoading } = useMembers(organization?.id);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setViewMode('profile');
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<MemberInsert>) => {
    if (!organization) return;

    if (selectedMember) {
      await updateMember.mutateAsync({ id: selectedMember.id, ...data });
    } else {
      await createMember.mutateAsync({
        ...data,
        organization_id: organization.id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        status: data.status || 'active',
      } as MemberInsert);
    }

    setIsDialogOpen(false);
    setSelectedMember(null);
    if (viewMode === 'profile') {
      // Refresh the view with updated data
      const updatedMember = members.find(m => m.id === selectedMember?.id);
      if (updatedMember) {
        setSelectedMember({ ...updatedMember, ...data } as Member);
      }
    }
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedMember(null);
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Aucune organisation trouvée</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      {viewMode === 'list' && (
        <MembersList
          members={members}
          isLoading={isLoading}
          organizationId={organization.id}
          category={category}
          onAddMember={handleAddMember}
          onViewMember={handleViewMember}
          onEditMember={handleEditMember}
        />
      )}

      {viewMode === 'profile' && selectedMember && (
        <MemberProfile
          member={selectedMember}
          category={category}
          onBack={handleBack}
          onEdit={() => handleEditMember(selectedMember)}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMember
                ? `Modifier ${selectedMember.first_name} ${selectedMember.last_name}`
                : category === 'school'
                ? 'Ajouter un élève'
                : 'Ajouter un membre'}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            category={category}
            member={selectedMember}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={createMember.isPending || updateMember.isPending}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MembersPage;
