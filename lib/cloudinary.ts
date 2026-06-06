import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadBuffer(buffer: Buffer, filename: string) {
  // ensure credentials
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are missing')
  }

  // convert to data URI
  const base64 = buffer.toString('base64')
  const dataUri = `data:application/octet-stream;base64,${base64}`

  const res = await cloudinary.uploader.upload(dataUri, {
    folder: 'chronolux/products',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    resource_type: 'image',
  })

  return { url: res.secure_url, publicId: res.public_id }
}

export async function deleteByPublicId(publicId: string) {
  try{
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    return true
  }catch(err){
    console.error('Cloudinary delete failed', err)
    return false
  }
}

export default cloudinary
