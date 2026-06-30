'use client'

import { createContext, useContext } from 'react'
import { UserRole } from '@/types'

interface RoleContextValue {
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  viewWorkerId: string
  viewDisplayName: string
}

export const RoleContext = createContext<RoleContextValue>({
  currentRole: 'EMPLOYEE',
  setCurrentRole: () => {},
  viewWorkerId: '',
  viewDisplayName: '',
})

export function useRole() {
  return useContext(RoleContext)
}

export const EMPLOYEE_ROLES: UserRole[] = ['EMPLOYEE', 'MANAGER']
export const HR_ROLES: UserRole[] = ['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP']
