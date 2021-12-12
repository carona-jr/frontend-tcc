import { Button } from "@chakra-ui/button"
import { Transforms, Element as SlateElement, Editor, Text } from "slate"
import escapeHtml from 'escape-html'
import { useSlate } from "slate-react"
import { jsx } from 'slate-hyperscript'

const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code'
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const styles = {
    blockquote: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '0 3px 3px 0',
        display: 'block',
        padding: '2px',
        paddingLeft: '12px',
        borderLeft: '2px solid rgba(0, 0, 0, 0.6)'
    },
    ul: {
        paddingLeft: '32px'
    },
    ol: {
        paddingLeft: '32px'
    },
    h1: {
        fontSize: '32px',
        fontWeight: '700'
    },
    h2: {
        fontSize: '24px',
        fontWeight: '600'
    }
}

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format)
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes(n.type),
        split: true
    })
    const newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format
    }
    Transforms.setNodes(editor, newProperties)

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}

const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

const isBlockActive = (editor, format) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format
    })

    return !!match
}

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
    switch (element.type) {
        case 'block-quote':
            return <blockquote {...attributes} style={styles.blockquote}>{children}</blockquote>
        case 'bulleted-list':
            return <ul {...attributes} style={styles.ul}>{children}</ul>
        case 'heading-one':
            return <h1 {...attributes} style={styles.h1}>{children}</h1>
        case 'heading-two':
            return <h2 {...attributes} style={styles.h2}>{children}</h2>
        case 'list-item':
            return <li {...attributes}>{children}</li>
        case 'numbered-list':
            return <ol {...attributes} style={styles.ol}>{children}</ol>
        default:
            return <p {...attributes}>{children}</p>
    }
}

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.code) {
        children = <code>{children}</code>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }

    return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            // active={isBlockActive(editor, format)}
            variant="ghost"
            onClick={event => {
                event.preventDefault()
                toggleBlock(editor, format)
            }}
        >
            {icon}
        </Button>
    )
}

const MarkButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            // active={isMarkActive(editor, format)}
            variant="ghost"
            onClick={event => {
                event.preventDefault()
                toggleMark(editor, format)
            }}
        >
            {icon}
        </Button>
    )
}

const serialize = node => {
    if (Text.isText(node)) {
        let string = escapeHtml(node.text)

        if (node.bold) {
            string = `<strong>${string}</strong>`
        }

        if (node.code) {
            string = `<code>${string}</code>`
        }

        if (node.italic) {
            string = `<em>${string}</em>`
        }

        if (node.underline) {
            string = `<u>${string}</u>`
        }

        return string
    }

    const children = node.children.map(n => serialize(n)).join('')
    switch (node.type) {
        case 'block-quote':
            return `<blockquote style='background-color: rgba(0, 0, 0, 0.1); border-radius: 0 3px 3px 0; padding: 2px; paddingLeft: 12px; borderLeft: 2px solid rgba(0, 0, 0, 0.6);'>${children}</blockquote>`
        case 'bulleted-list':
            return `<ul style='padding-left: 32px;'>${children}</ul>`
        case 'heading-one':
            return `<h1 style='font-size: 32px; font-weight: 700;'>${children}</h1>`
        case 'heading-two':
            return `<h2 style='font-size: 24px; font-weight: 600;'>${children}</h2>`
        case 'list-item':
            return `<li>${children}</li>`
        case 'numbered-list':
            return `<ol style='padding-left: 32px;'>${children}</ol>`
        case 'paragraph':
            return `<p>${children}</p>`
        case 'link':
            return `<a href="${escapeHtml(node.url)}">${children}</a>`
        default:
            return children
    }
}

const deserialize = el => {
    if (el.nodeType === 3) {
        return el.textContent
    } else if (el.nodeType !== 1) {
        return null
    }

    let children = Array.from(el.childNodes).map(deserialize)
    if (children.length === 0) {
        children = [{ text: '' }]
    }

    switch (el.nodeName) {
        case 'BODY':
            return jsx('fragment', {}, children)
        case 'BR':
            return '\n'
        case 'BLOCKQUOTE':
            return jsx('element', { type: 'quote' }, children)
        case 'OL':
            return jsx('element', { type: 'numbered-list' }, children)
        case 'UL':
            return jsx('element', { type: 'bulleted-list' }, children)
        case 'LI':
            return jsx('element', { type: 'list-item' }, children)
        case 'H1':
            return jsx('element', { type: 'heading-one' }, children)
        case 'H2':
            return jsx('element', { type: 'heading-two' }, children)
        case 'P':
            return jsx('element', { type: 'paragraph' }, children)
        case 'A':
            return jsx(
                'element',
                { type: 'link', url: el.getAttribute('href') },
                children
            )
        default:
            return el.textContent
    }
}

export {
    toggleBlock,
    toggleMark,
    isBlockActive,
    isMarkActive,
    Element,
    Leaf,
    BlockButton,
    MarkButton,
    HOTKEYS,
    LIST_TYPES,
    serialize,
    deserialize
}