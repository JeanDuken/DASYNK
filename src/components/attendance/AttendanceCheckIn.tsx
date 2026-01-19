import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMembers, Member } from '@/hooks/useMembers';
import { useBulkCreateAttendance, useAttendance, AttendanceInsert } from '@/hooks/useAttendance';
import { Search, CheckCircle, XCircle, Clock, MinusCircle, Save, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AttendanceCheckInProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  category: 'school' | 'church' | 'organization';
  eventType?: string;
  className?: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface MemberAttendance {
  memberId: string;
  status: AttendanceStatus;
  checkInTime: string;
  note: string;
}

const AttendanceCheckIn = ({
  open,
  onOpenChange,
  organizationId,
  category,
  eventType = 'regular',
  className,
}: AttendanceCheckInProps) => {
  const { t } = useTranslation();
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentTime = format(new Date(), 'HH:mm');
  
  const { data: members = [], isLoading: membersLoading } = useMembers(organizationId);
  const { data: existingAttendance = [] } = useAttendance(organizationId, today);
  const bulkCreate = useBulkCreateAttendance();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(className || 'all');
  const [attendanceMap, setAttendanceMap] = useState<Map<string, MemberAttendance>>(new Map());
  
  // Get unique grade levels/classes for filtering
  const classes = Array.from(new Set(members.map(m => m.grade_level).filter(Boolean)));
  
  // Filter members by search and class
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || member.grade_level === selectedClass;
    return matchesSearch && matchesClass;
  });
  
  // Initialize attendance map with existing records or defaults
  useEffect(() => {
    const newMap = new Map<string, MemberAttendance>();
    
    members.forEach(member => {
      const existing = existingAttendance.find(a => a.member_id === member.id);
      if (existing) {
        newMap.set(member.id, {
          memberId: member.id,
          status: existing.status,
          checkInTime: existing.check_in_time || currentTime,
          note: existing.note || '',
        });
      } else {
        newMap.set(member.id, {
          memberId: member.id,
          status: 'present',
          checkInTime: currentTime,
          note: '',
        });
      }
    });
    
    setAttendanceMap(newMap);
  }, [members, existingAttendance, currentTime]);
  
  const updateMemberAttendance = (memberId: string, field: keyof MemberAttendance, value: string) => {
    setAttendanceMap(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(memberId);
      if (current) {
        newMap.set(memberId, { ...current, [field]: value });
      }
      return newMap;
    });
  };
  
  const setStatusForAll = (status: AttendanceStatus) => {
    setAttendanceMap(prev => {
      const newMap = new Map(prev);
      filteredMembers.forEach(member => {
        const current = newMap.get(member.id);
        if (current) {
          newMap.set(member.id, { ...current, status });
        }
      });
      return newMap;
    });
  };
  
  const handleSave = async () => {
    const records: AttendanceInsert[] = [];
    
    attendanceMap.forEach((attendance, memberId) => {
      // Only create new records (not already in existing attendance)
      const alreadyExists = existingAttendance.some(a => a.member_id === memberId);
      if (!alreadyExists) {
        records.push({
          organization_id: organizationId,
          member_id: memberId,
          attendance_date: today,
          check_in_time: attendance.checkInTime,
          status: attendance.status,
          event_type: eventType,
          class_name: members.find(m => m.id === memberId)?.grade_level || null,
          note: attendance.note || null,
        });
      }
    });
    
    if (records.length > 0) {
      await bulkCreate.mutateAsync(records);
    }
    
    onOpenChange(false);
  };
  
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'excused': return <MinusCircle className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'late': return 'En retard';
      case 'excused': return 'Excusé';
    }
  };
  
  // Stats for current selection
  const stats = {
    present: Array.from(attendanceMap.values()).filter(a => a.status === 'present').length,
    absent: Array.from(attendanceMap.values()).filter(a => a.status === 'absent').length,
    late: Array.from(attendanceMap.values()).filter(a => a.status === 'late').length,
    excused: Array.from(attendanceMap.values()).filter(a => a.status === 'excused').length,
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Faire l'Appel - {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </DialogTitle>
          <DialogDescription>
            Enregistrez la présence des {category === 'school' ? 'élèves' : 'membres'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {category === 'school' && classes.length > 0 && (
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls!}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setStatusForAll('present')}>
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              Tous présents
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStatusForAll('absent')}>
              <XCircle className="h-4 w-4 mr-1 text-red-600" />
              Tous absents
            </Button>
            <div className="ml-auto flex gap-2 text-sm">
              <Badge variant="outline" className="bg-green-50">P: {stats.present}</Badge>
              <Badge variant="outline" className="bg-red-50">A: {stats.absent}</Badge>
              <Badge variant="outline" className="bg-yellow-50">R: {stats.late}</Badge>
              <Badge variant="outline" className="bg-blue-50">E: {stats.excused}</Badge>
            </div>
          </div>
          
          {/* Members list */}
          <ScrollArea className="h-[400px] border rounded-lg">
            {membersLoading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">Chargement...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">Aucun membre trouvé</span>
              </div>
            ) : (
              <div className="divide-y">
                {filteredMembers.map(member => {
                  const attendance = attendanceMap.get(member.id);
                  const alreadyRecorded = existingAttendance.some(a => a.member_id === member.id);
                  
                  return (
                    <div 
                      key={member.id} 
                      className={`flex items-center gap-4 p-3 ${alreadyRecorded ? 'bg-muted/50' : ''}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photo_url || undefined} />
                        <AvatarFallback>
                          {member.first_name[0]}{member.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.first_name} {member.last_name}
                        </p>
                        {category === 'school' && member.grade_level && (
                          <p className="text-sm text-muted-foreground">{member.grade_level}</p>
                        )}
                        {alreadyRecorded && (
                          <Badge variant="secondary" className="text-xs mt-1">Déjà enregistré</Badge>
                        )}
                      </div>
                      
                      {/* Status buttons */}
                      <div className="flex gap-1">
                        {(['present', 'late', 'excused', 'absent'] as AttendanceStatus[]).map(status => (
                          <Button
                            key={status}
                            variant={attendance?.status === status ? 'default' : 'ghost'}
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              attendance?.status === status 
                                ? status === 'present' ? 'bg-green-600 hover:bg-green-700' :
                                  status === 'absent' ? 'bg-red-600 hover:bg-red-700' :
                                  status === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                  'bg-blue-600 hover:bg-blue-700'
                                : ''
                            }`}
                            onClick={() => updateMemberAttendance(member.id, 'status', status)}
                            disabled={alreadyRecorded}
                            title={getStatusLabel(status)}
                          >
                            {getStatusIcon(status)}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Time input for late arrivals */}
                      {attendance?.status === 'late' && (
                        <Input
                          type="time"
                          value={attendance.checkInTime}
                          onChange={(e) => updateMemberAttendance(member.id, 'checkInTime', e.target.value)}
                          className="w-24"
                          disabled={alreadyRecorded}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={bulkCreate.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {bulkCreate.isPending ? 'Enregistrement...' : 'Enregistrer l\'appel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceCheckIn;
