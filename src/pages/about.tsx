import Layout from '@/components/Layout'
import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

export default function AboutPage() {
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
    // We only want to run this on the client
    if (typeof window !== 'undefined') {
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
      const renderMermaid = async () => {
        try {
          // Unique ID for rendering
          const { svg: svgCode } = await mermaid.render('mermaid-diagram-about', mermaidChart);
          // Remove the style attribute which contains max-width to allow custom sizing
          const cleanedSvg = svgCode.replace(/style="[^"]*"/, '');
          setSvg(cleanedSvg);
        } catch (e) {
          console.error('Mermaid rendering failed:', e);
        }
      };
      renderMermaid();
    }
  }, [mermaidChart]);


  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-8 mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">About Metaphor Manager</h1>
        <p className="mb-4 text-gray-600">
          <b>Metaphor Manager</b> is a platform designed for the management, annotation, and analysis of metaphors in linguistic research projects. It allows users to organize projects, upload documents, annotate metaphors, and collaborate in review and analysis processes.
        </p>
        <p className="mb-4 text-gray-600">
          This application is part of the <b>AI-Driven Metaphor Field-Loop Theory</b> project and aims to facilitate the work of researchers, linguists, and academic teams interested in the study of conceptual metaphor.
        </p>

        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">Application Workflow</h2>
            <p className="mb-4 text-gray-600">
                The application's workflow is structured hierarchically across three main levels: Projects, Documents, and Annotated Metaphors. This design allows for a clear and organized research process.
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-600">
                <li><b>Projects:</b> The top-level container. Researchers start by creating a project to group related documents and analyses.</li>
                <li><b>Documents:</b> Within each project, source documents (like texts or manuscripts) are uploaded. These are the basis for the annotation work.</li>
                <li><b>Annotated Metaphors:</b> This is the core level where users identify, classify, and edit conceptual metaphors found within the documents. A powerful grid interface and bulk import/export tools streamline this process.</li>
            </ol>
            
            <div className="flex justify-center p-4 border rounded-lg bg-gray-50">
              {svg ? (
                <div className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
              ) : (
                <div className="text-gray-500">Loading diagram...</div>
              )}
            </div>
        </div>

        <p className="text-gray-500 text-sm mt-8 pt-4 border-t">
          Developed by the AI-Driven Metaphor Field-Loop Theory team.<br/>
          © 2025 All rights reserved.
        </p>
      </div>
    </Layout>
  )
} 