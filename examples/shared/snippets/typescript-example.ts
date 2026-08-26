export const typescriptExample = `type Token = {
  value: string
  color?: string
}

export function renderTokens(lines: Token[][]): string {
  return lines
    .map(line => line.map(token => token.value).join(''))
    .join('\\n')
}

const sample: Token[][] = [
  [{ value: 'const', color: '#ff79c6' }, { value: ' answer', color: '#f8f8f2' }],
  [{ value: ' = ', color: '#f8f8f2' }, { value: '42', color: '#bd93f9' }],
]

console.log(renderTokens(sample))
`
