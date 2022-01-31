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

const signerColorStatus = {
    BG_NOT_SIGNED: 'var(--chakra-colors-yellow-100)',
    BG_SIGNED: 'var(--chakra-colors-green-100)',
    BG_REFUSED: 'var(--chakra-colors-red-100)',
    BG_SENDED: 'var(--chakra-colors-cyan-100)',
    BG_RECEIVED: 'var(--chakra-colors-blue-100)',
    CO_NOT_SIGNED: 'var(--chakra-colors-yellow-800)',
    CO_SIGNED: 'var(--chakra-colors-green-800)',
    CO_REFUSED: 'var(--chakra-colors-red-800)',
    CO_SENDED: 'var(--chakra-colors-cyan-800)',
    CO_RECEIVED: 'var(--chakra-colors-blue-800)'
}

const transactionColorStatus = {
    BG_WAITING: 'var(--chakra-colors-yellow-100)',
    BG_FAILED: 'var(--chakra-colors-red-100)',
    BG_APPROVED: 'var(--chakra-colors-green-100)',
    CO_WAITING: 'var(--chakra-colors-yellow-800)',
    CO_FAILED: 'var(--chakra-colors-red-800)',
    CO_APPROVED: 'var(--chakra-colors-green-800)'
}

const transactionNameStatus = {
    WAITING: 'Ag. Aprovação',
    FAILED: 'Reprovado',
    APPROVED: 'Aprovado'
}

const pieChartDef = [
    {
        id: 'dots',
        type: 'patternDots',
        background: 'inherit',
        color: 'rgba(255, 255, 255, 0.3)',
        size: 4,
        padding: 1,
        stagger: true
    },
    {
        id: 'lines',
        type: 'patternLines',
        background: 'inherit',
        color: 'rgba(255, 255, 255, 0.3)',
        rotation: -45,
        lineWidth: 6,
        spacing: 10
    }
]

const pieChartFill = [
    {
        match: {
            id: 'OPENED'
        },
        id: 'dots'
    },
    {
        match: {
            id: 'PENDING'
        },
        id: 'lines'
    },
    {
        match: {
            id: 'SIGNED'
        },
        id: 'dots'
    },
    {
        match: {
            id: 'SENDED'
        },
        id: 'lines'
    }
]

const pieChartLegend = [
    {
        anchor: 'bottom',
        direction: 'row',
        justify: false,
        translateX: 0,
        translateY: 56,
        itemsSpacing: 16,
        itemWidth: 100,
        itemHeight: 18,
        itemTextColor: '#999',
        itemDirection: 'left-to-right',
        itemOpacity: 1,
        symbolSize: 18,
        symbolShape: 'circle',
        effects: [
            {
                on: 'hover',
                style: {
                    itemTextColor: '#000'
                }
            }
        ]
    }
]

export {
    contractStatus,
    contractColorStatus,
    contractNameStatus,
    signerColorStatus,
    transactionColorStatus,
    transactionNameStatus,
    pieChartDef,
    pieChartFill,
    pieChartLegend
}