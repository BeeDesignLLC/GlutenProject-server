import {fromEvent} from 'graphcool-lib'
import imgix from './utils/imgix'

const query = `
  query($slug: String!) {
    Product(slug:$slug) {
      image
      amazonImage
    }
  }
`

export default async event => {
  const api = fromEvent(event).api('simple/v1')

  const {Product: {image, amazonImage}} = await api.request(query, {slug: event.data.slug})

  return {
    data: {
      dpr1: imgix(image, {
        auto: 'format',
        w: 500,
        h: 500,
      }),
      dpr2: imgix(image, {
        auto: 'format',
        w: 500,
        h: 500,
        dpr: 2,
        q: 50,
      }),
      dpr3: imgix(image, {
        auto: 'format',
        w: 500,
        h: 500,
        dpr: 3,
        q: 40,
      }),
      dpr4: imgix(image, {
        auto: 'format',
        w: 500,
        h: 500,
        dpr: 4,
        q: 30,
      }),
      amazon: amazonImage,
    }
  }
}
