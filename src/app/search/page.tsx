import Guard from '@/components/Guard'
import SearchForm from './SearchForm'

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <Guard requirePro>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Feedback</h1>
          <p className="text-gray-600 mt-2">
            Search your feedback using natural language. Find relevant insights instantly.
          </p>
        </div>

        <SearchForm />
      </div>
    </Guard>
  )
} 