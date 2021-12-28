import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
    children: ReactNode
    roles?: [string]
    permissions?: [string]
}

export function Can({ children, permissions, roles }: CanProps) {

    const userCanSeeComponent = useCan({ permissions, roles })

    if(!userCanSeeComponent)
        return null

    return (
        <>
            {children}
        </>
    )
}