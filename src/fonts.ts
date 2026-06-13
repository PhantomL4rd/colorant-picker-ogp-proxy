import fontData from './assets/mplus-rounded-bold-subset.ttf'

type FontSpec = {
  name: string
  data: ArrayBuffer
  weight: 700
  style: 'normal'
}

const FONTS: FontSpec[] = [
  {
    name: 'M PLUS Rounded 1c',
    data: fontData,
    weight: 700,
    style: 'normal',
  },
]

export const loadFonts = (): FontSpec[] => FONTS
