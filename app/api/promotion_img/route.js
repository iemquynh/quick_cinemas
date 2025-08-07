import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import User from '@/models/User'
import { connectToDatabase } from '../../../lib/mongodb';
import { getAuth } from '@/utils/auth' // ✅

export async function POST(req) {
  await connectToDatabase()

  const formData = await req.formData()
  const files = formData.getAll('files')

  // ✅ Lấy userId từ token JWT
  const auth = await getAuth(req)
  if (!auth || auth.role !== 'theater_admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
  }
  const userId = auth.userId

  const user = await User.findById(userId)
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads')
  await mkdir(uploadDir, { recursive: true })

  const newUrls = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)
    const url = `/uploads/${filename}`
    newUrls.push(url)
  }

  user.promotion_images.push(...newUrls)
  await user.save()

  return new Response(JSON.stringify({ message: 'Success', newUrls }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
