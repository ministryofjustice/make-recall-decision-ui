export const bindPlaceholderValues = (automatedField: string, bindingValues: Record<string, string>): string => {
  return Object.keys(bindingValues).reduce((accumulator: string, currentPlaceholderName: string) => {
    const placeholderPattern = new RegExp(`{{ ${currentPlaceholderName} }}`, 'g')
    return accumulator.replace(placeholderPattern, bindingValues[currentPlaceholderName])
  }, automatedField)
}
