import {
  Config,
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'

export const formatValue = (value: number, currency?: string): string =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value)

export const handleGenerateName = (length: number = 4): string => {
  const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 })

  const nameConfig: Config = {
    dictionaries: [['dFlow'], adjectives, animals, numberDictionary],
    separator: '-',
    length,
    style: 'lowerCase',
  }

  return uniqueNamesGenerator(nameConfig)
}
