import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import mermaid from 'mermaid';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [svg, setSvg] = useState('');

  const mermaidChart = `
    graph TD;
        subgraph "Level 1: Projects"
            A[Projects Page] -->|Select Project| B;
            A -->|Click 'New Project'| C[Project Modal];
            C -->|Saves| A;
        end

        subgraph "Level 2: Documents"
            B[Documents Page] -->|Select 'Manage Annotations'| D;
            B -->|Click 'New Document'| E[Document Modal];
            B -->|Click 'Upload Annotations'| F[Excel Upload Modal];
            E -->|Saves| B;
        end

        subgraph "Level 3: Annotated Metaphors"
            D[Annotation Grid];
            F -->|Processes| G[Import Report];
            D -->|Inline Editing/Filters| H[Backend API - AnnotatedMetaphors];
            G --> B;
        end

        style A fill:#e0f2fe,stroke:#38bdf8,stroke-width:2px;
        style B fill:#e0f2fe,stroke:#38bdf8,stroke-width:2px;
        style D fill:#e0f2fe,stroke:#38bdf8,stroke-width:2px;
  `;

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      const renderMermaid = async () => {
        try {
          const { svg: svgCode } = await mermaid.render('mermaid-diagram-about-modal', mermaidChart);
          const cleanedSvg = svgCode.replace(/style="[^"]*"/, '');
          setSvg(cleanedSvg);
        } catch (e) {
          console.error('Mermaid rendering failed:', e);
        }
      };
      renderMermaid();
    }
  }, [isOpen, mermaidChart]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 flex justify-between items-center">
                  Welcome to Metaphor Manager!
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                <div className="mt-4 max-h-[75vh] overflow-y-auto pr-2">
                    <p className="mb-4 text-gray-600">
                        <b>Metaphor Manager</b> is a platform designed for the management, annotation, and analysis of metaphors in linguistic research projects.
                    </p>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Application Workflow</h2>
                        <p className="mb-4 text-gray-600">
                            The application's workflow is structured hierarchically across three main levels: Projects, Documents, and Annotated Metaphors.
                        </p>
                        <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-600">
                            <li><b>Projects:</b> The top-level container. Researchers start by creating a project to group related documents and analyses.</li>
                            <li><b>Documents:</b> Within each project, source documents are uploaded. These are the basis for the annotation work.</li>
                            <li><b>Annotated Metaphors:</b> This is the core level where users identify, classify, and edit conceptual metaphors found within the documents.</li>
                        </ol>
                        
                        <div className="flex justify-center p-4 border rounded-lg bg-gray-50">
                        {svg ? (
                            <div className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
                        ) : (
                            <div className="text-gray-500">Loading diagram...</div>
                        )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 