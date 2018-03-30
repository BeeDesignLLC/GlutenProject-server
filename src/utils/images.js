import imgix from './imgix'

export const getThumbnails = product => getImages(product, 300)

export const getProductImages = product => getImages(product, 500)

export const getImages = (product, size) => {
  const images = {
    dpr1: null,
    dpr2: null,
    dpr3: null,
    dpr4: null,
  }

  if (product.imageSource === 'amazon') {
    images.dpr1 = product.image
    images.dpr2 = product.image
    images.dpr3 = product.image
    images.dpr4 = product.image
  } else {
    images.dpr1 = imgix(product.image, {auto: 'format', w: size, h: size})
    images.dpr2 = imgix(product.image, {
      auto: 'format',
      w: size,
      h: size,
      dpr: 2,
      q: 50,
    })
    images.dpr3 = imgix(product.image, {
      auto: 'format',
      w: size,
      h: size,
      dpr: 3,
      q: 40,
    })
    images.dpr4 = imgix(product.image, {
      auto: 'format',
      w: size,
      h: size,
      dpr: 4,
      q: 30,
    })
  }

  return images
}

