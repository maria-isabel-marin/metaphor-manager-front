import { Project } from '@/types/project'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold">{project.name}</h2>
      <p className="text-gray-600">{project.description}</p>
    </div>
  )
}
