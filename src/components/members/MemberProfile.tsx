import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  ArrowLeft,
  Edit,
  Camera,
  FileText,
  Upload,
  Trash2,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  IdCard,
} from 'lucide-react';
import { Member } from '@/hooks/useMembers';
import { useMemberDocuments, useUploadDocument, useDeleteDocument, useUploadPhoto } from '@/hooks/useMemberDocuments';
import { useQueryClient } from '@tanstack/react-query';

interface MemberProfileProps {
  member: Member;
  category: 'school' | 'church' | 'organization';
  onBack: () => void;
  onEdit: () => void;
}

const documentTypes = [
  { value: 'birth_certificate', label: 'Acte de naissance' },
  { value: 'vaccination_card', label: 'Carte de vaccination' },
  { value: 'id_card', label: "Carte d'identité" },
  { value: 'transcript', label: 'Relevé de notes' },
  { value: 'diploma', label: 'Diplôme' },
  { value: 'photo', label: 'Photo' },
  { value: 'other', label: 'Autre' },
];

const MemberProfile = ({ member, category, onBack, onEdit }: MemberProfileProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('other');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; fileUrl: string } | null>(null);

  const { data: documents = [], isLoading: documentsLoading } = useMemberDocuments(member.id);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const uploadPhoto = useUploadPhoto();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadDocument.mutateAsync({
      file,
      memberId: member.id,
      organizationId: member.organization_id,
      documentType: selectedDocType,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadPhoto.mutateAsync({
      file,
      memberId: member.id,
      organizationId: member.organization_id,
    });

    queryClient.invalidateQueries({ queryKey: ['members', member.organization_id] });

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    await deleteDocument.mutateAsync({
      id: documentToDelete.id,
      memberId: member.id,
      fileUrl: documentToDelete.fileUrl,
    });

    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'outline',
    };
    const labels: Record<string, string> = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu',
      pending: 'En attente',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" />
          Modifier
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={member.photo_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {member.first_name[0]}
                    {member.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <h2 className="mt-4 text-xl font-bold">
                {member.first_name} {member.last_name}
              </h2>
              <div className="mt-2">{getStatusBadge(member.status)}</div>
              {member.badge_number && (
                <Badge variant="secondary" className="mt-2 gap-1">
                  <IdCard className="w-3 h-3" />
                  {member.badge_number}
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {member.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
              )}
              {(member.address || member.city) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {member.address}
                    {member.address && member.city && ', '}
                    {member.city}
                  </span>
                </div>
              )}
              {member.date_of_birth && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(member.date_of_birth)}</span>
                </div>
              )}
              {member.gender && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>
                    {member.gender === 'male' ? 'Masculin' : member.gender === 'female' ? 'Féminin' : 'Autre'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details & Documents */}
        <Card className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <CardHeader>
              <TabsList>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="details" className="mt-0 space-y-6">
                {category === 'school' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Informations scolaires</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Matricule:</span>
                        <p className="font-medium">{member.student_id || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Classe:</span>
                        <p className="font-medium">{member.grade_level || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date d'inscription:</span>
                        <p className="font-medium">{formatDate(member.enrollment_date)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Graduation prévue:</span>
                        <p className="font-medium">{formatDate(member.graduation_date)}</p>
                      </div>
                    </div>

                    <h3 className="font-semibold pt-4">Parent / Tuteur</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>
                        <p className="font-medium">{member.parent_name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone:</span>
                        <p className="font-medium">{member.parent_phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{member.parent_email || '-'}</p>
                      </div>
                    </div>

                    <h3 className="font-semibold pt-4">Contact d'urgence</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>
                        <p className="font-medium">{member.emergency_contact || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone:</span>
                        <p className="font-medium">{member.emergency_phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {category === 'church' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Informations église</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Membre depuis:</span>
                        <p className="font-medium">{formatDate(member.member_since)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rôle:</span>
                        <p className="font-medium">{member.member_role || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date de baptême:</span>
                        <p className="font-medium">{formatDate(member.baptism_date)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date de conversion:</span>
                        <p className="font-medium">{formatDate(member.conversion_date)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date de mariage:</span>
                        <p className="font-medium">{formatDate(member.marriage_date)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Présentation au temple:</span>
                        <p className="font-medium">{formatDate(member.presentation_date)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Personne de référence:</span>
                        <p className="font-medium">{member.reference_person || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Personne responsable:</span>
                        <p className="font-medium">{member.responsible_person || '-'}</p>
                      </div>
                    </div>

                    {member.groups && member.groups.length > 0 && (
                      <>
                        <h3 className="font-semibold pt-4">Groupes d'affectation</h3>
                        <div className="flex flex-wrap gap-2">
                          {member.groups.map((group) => (
                            <Badge key={group} variant="outline">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {category === 'organization' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Informations d'adhésion</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type d'adhésion:</span>
                        <p className="font-medium">{member.membership_type || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fréquence de cotisation:</span>
                        <p className="font-medium">
                          {member.contribution_frequency === 'weekly'
                            ? 'Hebdomadaire'
                            : member.contribution_frequency === 'monthly'
                            ? 'Mensuelle'
                            : member.contribution_frequency === 'yearly'
                            ? 'Annuelle'
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Montant de cotisation:</span>
                        <p className="font-medium">
                          {member.contribution_amount
                            ? `${member.contribution_amount.toFixed(2)}`
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dernière cotisation:</span>
                        <p className="font-medium">{formatDate(member.last_contribution_date)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Début d'adhésion:</span>
                        <p className="font-medium">{formatDate(member.membership_start)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fin d'adhésion:</span>
                        <p className="font-medium">{formatDate(member.membership_end)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {member.notes && (
                  <div className="pt-4">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{member.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-0 space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadDocument.isPending}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadDocument.isPending ? 'Téléchargement...' : 'Télécharger'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {documentsLoading ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun document</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.document_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {documentTypes.find((t) => t.value === doc.document_type)?.label ||
                                doc.document_type}
                              {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDocumentToDelete({ id: doc.id, fileUrl: doc.file_url });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
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

export default MemberProfile;
