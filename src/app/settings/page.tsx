import Guard from '@/components/Guard'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <Guard>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and subscription</p>
        </div>

        <SettingsForm />
      </div>
    </Guard>
  )
} 