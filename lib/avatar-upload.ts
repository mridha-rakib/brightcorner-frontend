const MAX_AVATAR_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_AVATAR_DIMENSION = 640
const MIN_AVATAR_DIMENSION = 256
const TARGET_AVATAR_DATA_URL_LENGTH = 350_000

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to process the selected image.'))
    }

    image.src = objectUrl
  })
}

export async function compressAvatarImage(file: File): Promise<string> {
  if (file.size > MAX_AVATAR_FILE_SIZE_BYTES)
    throw new Error('Please choose an image that is 10 MB or smaller.')

  const image = await loadImageFromFile(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context)
    throw new Error('Image processing is not available in this browser.')

  const largestSide = Math.max(image.width, image.height)
  let currentDimension = Math.min(MAX_AVATAR_DIMENSION, largestSide)
  let quality = 0.82

  while (currentDimension >= MIN_AVATAR_DIMENSION) {
    const scale = currentDimension / largestSide
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    let dataUrl = canvas.toDataURL('image/webp', quality)

    while (dataUrl.length > TARGET_AVATAR_DATA_URL_LENGTH && quality > 0.45) {
      quality = Number((quality - 0.08).toFixed(2))
      dataUrl = canvas.toDataURL('image/webp', quality)
    }

    if (dataUrl.length <= TARGET_AVATAR_DATA_URL_LENGTH)
      return dataUrl

    currentDimension = Math.floor(currentDimension * 0.82)
    quality = 0.82
  }

  throw new Error('Please choose a smaller image. Large photos must be compressed before upload.')
}
