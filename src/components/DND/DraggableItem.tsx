import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import cn from 'classnames';

interface Props {
  id: number;
  item: string; // ContactsType
  data: { address: string; children: React.ReactNode };
}
export const DraggableItem: React.FC<Props> = ({ id, item, data }) => {
  return (
    <Draggable draggableId={item} index={id}>
      {(provided, snapshot) => (
        <div
          className={cn('draggable', { 'is-active': snapshot.isDragging })}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {data?.children}
        </div>
      )}
    </Draggable>
  );
};