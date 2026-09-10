import { publicAsset } from './utils/public-asset'

export const config = {
  brand: 'luma',
  city: 'İzmir',
  map: {
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [26.94, 38.385] as [number, number],
    zoom: 10.5,
    maxZoom: 14,
  },
  images: {
    residence: publicAsset('/images/residence.webp'),
    villa: publicAsset('/images/villa.webp'),
  },
  disclaimer:
    'Harita gerçektir. Projeler, fiyatlar ve konum işaretleri temsilidir; gerçek bir satış ilanı değildir.',
}
