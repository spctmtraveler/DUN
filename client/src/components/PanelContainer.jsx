import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import Panel from './Panel';
import config from '../config.json';

const PanelContainer = ({ 
  visiblePanels, 
  tasks, 
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId,
  onReorderTasks
}) => {
  const visiblePanelCount = Object.values(visiblePanels).filter(Boolean).length;
  const panelWidth = visiblePanelCount > 0 ? `${100 / visiblePanelCount}%` : '0';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: ({context}) => {
        return {
          x: context.active.rect.current.offsetLeft,
          y: context.active.rect.current.offsetTop,
        }
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = parseInt(active.id);
    const overId = parseInt(over.id);

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask || !overTask) return;

    // Get the target section's tasks
    const targetSectionTasks = tasks
      .filter(task => task.section === overTask.section)
      .sort((a, b) => a.order - b.order);

    // Find the position where we want to insert the task
    const newIndex = targetSectionTasks.findIndex(t => t.id === overId);

    // Create a new array with the task in the new position
    const reorderedTasks = [...targetSectionTasks];

    // If we're moving to a new section, insert the task
    // If we're in the same section, just reorder
    if (activeTask.section !== overTask.section) {
      reorderedTasks.splice(newIndex, 0, { ...activeTask, section: overTask.section });
    } else {
      const oldIndex = reorderedTasks.findIndex(t => t.id === activeId);
      reorderedTasks.splice(oldIndex, 1);
      reorderedTasks.splice(newIndex, 0, activeTask);
    }

    onReorderTasks(overTask.section, reorderedTasks);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="panel-container">
        {config.panels.map((panel) => (
          <Panel
            key={panel.id}
            id={panel.id}
            title={panel.title}
            icon={panel.icon}
            isVisible={visiblePanels[panel.id]}
            width={panelWidth}
            tasks={tasks}
            onToggleCompletion={onToggleCompletion}
            onDeleteTask={onDeleteTask}
            onSelectTask={onSelectTask}
            selectedTaskId={selectedTaskId}
            onReorderTasks={onReorderTasks}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default PanelContainer;