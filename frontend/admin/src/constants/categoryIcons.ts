export const CATEGORY_ICONS = [
  { key: 'dry-food', label: 'Thức ăn khô', src: '/cat-icon-dry-food.png' },
  { key: 'wet-food', label: 'Thức ăn ướt', src: '/cat-icon-wet-food.png' },
  { key: 'treats', label: 'Bánh thưởng', src: '/cat-icon-treats.png' },
  { key: 'milk', label: 'Dinh dưỡng', src: '/cat-icon-milk.png' },
  { key: 'catnip', label: 'Cỏ mèo', src: '/cat-icon-catnip.png' },
  { key: 'bowls', label: 'Bát ăn', src: '/cat-icon-bowls.png' },
  { key: 'litter', label: 'Vệ sinh', src: '/cat-icon-litter.png' },
  { key: 'scratch', label: 'Đồ chơi', src: '/cat-icon-scratch.png' },
  { key: 'groom', label: 'Chăm sóc', src: '/cat-icon-groom.png' },
  { key: 'carrier', label: 'Vận chuyển', src: '/cat-icon-carrier.png' },
  { key: 'bed', label: 'Ổ ngủ', src: '/cat-icon-bed.png' },
  { key: 'fashion', label: 'Thời trang', src: '/cat-icon-fashion.png' },
] as const

export function categoryIconSrc(iconKey?: string | null) {
  return CATEGORY_ICONS.find((icon) => icon.key === iconKey)?.src ?? '/cat-icon-dry-food.png'
}
