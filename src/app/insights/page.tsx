import Guard from '@/components/Guard'
import InsightsForm from './InsightsForm'

export const dynamic = 'force-dynamic'

export default function InsightsPage() {
  return (
    <Guard requirePro>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Top Pain Point Clusters</h1>
          <p className="text-gray-600 mt-2">
            Automatically group your feedback into actionable themes and insights.
          </p>
        </div>

        <InsightsForm />
      </div>
    </Guard>
  )
} 