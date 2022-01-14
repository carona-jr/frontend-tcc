function getDate(timestamp) {
    const date = new Date(parseInt(timestamp))
    return date.toLocaleString('pt-BR')
}

const currencyFormatter = (formatted_value) => {
    if (!Number(formatted_value)) return "R$ 0,00"
    const br = { style: "currency", currency: "BRL" }
    return new Intl.NumberFormat("pt-BR", br).format(formatted_value)
}

export {
    getDate,
    currencyFormatter
}