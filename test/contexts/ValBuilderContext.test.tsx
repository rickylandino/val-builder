import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { ValBuilderProvider, useValBuilder } from '@/contexts/ValBuilderContext';
import type { ValDetail } from '@/types/api/ValDetail';
import { describe, expect, it, vi } from 'vitest';

function DummyConsumer() {
  const ctx = useValBuilder();
  return <div data-testid="ctx">{JSON.stringify(ctx)}</div>;
}

describe('ValBuilderContext', () => {
  it('throws error if useValBuilder is used outside provider', () => {
    // Suppress error output for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DummyConsumer />)).toThrow('useValBuilder must be used within ValBuilderProvider');
    spy.mockRestore();
  });

  it('updates currentGroupId and valId', () => {
    function TestSetters() {
      const { setCurrentGroupId, setValId, currentGroupId, valId } = useValBuilder();
      return (
        <div>
          <button data-testid="setGroup" onClick={() => setCurrentGroupId(5)}>Set Group</button>
          <button data-testid="setVal" onClick={() => setValId(42)}>Set Val</button>
          <span data-testid="groupId">{currentGroupId}</span>
          <span data-testid="valId">{valId}</span>
        </div>
      );
    }
    const { getByTestId } = render(
      <ValBuilderProvider>
        <TestSetters />
      </ValBuilderProvider>
    );
    act(() => { getByTestId('setGroup').click(); });
    act(() => { getByTestId('setVal').click(); });
    expect(getByTestId('groupId').textContent).toBe('5');
    expect(getByTestId('valId').textContent).toBe('42');
  });

  it('updateEditorContent and updateSectionDetails work', async () => {
    function TestEditor() {
      const { updateEditorContent, updateSectionDetails, editorContent, currentDetails } = useValBuilder();
      return (
        <div>
          <button data-testid="updateContent" onClick={() => updateEditorContent('<p>abc</p>')}>Update Content</button>
          <button data-testid="updateDetails" onClick={() => updateSectionDetails([
            { valDetailsId: '1', valId: 1, groupId: 1, displayOrder: 1, groupContent: '<p>abc</p>', bullet: false, indent: 0, bold: false, center: false, blankLineAfter: null, tightLineHeight: false }
          ])}>Update Details</button>
          <span data-testid="content">{editorContent}</span>
          <span data-testid="details">{JSON.stringify(currentDetails)}</span>
        </div>
      );
    }
    const { getByTestId } = render(
      <ValBuilderProvider>
        <TestEditor />
      </ValBuilderProvider>
    );
    act(() => { getByTestId('updateContent').click(); });
    await waitFor(() => expect(getByTestId('content').textContent).toBe('<p>abc</p>'));
    act(() => { getByTestId('updateDetails').click(); });
    await waitFor(() => {
      const details = JSON.parse(getByTestId('details').textContent || '[]');
      expect(details[0].groupContent).toBe('<p>abc</p>');
    });
  });

  it('updateSingleValDetail updates a detail', async () => {
    function TestSingleUpdate() {
      const { updateSectionDetails, updateSingleValDetail, currentDetails } = useValBuilder();
      React.useEffect(() => {
        updateSectionDetails([
          { valDetailsId: '1', valId: 1, groupId: 1, displayOrder: 1, groupContent: '<p>abc</p>', bullet: false, indent: 0, bold: false, center: false, blankLineAfter: null, tightLineHeight: false }
        ]);
      }, []);
      return (
        <div>
          <button data-testid="updateSingle" onClick={() => updateSingleValDetail({
            valDetailsId: '1', valId: 1, groupId: 1, displayOrder: 1, groupContent: '<p>updated</p>', bullet: true, indent: 2, bold: true, center: true, blankLineAfter: null, tightLineHeight: true
          })}>Update Single</button>
          <span data-testid="details">{JSON.stringify(currentDetails)}</span>
        </div>
      );
    }
    const { getByTestId } = render(
      <ValBuilderProvider>
        <TestSingleUpdate />
      </ValBuilderProvider>
    );
    act(() => { getByTestId('updateSingle').click(); });
    await waitFor(() => {
      const details = JSON.parse(getByTestId('details').textContent || '[]');
      expect(details[0].groupContent).toBe('<p>updated</p>');
      expect(details[0].bullet).toBe(true);
      expect(details[0].indent).toBe(2);
      expect(details[0].bold).toBe(true);
      expect(details[0].center).toBe(true);
      expect(details[0].tightLineHeight).toBe(true);
    });
  });

  it('getAllChanges, hasChanges, resetChanges work', async () => {
    function TestChanges() {
      const { updateSectionDetails, getAllChanges, hasChanges, resetChanges } = useValBuilder();
      React.useEffect(() => {
        updateSectionDetails([
          { valDetailsId: '1', valId: 1, groupId: 1, displayOrder: 1, groupContent: '<p>abc</p>', bullet: false, indent: 0, bold: false, center: false, blankLineAfter: null, tightLineHeight: false }
        ]);
      }, []);
      return (
        <div>
          <button data-testid="change" onClick={() => updateSectionDetails([
            { valDetailsId: '1', valId: 1, groupId: 1, displayOrder: 1, groupContent: '<p>changed</p>', bullet: false, indent: 0, bold: false, center: false, blankLineAfter: null, tightLineHeight: false }
          ])}>Change</button>
          <button data-testid="reset" onClick={() => resetChanges()}>Reset</button>
          <span data-testid="hasChanges">{hasChanges().toString()}</span>
          <span data-testid="allChanges">{JSON.stringify(getAllChanges())}</span>
        </div>
      );
    }
    const { getByTestId } = render(
      <ValBuilderProvider>
        <TestChanges />
      </ValBuilderProvider>
    );
    act(() => { getByTestId('change').click(); });
    await waitFor(() => expect(getByTestId('hasChanges').textContent).toBe('true'));
    act(() => { getByTestId('reset').click(); });
    await waitFor(() => expect(getByTestId('hasChanges').textContent).toBe('false'));
  });

  it('convertEditorContentToDetails and syncEditorToContext work', async () => {
    function TestConvertSync() {
      const { updateSectionDetails, convertEditorContentToDetails, syncEditorToContext, editorContent, currentDetails } = useValBuilder();
      const [parsed, setParsed] = React.useState<ValDetail[]>([]);
      return (
        <div>
          <button data-testid="updateDetails" onClick={() => updateSectionDetails([
            { valDetailsId: '1', valId: 1, groupId: 1, displayOrder: 1, groupContent: '<p>abc</p>', bullet: true, indent: 2, bold: false, center: false, blankLineAfter: null, tightLineHeight: false }
          ])}>Update Details</button>
          <button data-testid="convert" onClick={() => setParsed(convertEditorContentToDetails(editorContent))}>Convert</button>
          <button data-testid="sync" onClick={() => syncEditorToContext(editorContent)}>Sync</button>
          <span data-testid="parsed">{JSON.stringify(parsed)}</span>
          <span data-testid="details">{JSON.stringify(currentDetails)}</span>
        </div>
      );
    }
    const { getByTestId } = render(
      <ValBuilderProvider>
        <TestConvertSync />
      </ValBuilderProvider>
    );
    act(() => { getByTestId('updateDetails').click(); });
    await waitFor(() => {
      act(() => { getByTestId('convert').click(); });
      const parsed = JSON.parse(getByTestId('parsed').textContent || '[]');
      expect(parsed[0]).toBeDefined();
      expect(parsed[0].bullet).toBe(true);
      expect(parsed[0].indent).toBe(2);
    });
    act(() => { getByTestId('sync').click(); });
    await waitFor(() => {
      const details = JSON.parse(getByTestId('details').textContent || '[]');
      expect(details[0].bullet).toBe(true);
      expect(details[0].indent).toBe(2);
    });
  });
});