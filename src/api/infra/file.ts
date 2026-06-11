import request from '@/config/axios'

export const updateFile = (data: { file: File; directory?: string }) => {
  const formData = new FormData()
  formData.append('file', data.file)
  if (data.directory) {
    formData.append('directory', data.directory)
  }
  return request.upload({ url: '/infra/file/upload', data: formData })
}

export const getUploadUrl = () => {
  return import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/infra/file/upload'
}
