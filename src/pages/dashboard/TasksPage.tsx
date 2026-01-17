import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee: string;
  createdAt: string;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Préparer le rapport mensuel",
    description: "Compiler les données financières et créer le rapport",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-01-20",
    assignee: "Jean Dupont",
    createdAt: "2024-01-10"
  },
  {
    id: "2",
    title: "Réunion d'équipe hebdomadaire",
    description: "Organiser la réunion de planification",
    status: "todo",
    priority: "medium",
    dueDate: "2024-01-22",
    assignee: "Marie Martin",
    createdAt: "2024-01-12"
  },
  {
    id: "3",
    title: "Mettre à jour la base de données",
    description: "Synchroniser les informations des membres",
    status: "done",
    priority: "low",
    dueDate: "2024-01-15",
    assignee: "Pierre Bernard",
    createdAt: "2024-01-08"
  },
  {
    id: "4",
    title: "Organiser l'événement annuel",
    description: "Planifier et coordonner l'événement principal de l'année",
    status: "todo",
    priority: "high",
    dueDate: "2024-02-15",
    assignee: "Sophie Dubois",
    createdAt: "2024-01-05"
  }
];

const statusConfig = {
  todo: { label: "À faire", icon: Circle, color: "bg-muted text-muted-foreground" },
  in_progress: { label: "En cours", icon: Clock, color: "bg-primary/10 text-primary" },
  done: { label: "Terminé", icon: CheckCircle2, color: "bg-green-100 text-green-700" }
};

const priorityConfig = {
  low: { label: "Basse", color: "bg-green-100 text-green-700" },
  medium: { label: "Moyenne", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "Haute", color: "bg-red-100 text-red-700" }
};

export default function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
    assignee: ""
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Group tasks by status
  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress");
  const doneTasks = filteredTasks.filter(t => t.status === "done");

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length
  };

  const handleCreateTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: "todo",
      createdAt: new Date().toISOString().split("T")[0]
    };
    
    setTasks([task, ...tasks]);
    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });
    setIsDialogOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status].icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <button 
              onClick={() => handleStatusChange(task.id, task.status === "done" ? "todo" : "done")}
              className="mt-0.5"
            >
              <StatusIcon className={`h-5 w-5 ${task.status === "done" ? "text-green-500" : "text-muted-foreground"}`} />
            </button>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="secondary" className={priorityConfig[task.priority].color}>
                  {priorityConfig[task.priority].label}
                </Badge>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                  </div>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "todo")}>
                <Circle className="h-4 w-4 mr-2" />
                À faire
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>
                <Clock className="h-4 w-4 mr-2" />
                En cours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(task.id, "done")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Terminé
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTask(task.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Tâches</h1>
          <p className="text-muted-foreground mt-1">Gérez et suivez vos tâches</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une tâche</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Titre de la tâche"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description de la tâche"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Date limite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="assignee">Assigné à</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  placeholder="Nom de la personne"
                />
              </div>
              <Button onClick={handleCreateTask} className="w-full">
                Créer la tâche
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">À faire</p>
                <p className="text-2xl font-bold">{stats.todo}</p>
              </div>
              <Circle className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold">{stats.done}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une tâche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="todo">À faire</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="done">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* To Do */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Circle className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">À faire</h3>
            <Badge variant="secondary">{todoTasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune tâche à faire
              </p>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">En cours</h3>
            <Badge variant="secondary">{inProgressTasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune tâche en cours
              </p>
            )}
          </div>
        </div>

        {/* Done */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Terminé</h3>
            <Badge variant="secondary">{doneTasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {doneTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune tâche terminée
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
