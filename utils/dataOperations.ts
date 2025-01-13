import { supabase } from './supabase'

export async function fetchData(type: string) {
  try {
    const { data, error } = await supabase
      .from(type)
      .select('*')

    if (error) {
      console.error('Error fetching data:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Unexpected error in fetchData:', error)
    throw error
  }
}

export async function saveData(type: string, data: any) {
  try {
    const { data: savedData, error } = await supabase
      .from(type)
      .upsert(data)
      .select()

    if (error) {
      console.error('Error saving data:', error)
      throw new Error('データ保存エラー: ' + error.message)
    }

    if (!savedData || savedData.length === 0) {
      throw new Error('保存されたデータが空です')
    }

    return savedData
  } catch (error) {
    console.error('Unexpected error in saveData:', error)
    throw error
  }
}

export async function deleteData(type: string, id: string) {
  try {
    const { error } = await supabase
      .from(type)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting data:', error)
      throw error
    }
  } catch (error) {
    console.error('Unexpected error in deleteData:', error)
    throw error
  }
}

