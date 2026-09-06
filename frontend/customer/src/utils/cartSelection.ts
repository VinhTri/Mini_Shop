const KEY = 'tvt_cart_selection'

export function readCartSelection(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is number => Number.isInteger(id)) : []
  } catch {
    return []
  }
}

export function writeCartSelection(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

export function clearCartSelection() {
  localStorage.removeItem(KEY)
}
