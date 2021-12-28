import { validateUserPermissions } from "../utils/validateUserPermissions"
import { useAuth } from "./useAuth"

type useCanParams = {
    permissions?: string [],
    roles?: string []
}

export function useCan({ permissions, roles }: useCanParams) {
    const { user, isAuthenticated } = useAuth()

    if(!isAuthenticated){
        return false
    }

    const userHasPermissions = validateUserPermissions({ user, permissions, roles })

    return userHasPermissions
}