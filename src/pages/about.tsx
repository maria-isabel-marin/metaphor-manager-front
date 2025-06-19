import Layout from '@/components/Layout'

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow mt-8">
        <h1 className="text-3xl font-bold mb-4">About Metaphor Manager</h1>
        <p className="mb-4">
          <b>Metaphor Manager</b> is a platform designed for the management, annotation, and analysis of metaphors in linguistic research projects. It allows users to organize projects, upload documents, annotate metaphors, and collaborate in review and analysis processes.
        </p>
        <p className="mb-4">
          This application is part of the <b>AI-Driven Metaphor Field-Loop Theory</b> project and aims to facilitate the work of researchers, linguists, and academic teams interested in the study of conceptual metaphor.
        </p>
        <p className="text-gray-500 text-sm mt-6">
          Developed by the AI-Driven Metaphor Field-Loop Theory team.<br/>
          © 2025 All rights reserved.
        </p>
      </div>
    </Layout>
  )
} 