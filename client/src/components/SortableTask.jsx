import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Task from './Task';

const SortableTask = ({ id, ...props }) => {
  console.log(`[SortableTask ${id}] Rendering`);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
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
    <div ref={setNodeRef} style={style}>
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