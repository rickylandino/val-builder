import { apiClient } from './client';

export interface ValAnnotation {
  annotationId: number;
  author: string;
  authorId: string;
  annotationContent: string;
  annotationGroupId?: string;
  dateModified: string;
  valId: number;
  groupId: number;
}

export const valAnnotationsService = {
    /**
     * Get all annotations for a specific VAL
     */
    getByValId: async (valId: number): Promise<ValAnnotation[]> => {
      const response = await apiClient.get<ValAnnotation[]>(`/api/valannotations/byval/${valId}`);
      return response.data;
    },

  /**
   * Create a new annotation
   */
  create: async (annotation: Omit<ValAnnotation, 'annotationId' | 'dateModified' | 'annotationGroupId'>): Promise<ValAnnotation> => {
    const response = await apiClient.post<ValAnnotation>('/api/valannotations', annotation);
    return response.data;
  },

  /**
   * Delete an annotation
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/valannotations/${id}`);
  },
};
