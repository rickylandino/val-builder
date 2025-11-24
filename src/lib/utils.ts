import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Company } from "@/types/api/Company"
import type { ValSection } from "@/types/api/ValSection"
import type { ValHeader } from "@/types/api/ValHeader"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type guard to check if a value is a Company
 */
export function isCompany(obj: unknown): obj is Company {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'companyId' in obj &&
    typeof (obj as Company).companyId === 'number'
  );
}

/**
 * Type guard to check if a value is a ValSection
 */
export function isValSection(obj: unknown): obj is ValSection {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'groupId' in obj &&
    typeof (obj as ValSection).groupId === 'number'
  );
}

/**
 * Type guard to check if a value is a ValHeader
 */
export function isValHeader(obj: unknown): obj is ValHeader {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'valId' in obj &&
    typeof (obj as ValHeader).valId === 'number'
  );
}