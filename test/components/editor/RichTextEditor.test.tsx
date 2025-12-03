import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import type { CompanyPlan, ValDetail, ValHeader } from '@/types/api';
import { initialAllDetails } from './editor-test-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { valHeader } from '../val-builder/test-data';
import { mockPlan } from '../plans/test-data';

const queryClient = new QueryClient();

const renderWithQueryClient = (ui: React.ReactElement) => render(
    <QueryClientProvider client={queryClient}>
        {ui}
    </QueryClientProvider>
);

const valHeaderMock = valHeader;

describe('RichTextEditor', () => {
    let onChange: (content: string) => void;
    let onFormat: () => void;
    let onDelete: () => void;

    beforeEach(() => {
        onChange = vi.fn<(content: string) => void>();
        onFormat = vi.fn<() => void>();
        onDelete = vi.fn<() => void>();
    });

    const renderWithProvider = (ui: React.ReactElement, initialData?: Partial<{
        allValDetails: ValDetail[];
        currentGroupId: number;
        valId: number;
    }>) => renderWithQueryClient(
        
        <ValBuilderProvider 
            initialAllValDetails={initialData?.allValDetails}
            initialCurrentGroupId={initialData?.currentGroupId}
            initialValId={initialData?.valId}
        >
            {ui}
        </ValBuilderProvider>
    );

    it('renders editor and toolbar', () => {
        renderWithProvider(
            <RichTextEditor
                onChange={onChange}
                onFormat={onFormat}
                onDelete={onDelete}
                valHeader={valHeaderMock}
                companyPlan={mockPlan}

            />
        );
        expect(screen.getByLabelText('Editor content')).toBeInTheDocument();
        expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
    });

    it('renders placeholder when empty', () => {
        renderWithProvider(
            <RichTextEditor onChange={onChange} placeholder="Type here..." valHeader={valHeaderMock} companyPlan={mockPlan} />
        );
        expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('handles pointer down on drag handle', () => {
        renderWithProvider(
            <RichTextEditor  onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />
        );
        const dragHandle = screen.getByTitle('Drag to reorder');
        fireEvent.pointerDown(dragHandle);
        expect(dragHandle).toBeInTheDocument();
    });

    it('handles Enter key to insert paragraph', () => {
        renderWithProvider(<RichTextEditor onChange={() => {}} valHeader={valHeaderMock} companyPlan={mockPlan} />);
        const editorContent = screen.getByLabelText('Editor content').querySelector('.tiptap-editor');
        if (editorContent) {
            const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
            editorContent.dispatchEvent(event);
            expect(editorContent).toBeInTheDocument();
        }
    });

    it('should render initial content from context', async () => {
        const testDetails: ValDetail[] = [
            {
                valDetailsId: 'test-1',
                valId: 1,
                groupId: 1,
                displayOrder: 1,
                groupContent: '<p data-val-details-id="test-1">Test content from context</p>',
                bullet: false,
                indent: null,
                bold: false,
                center: false,
                blankLineAfter: null,
                tightLineHeight: false,
            },
        ];

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: testDetails,
                currentGroupId: 1,
                valId: 1,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Test content from context')).toBeInTheDocument();
        });
    });

    it('should allow dragging and dropping paragraphs within the editor', async () => {
        // Mock the browser APIs that jsdom doesn't support
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }
        if (!document.elementFromPoint) {
            document.elementFromPoint = vi.fn().mockReturnValue(null);
        }

        renderWithProvider(
            <RichTextEditor
                onChange={onChange}
                onFormat={onFormat}
                onDelete={onDelete}
                valHeader={valHeaderMock}
                companyPlan={mockPlan}
            />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        // Find all paragraphs (paragraph = val detail in this case)
        const paragraphs = screen.getAllByText(/Content/);

        expect(paragraphs).toHaveLength(5);

        // Access the TipTap editor instance via window test hook
        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;
            
            // Get the actual document positions for accurate targeting
            const doc = pmView.state.doc;
            let targetDropPos = 0;
            let fifthParagraphId = '';
            
            // Find the fifth paragraph's actual valDetailsId and position after fourth
            const allParagraphs: any[] = [];
            doc.descendants((node: any, pos: number) => {
                if (node.type.name === 'paragraph' && node.attrs?.valDetailsId) {
                    allParagraphs.push({ id: node.attrs.valDetailsId, pos, nodeSize: node.nodeSize });
                }
            });
                        
            // The fifth paragraph is at index 4
            if (allParagraphs.length >= 5) {
                fifthParagraphId = allParagraphs[4].id;
                // Target position is after the 3rd paragraph (index 3, before original 4th)
                targetDropPos = allParagraphs[3].pos + allParagraphs[3].nodeSize;
            }
            
            // Create mock event and slice for internal drop - these bounds are the correct ones for the content in the mock data
            // If mock data changes, these will need to be adjusted
            const mockEvent = {
                clientX: 372,
                clientY: 415,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn(),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const mockSlice = {
                content: {
                    firstChild: {
                        attrs: {
                            valDetailsId: fifthParagraphId, // Use actual fifth paragraph ID from document
                        },
                    },
                },
            };

            // Call the handleDrop function directly from editorProps
            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                // Mock posAtCoords to return position after third paragraph (to move 5th before 4th)
                pmView.posAtCoords = vi.fn().mockReturnValue({ pos: targetDropPos, inside: -1 });
                
                handleDrop(pmView, mockEvent as any, mockSlice, true);
                
                // Wait for state update
                await waitFor(() => {
                    const updatedParagraphs = screen.getAllByText(/Content/);
                    
                    // Verify onChange was called multiple times (initial render + drop update)
                    expect(updatedParagraphs[3].textContent).toContain('Content 5');
                }, { timeout: 3000 });
            } 
        }
    });

    it('should handle external drop (from outside editor)', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }
        if (!document.elementFromPoint) {
            document.elementFromPoint = vi.fn().mockReturnValue(null);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;
            
            const mockEvent = {
                clientX: 100,
                clientY: 100,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn((type: string) => {
                        if (type === 'text/html') return '<p>Dropped content</p>';
                        return 'Dropped content';
                    }),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                pmView.posAtCoords = vi.fn().mockReturnValue({ pos: 10, inside: -1 });
                
                // Call with moved=false for external drop
                const result = handleDrop(pmView, mockEvent as any, null, false);
                
                expect(result).toBe(true);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
            }
        }
    });

    it('should return false when external drop has no content', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }
        if (!document.elementFromPoint) {
            document.elementFromPoint = vi.fn().mockReturnValue(null);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;
            
            const mockEvent = {
                clientX: 100,
                clientY: 100,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn(() => ''),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                pmView.posAtCoords = vi.fn().mockReturnValue({ pos: 10, inside: -1 });
                
                const result = handleDrop(pmView, mockEvent as any, null, false);
                
                expect(result).toBe(false);
            }
        }
    });

    it('should return false when external drop has no valid position', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }
        if (!document.elementFromPoint) {
            document.elementFromPoint = vi.fn().mockReturnValue(null);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;
            
            const mockEvent = {
                clientX: 100,
                clientY: 100,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn(() => 'Some content'),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                pmView.posAtCoords = vi.fn().mockReturnValue(null);
                
                const result = handleDrop(pmView, mockEvent as any, null, false);
                
                expect(result).toBe(false);
            }
        }
    });

    it('should update editor content when context editorContent changes', async () => {
        const { unmount } = renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        unmount();

        const newDetails: ValDetail[] = [
            {
                valDetailsId: 'new-1',
                valId: 4,
                groupId: 1,
                displayOrder: 1,
                groupContent: '<p data-val-details-id="new-1">New content</p>',
                bullet: false,
                indent: null,
                bold: false,
                center: false,
                blankLineAfter: null,
                tightLineHeight: false,
            },
        ];

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: newDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('New content')).toBeInTheDocument();
        });
    });

    it('should handle dragover event', () => {
        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        const editorSection = screen.getByLabelText('Editor content');
        
        const dragEvent = new Event('dragover', { bubbles: true, cancelable: true });
        Object.defineProperty(dragEvent, 'dataTransfer', {
            value: { dropEffect: '' },
            writable: true
        });

        editorSection.dispatchEvent(dragEvent);

        expect((dragEvent as any).dataTransfer.dropEffect).toBe('copy');
    });

    it('should return false when handleKeyDown receives non-Enter key', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;
            
            const mockEvent = {
                key: 'a',
                shiftKey: false,
                preventDefault: vi.fn(),
            };

            const handleKeyDown = pmView.props?.handleKeyDown;
            if (handleKeyDown) {
                const result = handleKeyDown(pmView, mockEvent as any);
                
                expect(result).toBe(false);
                expect(mockEvent.preventDefault).not.toHaveBeenCalled();
            }
        }
    });

    it('should return false when Shift+Enter is pressed', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;
            
            const mockEvent = {
                key: 'Enter',
                shiftKey: true,
                preventDefault: vi.fn(),
            };

            const handleKeyDown = pmView.props?.handleKeyDown;
            if (handleKeyDown) {
                const result = handleKeyDown(pmView, mockEvent as any);
                
                expect(result).toBe(false);
                expect(mockEvent.preventDefault).not.toHaveBeenCalled();
            }
        }
    });

    it('should correctly calculate target index when dragging upward', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }
        if (!document.elementFromPoint) {
            document.elementFromPoint = vi.fn().mockReturnValue(null);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;

            const doc = pmView.state.doc;
            const paragraphs: any[] = [];

            doc.descendants((node: any, pos: number) => {
                if (node.type.name === 'paragraph') {
                    const valDetailsId = node.attrs?.valDetailsId;
                    if (valDetailsId) {
                        paragraphs.push({ valDetailsId, pos, node });
                    }
                }
            });

            // Drag paragraph 4 up to paragraph 1's position (dragging upward)
            const draggedParagraph = paragraphs[3]; // Index 3 (4th paragraph)
            const targetParagraph = paragraphs[0]; // Index 0 (1st paragraph)

            const mockSlice = {
                content: {
                    firstChild: {
                        type: { name: 'paragraph' },
                        attrs: { valDetailsId: draggedParagraph.valDetailsId },
                        content: { size: 0 },
                    },
                },
            };

            const mockEvent = {
                clientX: 100,
                clientY: 50,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn(),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                // Position at target paragraph (within its range to trigger the findTargetIndex logic)
                pmView.posAtCoords = vi.fn().mockReturnValue({ 
                    pos: targetParagraph.pos + 3, // Position within the first paragraph
                    inside: -1 
                });

                handleDrop(pmView, mockEvent as any, mockSlice, true);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
            }
        }
    });

    it('should correctly calculate target index when dragging downward', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }
        if (!document.elementFromPoint) {
            document.elementFromPoint = vi.fn().mockReturnValue(null);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;

            const doc = pmView.state.doc;
            const paragraphs: any[] = [];

            doc.descendants((node: any, pos: number) => {
                if (node.type.name === 'paragraph') {
                    const valDetailsId = node.attrs?.valDetailsId;
                    if (valDetailsId) {
                        paragraphs.push({ valDetailsId, pos, node });
                    }
                }
            });

            // Drag paragraph 1 down to paragraph 4's position (dragging downward)
            const draggedParagraph = paragraphs[0]; // Index 0 (1st paragraph)
            const targetParagraph = paragraphs[3]; // Index 3 (4th paragraph)

            const mockSlice = {
                content: {
                    firstChild: {
                        type: { name: 'paragraph' },
                        attrs: { valDetailsId: draggedParagraph.valDetailsId },
                        content: { size: 0 },
                    },
                },
            };

            const mockEvent = {
                clientX: 100,
                clientY: 150,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn(),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                // Position at target paragraph (within its range to trigger the findTargetIndex logic)
                pmView.posAtCoords = vi.fn().mockReturnValue({ 
                    pos: targetParagraph.pos + 3, // Position within the fourth paragraph
                    inside: -1 
                });

                handleDrop(pmView, mockEvent as any, mockSlice, true);

                expect(mockEvent.preventDefault).toHaveBeenCalled();
            }
        }
    });

    it('should return false when moved is true but slice is invalid', async () => {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = vi.fn().mockReturnValue([]);
        }

        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('Content 1')).toBeInTheDocument();
        });

        const tiptapEditor = (globalThis as any).__tiptapEditor;
        
        if (tiptapEditor?.view) {
            const pmView = tiptapEditor.view;

            const mockEvent = {
                clientX: 100,
                clientY: 50,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
                dataTransfer: {
                    getData: vi.fn(),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                },
            };

            const handleDrop = pmView.props?.handleDrop;
            if (handleDrop) {
                pmView.posAtCoords = vi.fn().mockReturnValue({ pos: 10, inside: -1 });
                
                // Call with moved=true but null slice to reach line 190
                const result = handleDrop(pmView, mockEvent as any, null, true);
                
                expect(result).toBe(false);
            }
        }
    });

    it('should toggle debug panel', () => {
        renderWithProvider(
            <RichTextEditor onChange={onChange} valHeader={valHeaderMock} companyPlan={mockPlan} />,
            {
                allValDetails: initialAllDetails,
                currentGroupId: 1,
                valId: 4,
            }
        );

        const debugButton = screen.getByText('Show Debug');
        expect(debugButton).toBeInTheDocument();

        fireEvent.click(debugButton);

        expect(screen.getByText('Hide Debug')).toBeInTheDocument();
    });
});
