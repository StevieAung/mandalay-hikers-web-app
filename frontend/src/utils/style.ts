import type { CssVars } from '../types'

export const bgStyle = (image: string): CssVars => ({ '--bg': `url(${image})` })
