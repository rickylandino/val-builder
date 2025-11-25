import type { ValDetail } from '@/types/api/ValDetail';

export type ChangeType = 'create' | 'update' | 'delete';

export interface ValDetailChange {
  action: ChangeType;
  valDetailsId?: string; // undefined for creates
  groupId: number;
  detail?: Partial<ValDetail>; // detail data for creates/updates
}

export interface SectionChanges {
  groupID: number;
  editorContent: string;
  details: ValDetail[];
  originalDetails: ValDetail[];
}

export interface ValChangesState {
  [groupID: number]: SectionChanges;
}

/**
 * Calculate changes between original and current details
 */
export function calculateChanges(
  valId: number,
  groupId: number,
  originalDetails: ValDetail[],
  currentDetails: ValDetail[]
): ValDetailChange[] {
  const changes: ValDetailChange[] = [];
  
  // Guard against undefined arrays
  const safeOriginalDetails = originalDetails || [];
  const safeCurrentDetails = currentDetails || [];
  
  const originalIds = new Set(safeOriginalDetails.map(detail => detail.valDetailsId));
  const currentIds = new Set(safeCurrentDetails.map(detail => detail.valDetailsId));

  // Find deleted details
  safeOriginalDetails.forEach(originalDetail => {
    if (!currentIds.has(originalDetail.valDetailsId)) {
      changes.push({
        action: 'delete',
        valDetailsId: originalDetail.valDetailsId,
        groupId,
      });
    }
  });

  // Find new and updated details
  safeCurrentDetails.forEach((currentDetail, index) => {
    if (!currentDetail.valDetailsId || !originalIds.has(currentDetail.valDetailsId)) {
      // New detail
      const { valDetailsId, ...createDetail } = currentDetail;
      changes.push({
        action: 'create',
        groupId,
        detail: {
          ...createDetail,
          valId,
          groupId,
          displayOrder: index + 1,
        },
      });
    } else {
      // Check if updated
      const originalDetail = safeOriginalDetails.find(detail => detail.valDetailsId === currentDetail.valDetailsId);
      if (originalDetail && hasDetailChanged(originalDetail, currentDetail, index + 1)) {
        changes.push({
          action: 'update',
          valDetailsId: currentDetail.valDetailsId,
          groupId,
          detail: {
            ...currentDetail,
            displayOrder: index + 1,
          },
        });
      }
    }
  });

  console.log(changes);

  return changes;
}

/**
 * Check if a detail has changed
 */
function hasDetailChanged(original: ValDetail, current: ValDetail, newDisplayOrder: number): boolean {
  return (
    original.groupContent !== current.groupContent ||
    original.displayOrder !== newDisplayOrder ||
    original.bullet !== current.bullet ||
    original.indent !== current.indent ||
    original.center !== current.center ||
    original.bold !== current.bold ||
    original.blankLineAfter !== current.blankLineAfter ||
    original.tightLineHeight !== current.tightLineHeight
  );
}

/**
 * Aggregate all changes from all sections
 */
export function aggregateAllChanges(
  valId: number,
  changesState: ValChangesState
): ValDetailChange[] {
  const allChanges: ValDetailChange[] = [];

  Object.values(changesState).forEach(sectionChanges => {
    if (!sectionChanges?.originalDetails || !sectionChanges?.details) {
      return; // Skip sections without proper data
    }
    
    const changes = calculateChanges(
      valId,
      sectionChanges.groupID,
      sectionChanges.originalDetails,
      sectionChanges.details
    );
    allChanges.push(...changes);
  });

  console.log(allChanges);

  return allChanges;
}
