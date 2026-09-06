type Props = {
  name: string
  iconKey?: string | null
  className?: string
}

const imagesByName: Record<string, string> = {
  'trang chủ': '/cat-icon-home.png',
  'thức ăn': '/cat-icon-food.png',
  'thức ăn khô': '/cat-icon-dry-food.png',
  'thức ăn ướt': '/cat-icon-wet-food.png',
  'bánh thưởng & snack': '/cat-icon-treats.png',
  'sữa & dinh dưỡng': '/cat-icon-milk.png',
  'cỏ mèo & thảo mộc': '/cat-icon-catnip.png',
  'phụ kiện': '/cat-icon-accessories.png',
  'dụng cụ ăn uống': '/cat-icon-bowls.png',
  'vệ sinh & khay cát': '/cat-icon-litter.png',
  'đồ chơi & cào móng': '/cat-icon-scratch.png',
  'chăm sóc & grooming': '/cat-icon-groom.png',
  'vận chuyển': '/cat-icon-carrier.png',
  'ổ đệm & nhà ngủ': '/cat-icon-bed.png',
  'thời trang mèo': '/cat-icon-fashion.png',
}

const imagesByKey: Record<string, string> = {
  'dry-food': '/cat-icon-dry-food.png',
  'wet-food': '/cat-icon-wet-food.png',
  treats: '/cat-icon-treats.png',
  milk: '/cat-icon-milk.png',
  catnip: '/cat-icon-catnip.png',
  bowls: '/cat-icon-bowls.png',
  litter: '/cat-icon-litter.png',
  scratch: '/cat-icon-scratch.png',
  groom: '/cat-icon-groom.png',
  carrier: '/cat-icon-carrier.png',
  bed: '/cat-icon-bed.png',
  fashion: '/cat-icon-fashion.png',
}

export function CatIcon({ name, iconKey, className }: Props) {
  const src = (iconKey ? imagesByKey[iconKey] : undefined) ?? imagesByName[name.trim().toLowerCase()] ?? '/logo.png'
  return <img className={className} src={src} alt="" aria-hidden />
}
