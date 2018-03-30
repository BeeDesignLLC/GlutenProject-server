import {fromEvent} from 'graphcool-lib'
import {getProductImages} from './utils/images'

const query = `
  query($slug: String!) {
    Product(slug:$slug) {
      image
      imageSource
    }
  }
`

export default async event => {
  const api = fromEvent(event).api('simple/v1')

  const {Product: product} = await api.request(query, {slug: event.data.slug})

  return {
    data: getProductImages(product)
  }
}
