/* eslint-disable import/no-anonymous-default-export */
import { RiFilePaper2Fill } from 'react-icons/ri'
import { FaHome } from 'react-icons/fa'

export default [
    {
        name: 'Contratos',
        items: [
            {
                icon: <FaHome fontSize='32px' />,
                description: 'Home',
                navigate: '/home'
            },
            {
                icon: <RiFilePaper2Fill fontSize='32px' />,
                description: 'Contratos',
                navigate: '/flow/order'
            }
        ]
    }
]