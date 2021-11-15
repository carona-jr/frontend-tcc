import { Droppable } from 'react-beautiful-dnd'
import ClauseCard from './card'
import { Box } from '@chakra-ui/react'

export default function ClauseColumn({ column, cards, handleEdit, handleDelete }) {
    return (
        <Box>
            {/* <Box>{column.title}</Box> */}
            <Droppable droppableId={column.id}>
                {provided => (
                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                        {cards.map((card, index) => (
                            <ClauseCard key={card._id} card={card} index={index} handleEdit={handleEdit} handleDelete={handleDelete} />
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </Box>
    )
}