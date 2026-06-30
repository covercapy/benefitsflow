'use client'

import { createContext, useContext } from 'react'
import { UserRole } from '@/types'

interface RoleContextValue {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
}

export const RoleContext = createContext<RoleContextValue>({
  currentRole: 'EMPLOYEE',
  setCurrentRole: () => {},
})

export function useRole() {
  return useContext(RoleContext)
}

export const EMPLOYEE_ROLES: UserRole[] = ['EMPLOYEE', 'MANAGER']
export const HR_ROLES: UserRole[] = ['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP']
