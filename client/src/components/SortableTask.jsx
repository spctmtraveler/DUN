import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Task from './Task';

const SortableTask = ({ id, sectionId, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: {
      type: 'TASK',
      taskId: id,
      sectionId
    },
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-task-id={id} data-section-id={sectionId}>
      <Task 
        id={id} 
        {...props}
        {...attributes}
        dragHandleProps={{
          ...listeners,
          'data-no-dnd': 'true'
        }}
      />
    </div>
  );
};

export default React.memo(SortableTask);