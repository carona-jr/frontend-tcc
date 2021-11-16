import { useRef } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import styled from 'styled-components'
import { FaPen, FaTrash } from 'react-icons/fa'
import ReactHtmlParses from 'react-html-parser'

const Container = styled.div`
    border: 1px solid lightgrey;
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const Icons = styled.div`
    cursor: pointer;
    display: flex;
`

export default function ClauseCard({ card, index, handleEdit, handleDelete }) {
    const cardRef = useRef()

    return (
        <Draggable draggableId={card._id} index={index}>
            {provided => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                >
                    <div ref={cardRef}>{ReactHtmlParses(card.content)}</div>
                    <Icons>
                        <FaPen style={{ marginRight: '12px' }} onClick={() => handleEdit(card._id, cardRef.current.children)} />
                        <FaTrash onClick={() => handleDelete(card._id)} />
                    </Icons>
                </Container>
            )}
        </Draggable>
    )
}