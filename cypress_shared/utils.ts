export const exactMatchIgnoreWhitespace = (str: string): RegExp => new RegExp(`^\\s*${str}\\s*$`, 'g')
