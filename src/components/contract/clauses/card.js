import { Draggable } from 'react-beautiful-dnd'
import styled from 'styled-components'

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: white;
`

export default function ClauseCard({ card, index }) {
    return (
        <Draggable draggableId={card._id} index={index}>
            {provided => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                >
                    {card.content}
                </Container>
            )}
        </Draggable>
    )
}