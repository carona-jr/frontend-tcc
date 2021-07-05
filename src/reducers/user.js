import { UPDATE_USER } from '../actions/actions'

const initialState = {}

export const User = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_USER:
            return {
                ...state,
                ...action.user
            }
        default:
            return state
    }
}