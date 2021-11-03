function getDate(timestamp) {
    const date = new Date(parseInt(timestamp))
    return date.toLocaleString('pt-BR')
}

export {
    getDate
}