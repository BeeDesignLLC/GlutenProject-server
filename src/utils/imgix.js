const ImgixClient = require('imgix-core-js')

const imgix = new ImgixClient({
  host: 'tgp.imgix.net',
  secureURLToken: process.env.IMGIX_TOKEN,
})

const imageUrl = (...args) => {
  if (typeof args[0] === 'string') {
    return imgix.buildURL.apply(imgix, args)
  } else {
    return null
  }
}

export default imageUrl
