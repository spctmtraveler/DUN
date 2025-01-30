import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Only enable drag and drop for the Triage section
  const shouldEnableDragAndDrop = id === 'Triage';

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(tasks, oldIndex, newIndex);
        onReorderTasks(id, newOrder);
      }
    }
  };

  const renderTasks = () => {
    if (shouldEnableDragAndDrop) {
      return (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
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
    <div 
      className="task-section"
      data-section-id={id}
    >
      <div 
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} 
          size={16} 
        />
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