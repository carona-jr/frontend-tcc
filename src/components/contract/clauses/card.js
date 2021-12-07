import { useRef } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import styled from 'styled-components'
import { FaPen, FaTrash } from 'react-icons/fa'
import { GrDrag } from 'react-icons/gr'
import ReactHtmlParses from 'react-html-parser'

const Container = styled.div`
    border-radius: 2px;
    padding: 4px 0;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.6s padding;
    &:hover {
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 8px 16px;
        padding-left: 4px;
        cursor: pointer;
    }
    &:hover svg, &:hover div:last-child { 
        display: flex !important;
    }
    &:hover div:last-child {
        opacity: 1;
    }
`

const Icons = styled.div`
    transition: 0.3s opacity;
    cursor: pointer;
    align-items: center;
    display: flex;
    opacity: 0;
`

const Text = styled.div`
    cursor: pointer;
    align-items: center;
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
                    <Text>
                        <GrDrag style={{ marginRight: '6px', display: "none" }} />
                        <div ref={cardRef}>{ReactHtmlParses(card.content)}</div>
                    </Text>
                    <Icons>
                        <FaPen style={{ marginRight: '12px' }} onClick={() => handleEdit(card._id, cardRef.current.children)} />
                        <FaTrash onClick={() => handleDelete(card._id)} />
                    </Icons>
                </Container>
            )}
        </Draggable>
    )
}