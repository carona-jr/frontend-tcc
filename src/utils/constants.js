const contractStatus = ['OPENED', 'PENDING', 'SENDED', 'SIGNED']
const contractColorStatus = {
    BG_OPENED: 'var(--chakra-colors-yellow-100)',
    BG_PENDING: 'var(--chakra-colors-cyan-100)',
    BG_SENDED: 'var(--chakra-colors-red-100)',
    BG_SIGNED: 'var(--chakra-colors-green-100)',
    CO_OPENED: 'var(--chakra-colors-yellow-800)',
    CO_PENDING: 'var(--chakra-colors-cyan-800)',
    CO_SENDED: 'var(--chakra-colors-red-800)',
    CO_SIGNED: 'var(--chakra-colors-green-800)'
}
const contractNameStatus = {
    OPENED: 'Aberto',
    PENDING: 'Preparação',
    SENDED: 'Enviado',
    SIGNED: 'Assinado'
}

export {
    contractStatus,
    contractColorStatus,
    contractNameStatus
}