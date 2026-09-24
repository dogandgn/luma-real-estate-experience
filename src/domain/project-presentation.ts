import media from './presentation-media.json'
import { publicAsset } from '../utils/public-asset'
export interface PresentationSlide {
  image: string
  mobileImage?: string
  title: string
  description: string
}

export interface PresentationContent {
  heading: string
  introduction: string
  architecture: string
  lifestyle: string
  hero?: string
  heroMobile?: string
  cinematic?: PresentationSlide[]
  media?: { overview: string; facade: string; courtyard: string }
}

const presentations: Record<string, PresentationContent | undefined> = {
  'luma-avlu': {
    hero: publicAsset('/images/luma-hero-realistic.webp'),
    heroMobile: publicAsset('/images/luma-hero-realistic-768.webp'),
    cinematic: [
      {
        image: publicAsset('/images/luma-hero-realistic.webp'),
        mobileImage: publicAsset('/images/luma-hero-realistic-768.webp'),
        title: 'Işığa açılan bir hayat.',
        description: 'İki blok, ortak bir avlu. Açık havayı gündelik hayatın merkezine taşıyan bir fikir.',
      },
      {
        image: publicAsset('/images/luma-courtyard-realistic.webp'),
        mobileImage: publicAsset('/images/luma-courtyard-realistic-768.webp'),
        title: 'Günün sakin tarafı.',
        description: 'Suyun, gölgenin ve yeşilin buluştuğu ortak yaşam alanı.',
      },
      {
        image: publicAsset('/images/luma-facade-realistic.webp'),
        mobileImage: publicAsset('/images/luma-facade-realistic-768.webp'),
        title: 'Detaylarda saklı.',
        description: 'Doğal taş, ahşap ve gün ışığıyla şekillenen bir mimari dil.',
      },
    ],
    media: {
      overview: publicAsset(media.overview),
      facade: publicAsset(media.facade),
      courtyard: publicAsset(media.courtyard),
    },
    heading: 'Hayat, avluda buluşur.',
    introduction:
      'Şehrin ritminden bir adım uzakta. Işığa, yeşile ve birlikte yaşamaya açılan bir konut fikri.',
    architecture:
      'Avluyu çevreleyen yaşam alanları; doğal tonlar, gölgeli geçişler ve dışarıya açılan bir mimari yaklaşım. Luma Avlu, ortak alanları günlük hayatın merkezine alan bir demo projesidir.',
    lifestyle:
      'Sabahın sakinliğine, kısa bir yürüyüşe, günün sonunda açık havada buluşmaya yer açın. Bu sunum, ortak avlu etrafında şekillenen bir yaşam fikrini anlatır.',
  },
}

export function getProjectPresentation(projectId: string): PresentationContent | undefined {
  return Object.hasOwn(presentations, projectId) ? presentations[projectId] : undefined
}
