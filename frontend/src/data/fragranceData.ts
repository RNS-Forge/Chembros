import bottleImg from '../assets/bottle.png'

export interface FragranceItem {
  id: string
  code: string
  title: string
  tagline: string
  price: number
  priceFormatted: string
  volume: string
  concentration: string
  longevity: string
  gender: string
  description: string
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  image: string
  isArchive?: boolean
}

export const FRAGRANCES_DATA: FragranceItem[] = [
  {
    id: 'molecule-x',
    code: '01',
    title: 'MOLECULE X',
    tagline: 'Santal · Iso E Super · Cardamom',
    price: 1299,
    priceFormatted: '₹1299',
    volume: '30ml Extrait',
    concentration: '32% Organic Oil Concentration',
    longevity: '10+ Hours',
    gender: 'Unisex',
    description: 'A hyper-modern woody aura engineered with fractional sandalwood and velvety Iso E Super. Melts into skin warmth to create an intimate, magnetic second-skin sillage.',
    topNotes: ['Green Cardamom', 'Crisp Pink Peppercorn', 'Cedrat'],
    heartNotes: ['Fractional Orris', 'Cashmeran', 'Paper Birch'],
    baseNotes: ['Pure Australian Sandalwood', 'Iso E Super', 'Clean Musk'],
    image: bottleImg,
  },
  {
    id: 'molecule-t',
    code: '02',
    title: 'MOLECULE T',
    tagline: 'Black Tea · Ambroxan · Bergamot',
    price: 1299,
    priceFormatted: '₹1299',
    volume: '30ml Extrait',
    concentration: '28% Organic Oil Concentration',
    longevity: '8+ Hours',
    gender: 'Unisex',
    description: 'Inspired by steam distillation of whole black tea leaves infused with coastal bergamot rind and sharp crystalline ambroxan crystals.',
    topNotes: ['Calabrian Bergamot', 'Crushed Mint Leaf', 'Eucalyptus'],
    heartNotes: ['Ceylon Black Tea Extract', 'Smoked Fig Leaf', 'Clary Sage'],
    baseNotes: ['Ambroxan Crystals', 'White Cedar', 'Tobacco Ash'],
    image: bottleImg,
  },
  {
    id: 'molecule-j',
    code: '03',
    title: 'MOLECULE J',
    tagline: 'Iris Root · Vetiver · Cedar',
    price: 1299,
    priceFormatted: '₹1299',
    volume: '30ml Extrait',
    concentration: '30% Organic Oil Concentration',
    longevity: '9+ Hours',
    gender: 'Unisex',
    description: 'Cryogenically stabilized pallida iris root wrapped in clean Haitian vetiver and atmospheric cedarwood. A chilled, razor-sharp architectural fragrance.',
    topNotes: ['Frozen Aldehydes', 'Bitter Orange Peel', 'Ozone'],
    heartNotes: ['Florentine Iris Pallida', 'Violet Leaf', 'Magnolia Bark'],
    baseNotes: ['Haitian Vetiver', 'Atlas Cedar', 'Ambergris'],
    image: bottleImg,
  },
  {
    id: 'molecule-k',
    code: '04',
    title: 'MOLECULE K',
    tagline: 'Smoked Ozone · Frankincense · Hinoki',
    price: 1299,
    priceFormatted: '₹1299',
    volume: '30ml Extrait',
    concentration: '35% Organic Oil Concentration',
    longevity: '12+ Hours',
    gender: 'Unisex',
    description: 'A heavy distillation of cold stone, petrichor, and sacrificial frankincense. Designed for atmospheric projection and long-wearing nocturnal depth.',
    topNotes: ['Mineral Rain', 'Crushed Pine Needles', 'Elemi'],
    heartNotes: ['High-Grade Omani Frankincense', 'Smoked Juniper', 'Hinoki Wood'],
    baseNotes: ['Dark Patchouli', 'Labdanum Resin', 'Volcanic Ash'],
    image: bottleImg,
  },
  {
    id: 'the-discovery-archive',
    code: 'ARCHIVE',
    title: 'THE DISCOVERY ARCHIVE',
    tagline: '4 × 3ml Extrait de Parfum Collection',
    price: 1299,
    priceFormatted: '₹1299',
    volume: '4 × 3ml Extrait',
    concentration: '25%–35% Natural Oil Formulation',
    longevity: '8+ Hours Each',
    gender: 'Unisex Specimen Set',
    description: 'The complete Chems Bros olfactory series in miniature laboratory ampoules. Designed for testing skin-chemistry evolution prior to full bottle selection.',
    topNotes: ['Cardamom', 'Tea Leaf', 'Frozen Aldehydes', 'Mineral Rain'],
    heartNotes: ['Iris Root', 'Black Tea', 'Smoked Juniper', 'Cashmeran'],
    baseNotes: ['Sandalwood', 'Ambroxan', 'Haitian Vetiver', 'Frankincense'],
    image: bottleImg,
    isArchive: true,
  },
]