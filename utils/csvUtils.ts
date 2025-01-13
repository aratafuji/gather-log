import { Event, Opportunity, Participant } from '@/types/types'

export function exportToCSV(data: any[], filename: string) {
  const csvContent = data.map(row => Object.values(row).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function parseCSV(csv: string): any[] {
  const lines = csv.split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index]
      return obj
    }, {} as any)
  })
}

export function importCSV(csvData: string, dataType: 'events' | 'opportunities' | 'participants') {
  const parsedData = parseCSV(csvData)
  const existingData = JSON.parse(localStorage.getItem(dataType) || '[]')
  const mergedData = [...existingData, ...parsedData]
  localStorage.setItem(dataType, JSON.stringify(mergedData))
}

