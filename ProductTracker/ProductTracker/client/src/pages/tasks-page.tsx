import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const { t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <SidebarLayout>
      {showAddForm ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("newTask")}</h1>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              {t("cancel")}
            </Button>
          </div>
          <TaskForm onComplete={() => setShowAddForm(false)} />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t("tasks")}</h1>
              <p className="text-muted-foreground mt-1">
                Manage your team tasks and track progress
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("newTask")}
            </Button>
          </div>
          <TaskList />
        </>
      )}
    </SidebarLayout>
  );
}
