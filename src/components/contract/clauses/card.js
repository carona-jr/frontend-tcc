import { Draggable } from 'react-beautiful-dnd'
import styled from 'styled-components'
import { FaPen, FaTrash } from 'react-icons/fa'

const Container = styled.div`
    border: 1px solid lightgrey;
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const Text = styled.div`
`

const Icons = styled.div`
    cursor: pointer;
    display: flex;
`

export default function ClauseCard({ card, index, handleEdit, handleDelete }) {
    return (
        <Draggable draggableId={card._id} index={index}>
            {provided => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                >
                    <Text>
                        {card.content}
                    </Text>
                    <Icons>
                        <FaPen style={{ marginRight: '12px' }} onClick={() => handleEdit(card._id)} />
                        <FaTrash onClick={() => handleDelete(card._id)} />
                    </Icons>
                </Container>
            )}
        </Draggable>
    )
}