import { UPDATE_LOGGED } from '../actions/actions'

const initialState = {
    logged: false
}

export const Logged = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_LOGGED:
            return {
                logged: action.logged
            }
        default:
            return state
    }
}