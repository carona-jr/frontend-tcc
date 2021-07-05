import { UPDATE_LOGGED } from './actions'

const updateLogged = value => ({
    type: UPDATE_LOGGED,
    logged: value
})

export {
    updateLogged
}