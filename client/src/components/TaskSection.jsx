import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';
import Task from './Task';

const TaskSection = ({ 
  id, 
  title, 
  tasks = [], 
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId,
  onReorderTasks
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  console.log(`[TaskSection ${id}] Rendering with ${tasks.length} tasks`);
  tasks.forEach(task => {
    console.log(`[TaskSection ${id}] Task ${task.id}: order=${task.order}`);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Reduce activation constraints to make dragging easier
      activationConstraint: {
        distance: 1, // Reduce required movement distance
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const shouldEnableDragAndDrop = id === 'Triage';

  const handleDragStart = (event) => {
    const { active } = event;
    console.log(`[DragStart] Task ${active.id} drag started`);
  };

  const handleDragMove = (event) => {
    const { active, over } = event;
    console.log(`[DragMove] Task ${active.id} over ${over?.id || 'nothing'}`);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log(`[DragEnd] Task ${active.id} dropped over ${over?.id || 'nothing'}`);

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);

      console.log(`[DragEnd] Moving task from index ${oldIndex} to ${newIndex}`);
      console.log(`[DragEnd] Current task orders:`, tasks.map(t => ({ id: t.id, order: t.order })));

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        console.log(`[DragEnd] New task orders:`, newTasks.map(t => ({ id: t.id, order: t.order })));
        onReorderTasks(id, newTasks);
      } else {
        console.warn(`[DragEnd] Invalid indices - oldIndex: ${oldIndex}, newIndex: ${newIndex}`);
      }
    } else {
      console.log(`[DragEnd] No movement needed - same position`);
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4"
        }
      }
    })
  };

  const renderTasks = () => {
    if (shouldEnableDragAndDrop) {
      console.log(`[TaskSection ${id}] Rendering with DnD enabled`);
      return (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                {...task}
                onToggleCompletion={onToggleCompletion}
                onDeleteTask={onDeleteTask}
                onSelectTask={onSelectTask}
                selected={task.id === selectedTaskId}
              />
            ))}
          </SortableContext>
        </DndContext>
      );
    }

    return tasks.map((task) => (
      <Task
        key={task.id}
        {...task}
        onToggleCompletion={onToggleCompletion}
        onDeleteTask={onDeleteTask}
        onSelectTask={onSelectTask}
        selected={task.id === selectedTaskId}
      />
    ));
  };

  return (
    <div className="task-section" data-section-id={id}>
      <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <ChevronRight className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} size={16} />
        <span>{title}</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {renderTasks()}
        </div>
      )}
    </div>
  );
};

export default TaskSection;