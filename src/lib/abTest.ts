export function getVariant(testName: string, variants: string[]) {

  const key = "ab_" + testName

  let value = localStorage.getItem(key)

  if (!value) {

    const variant = variants[Math.floor(Math.random() * variants.length)]

    localStorage.setItem(key, variant)

    return variant
  }

  return value
}
