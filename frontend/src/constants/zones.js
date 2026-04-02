export const ZONE_CONFIG = [
  { key: 'CAMARA_FRIA',      label: 'Câmara Fria' },
  { key: 'CONTAINERS',       label: 'Warehouse'   },
  { key: 'SECOS',            label: 'Secos'        },
  { key: 'OPEN_BOX',         label: 'Open Box'     },
]

export const ZONE_LABELS = Object.fromEntries(
  ZONE_CONFIG.map(z => [z.key, z.label])
)

// Also map the old CAMARA_FRIA_FORA key for modal display
ZONE_LABELS['CAMARA_FRIA_FORA'] = 'Câmara Fria'

export const SUBZONE_LABELS = {
  NASSIF:  'Nassif',
  SAAB:    'Saab',
  BEBIDAS: 'Bebidas',
}

// Map container label prefixes to full names
export const LABEL_PREFIX_MAP = {
  'CF':   'Câmara Fria',
  'CFF':  'Câmara Fria',
  'CT36': 'Container 36',
  'CT33': 'Container 33',
  'CT32': 'Container 32',
  'CT31': 'Container 31',
  'SN':   'Secos Nassif',
  'SS':   'Secos Saab',
  'SB':   'Bebidas',
  'OB':   'Open Box',
}

// Expand a label like "CF-01" → "Câmara Fria 01"
export const expandLabel = (label) => {
  const match = label.match(/^([A-Z]+\d*)-(.+)$/)
  if (!match) return label
  const [, prefix, number] = match
  const fullName = LABEL_PREFIX_MAP[prefix]
  return fullName ? `${fullName} ${number}` : label
}
