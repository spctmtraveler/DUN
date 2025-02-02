import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';

const TaskSection = ({ section, tasks, onToggleCompletion, onDeleteTask, onSelectTask, selectedTaskId }) => {
  const { setNodeRef } = useDroppable({
    id: `section-${section}`,
  });

  const sortableTaskIds = tasks.map(task => task.id.toString());

  return (
    <SortableContext 
      id={section} 
      items={sortableTaskIds}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} className="section-content">
        {tasks.map((task) => (
          <SortableTask
            key={task.id}
            id={task.id.toString()}
            {...task}
            onToggleCompletion={onToggleCompletion}
            onDeleteTask={onDeleteTask}
            onSelectTask={onSelectTask}
            selected={selectedTaskId === task.id}
          />
        ))}
      </div>
    </SortableContext>
  );
};

export default React.memo(TaskSection);