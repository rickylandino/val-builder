import React, { useState } from 'react';
import type { ValDetail } from '@/types/api/ValDetail';
import { valDetailsService } from '@/services/api/valDetailsService';

interface ValDetailManagerDialogProps {
  open: boolean;
  onClose: () => void;
  sectionDetails: ValDetail[];
  sectionName?: string;
  onRefreshSection?: () => void;
}

export const ValDetailManagerDialog: React.FC<ValDetailManagerDialogProps> = ({
  open,
  onClose,
  sectionDetails,
  sectionName,
  onRefreshSection,
}) => {
  const [editingDetail, setEditingDetail] = useState<ValDetail | null>(null);
  const [editValues, setEditValues] = useState<Partial<ValDetail>>({});
  const [details, setDetails] = useState<ValDetail[]>(sectionDetails);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setDetails(sectionDetails);
  }, [sectionDetails]);

  const handleEditClick = (detail: ValDetail) => {
    setEditingDetail(detail);
    setEditValues(detail);
  };

  const handleSave = async () => {
    if (editingDetail) {
      setLoading(true);
      try {
        const updated = await valDetailsService.update(editingDetail.valDetailsId, { ...editingDetail, ...editValues });
        setDetails(prev => prev.map(d => d.valDetailsId === updated.valDetailsId ? updated : d));
        setEditingDetail(null);
        setEditValues({});
        setSuccess(true);
        if (onRefreshSection) onRefreshSection();
        setTimeout(() => setSuccess(false), 1500);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDeleteDetail = async (valDetailsId: string) => {
    const detail = details.find(d => d.valDetailsId === valDetailsId);
    if (!detail) return;
    setLoading(true);
    try {
      await valDetailsService.delete(valDetailsId, detail.valId);
      setDetails(prev => prev.filter(d => d.valDetailsId !== valDetailsId));
      setSuccess(true);
      if (onRefreshSection) onRefreshSection();
      setTimeout(() => setSuccess(false), 1500);
    } finally {
      setLoading(false);
    }
  };

  // Elegant reordering logic
  const moveDetail = async (index: number, direction: 'up' | 'down') => {
    const newDetails = [...details];
    if (direction === 'up' && index > 0) {
      [newDetails[index - 1], newDetails[index]] = [newDetails[index], newDetails[index - 1]];
    } else if (direction === 'down' && index < newDetails.length - 1) {
      [newDetails[index], newDetails[index + 1]] = [newDetails[index + 1], newDetails[index]];
    }
    // Update displayOrder
    const ordered = newDetails.map((d, i) => ({ ...d, displayOrder: i + 1 }));
    setDetails(ordered);
    // Batch update displayOrder
    if (ordered.length > 0) {
      setLoading(true);
      try {
        await valDetailsService.batchUpdate(ordered[0].valId, ordered[0].groupId, ordered);
        setSuccess(true);
        if (onRefreshSection) onRefreshSection();
        setTimeout(() => setSuccess(false), 1500);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl relative">
        <button
          className="absolute top-2 right-2 text-lg p-2 rounded hover:bg-gray-200"
          aria-label="Close"
          onClick={onClose}
        >
          &#10005;
        </button>
        <h2 className="text-xl font-bold mb-4">Manage Section: {sectionName || ''}</h2>
        {loading && <div className="text-blue-600 mb-2">Saving...</div>}
        {success && <div className="text-green-600 mb-2">Saved!</div>}
        <div className="space-y-4">
          {details.map((detail, idx) => (
            <div key={detail.valDetailsId} className="border rounded p-3 flex flex-col gap-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-semibold">ID: {detail.valDetailsId}</span>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:underline" onClick={() => handleEditClick(detail)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDeleteDetail(detail.valDetailsId)}>Delete</button>
                </div>
              </div>
              <div>Content: {detail.groupContent}</div>
              <div className="flex items-center gap-2">
                <span>Order: {detail.displayOrder}</span>
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={idx === 0 || loading}
                  onClick={() => moveDetail(idx, 'up')}
                  aria-label="Move Up"
                >↑</button>
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={idx === details.length - 1 || loading}
                  onClick={() => moveDetail(idx, 'down')}
                  aria-label="Move Down"
                >↓</button>
              </div>
              <div>Bullet: {detail.bullet ? 'Yes' : 'No'}</div>
              <div>Bold: {detail.bold ? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>
        {editingDetail && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Edit Detail</h3>
            <div className="flex flex-col gap-2">
              <label>
                Content:
                <textarea
                  name="groupContent"
                  value={editValues.groupContent || ''}
                  onChange={handleChange}
                  className="border rounded p-1 w-full"
                />
              </label>
              <label>
                Order:
                <input
                  type="number"
                  name="displayOrder"
                  value={editValues.displayOrder || ''}
                  onChange={handleChange}
                  className="border rounded p-1 w-full"
                />
              </label>
              <label>
                Bullet:
                <input
                  type="checkbox"
                  name="bullet"
                  checked={!!editValues.bullet}
                  onChange={handleChange}
                  className="ml-2"
                />
              </label>
              <label>
                Bold:
                <input
                  type="checkbox"
                  name="bold"
                  checked={!!editValues.bold}
                  onChange={handleChange}
                  className="ml-2"
                />
              </label>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave} disabled={loading}>Save</button>
              <button className="mt-2 px-4 py-2 bg-gray-300 text-black rounded" onClick={() => setEditingDetail(null)} disabled={loading}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
