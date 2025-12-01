import { describe, it, expect, vi, beforeEach } from 'vitest';
import { valPdfAttachmentsService } from '@/services/api/valPdfAttachmentsService';

const mockAttachment = {
  pdfId: 1,
  valId: 1,
  pdfName: 'resume',
  displayOrder: 1,
  pdfContents: btoa('PDFDATA'),
};

vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/services/api/client';

describe('valPdfAttachmentsService', () => {
    it('download throws error if no pdfContents', async () => {
      const getMock = vi.fn().mockResolvedValue({ data: { ...mockAttachment, pdfContents: undefined } });
      // @ts-ignore
      apiClient.get = getMock;
      await expect(valPdfAttachmentsService.download(1)).rejects.toThrow('No PDF content found');
    });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getByValId fetches attachments', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: [mockAttachment] });
    // @ts-ignore
    apiClient.get = getMock;
    const result = await valPdfAttachmentsService.getByValId(1);
    expect(getMock).toHaveBeenCalledWith('/api/valpdfattachments/by-val/1');
    expect(result).toEqual([mockAttachment]);
  });

  it('download returns PDF blob', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: mockAttachment });
    // @ts-ignore
    apiClient.get = getMock;
    const blob = await valPdfAttachmentsService.download(1);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
  });

  it('upload posts attachment', async () => {
    const postMock = vi.fn().mockResolvedValue({ data: mockAttachment });
    // @ts-ignore
    apiClient.post = postMock;
    const result = await valPdfAttachmentsService.upload({
      valId: 1,
      pdfName: 'resume',
      displayOrder: 1,
      pdfContents: btoa('PDFDATA'),
    });
    expect(postMock).toHaveBeenCalledWith('/api/valpdfattachments', expect.any(Object));
    expect(result).toEqual(mockAttachment);
  });

  it('update puts attachment', async () => {
    const putMock = vi.fn().mockResolvedValue({ data: mockAttachment });
    // @ts-ignore
    apiClient.put = putMock;
    const result = await valPdfAttachmentsService.update(1, { pdfName: 'updated' });
    expect(putMock).toHaveBeenCalledWith('/api/valpdfattachments/1', { pdfName: 'updated' });
    expect(result).toEqual(mockAttachment);
  });

  it('delete removes attachment', async () => {
    const deleteMock = vi.fn().mockResolvedValue({});
    // @ts-ignore
    apiClient.delete = deleteMock;
    await valPdfAttachmentsService.delete(1);
    expect(deleteMock).toHaveBeenCalledWith('/api/valpdfattachments/1');
  });

  it('downloadToFile triggers browser download', async () => {
    const downloadSpy = vi.spyOn(valPdfAttachmentsService, 'download').mockResolvedValue(new Blob(['PDFDATA'], { type: 'application/pdf' }));
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    //@ts-ignore
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeSpy = vi.fn();
    const clickSpy = vi.fn();
    vi.stubGlobal('document', {
      createElement: () => ({
        click: clickSpy,
        remove: removeSpy,
      }),
      body: { appendChild: appendSpy },
    });
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.useFakeTimers();
    await valPdfAttachmentsService.downloadToFile(1, 'resume');
    expect(downloadSpy).toHaveBeenCalledWith(1);
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    vi.runAllTimers();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
