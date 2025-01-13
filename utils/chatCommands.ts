import { Event, Opportunity, Participant } from '@/types/types'

export function handleChatCommand(command: string): string {
  const [action, dataType] = command.split(' ')

  switch (action) {
    case 'export':
      return exportData(dataType as 'events' | 'opportunities' | 'participants')
    case 'import':
      // この関数は実際のインポート処理を行うサーバーサイドの関数に置き換える必要があります
      return "CSVデータをペーストしてください。インポートの準備ができたら 'import-data' と入力してください。"
    default:
      return "無効なコマンドです。'export [dataType]' または 'import [dataType]' を使用してください。"
  }
}

function exportData(dataType: 'events' | 'opportunities' | 'participants'): string {
  const data = JSON.parse(localStorage.getItem(dataType) || '[]')
  const headers = Object.keys(data[0] || {}).join(',')
  const rows = data.map((item: any) => Object.values(item).join(','))
  return [headers, ...rows].join('\n')
}

export function importData(dataType: 'events' | 'opportunities' | 'participants', csvData: string): string {
  const lines = csvData.trim().split('\n')
  const headers = lines[0].split(',')
  const data = lines.slice(1).map(line => {
    const values = line.split(',')
    return headers.reduce((obj: any, header, index) => {
      obj[header] = values[index]
      return obj
    }, {})
  })

  const existingData = JSON.parse(localStorage.getItem(dataType) || '[]')
  const mergedData = [...existingData, ...data]
  localStorage.setItem(dataType, JSON.stringify(mergedData))

  return `${data.length}件のデータを${dataType}にインポートしました。`
}

