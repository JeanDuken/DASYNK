import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Member, useDeleteMember } from '@/hooks/useMembers';

interface MembersListProps {
  members: Member[];
  isLoading: boolean;
  organizationId: string;
  category: 'school' | 'church' | 'organization';
  onAddMember: () => void;
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
}

const MembersList = ({
  members,
  isLoading,
  organizationId,
  category,
  onAddMember,
  onViewMember,
  onEditMember,
}: MembersListProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const deleteMember = useDeleteMember();

  const filteredMembers = members.filter(
    (member) =>
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      await deleteMember.mutateAsync({
        id: memberToDelete.id,
        organizationId,
      });
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const getMemberLabel = () => {
    switch (category) {
      case 'school':
        return 'Élèves';
      case 'church':
        return 'Membres';
      case 'organization':
        return 'Membres';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{getMemberLabel()}</h1>
          <p className="text-muted-foreground">
            {filteredMembers.length} {getMemberLabel().toLowerCase()}
          </p>
        </div>
        <Button onClick={onAddMember} className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Contact</TableHead>
              {category === 'school' && <TableHead>Classe</TableHead>}
              {category === 'church' && <TableHead>Groupes</TableHead>}
              {category === 'organization' && <TableHead>Type</TableHead>}
              <TableHead>Badge</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucun membre trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={member.photo_url || undefined} />
                      <AvatarFallback>
                        {member.first_name[0]}
                        {member.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {member.email && <div>{member.email}</div>}
                      {member.phone && <div className="text-muted-foreground">{member.phone}</div>}
                    </div>
                  </TableCell>
                  {category === 'school' && (
                    <TableCell>{member.grade_level || '-'}</TableCell>
                  )}
                  {category === 'church' && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.groups?.slice(0, 2).map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                        {(member.groups?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(member.groups?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {category === 'organization' && (
                    <TableCell>{member.membership_type || '-'}</TableCell>
                  )}
                  <TableCell>
                    {member.badge_number ? (
                      <Badge variant="secondary">{member.badge_number}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => onViewMember(member)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditMember(member)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(member)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {memberToDelete?.first_name}{' '}
              {memberToDelete?.last_name}? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembersList;
