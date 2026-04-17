/**
 * Trigger a browser download for a Blob with a given filename.
 *
 * Usage:
 *   const blob = await api.downloadReportCardPdf(id)
 *   downloadBlob(blob, `report-card-${id}.pdf`)
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download, then free memory
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
