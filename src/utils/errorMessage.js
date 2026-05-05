/**
 * Human-readable message from Axios or unknown errors.
 */
export function getErrorMessage(err, fallback = 'Something went wrong.') {
  if (!err) return fallback
  if (typeof err === 'string') return err

  const data = err.response?.data
  if (data && typeof data === 'object') {
    const detail = data.detail ?? data.message ?? data.error
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) {
      return detail.map((d) => d.msg).join('; ')
    }
  }

  if (err.message) return err.message
  return fallback
}
