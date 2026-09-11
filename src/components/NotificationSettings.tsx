import { useState } from 'react'
import { enableNotifications, getNotificationPermission } from '../lib/notifications'

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermission(),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEnable() {
    setLoading(true)
    setError('')
    try {
      const result = await enableNotifications()
      if (result.status === 'granted') {
        setPermission('granted')
      } else if (result.status === 'denied') {
        setPermission('denied')
      } else {
        setError('این مرورگر از نوتیفیکیشن پشتیبانی نمی‌کند.')
      }
    } catch {
      setError('فعال‌سازی نوتیفیکیشن با خطا مواجه شد.')
    } finally {
      setLoading(false)
    }
  }

  if (permission === 'granted') {
    return <p className="notification-status">یادآوری‌های چک فعال است.</p>
  }

  if (permission === 'unsupported') {
    return null
  }

  return (
    <div className="notification-settings">
      <button type="button" onClick={handleEnable} disabled={loading}>
        {loading ? 'در حال فعال‌سازی...' : 'فعال‌سازی یادآوری چک'}
      </button>
      {permission === 'denied' && (
        <p className="form-error">
          دسترسی نوتیفیکیشن رد شده است. از تنظیمات مرورگر آن را فعال کنید.
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
