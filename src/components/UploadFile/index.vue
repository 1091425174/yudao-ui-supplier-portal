<template>
  <div class="upload-file">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="true"
      :before-upload="beforeUpload"
      :http-request="httpRequest"
      :limit="limit"
      :multiple="limit > 1"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :show-file-list="true"
    >
      <el-button type="primary">选取文件</el-button>
      <template v-if="isShowTip" #tip>
        <div class="upload-tip">大小不超过 {{ fileSize }}MB，格式：{{ fileType.join('/') }}</div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { updateFile, getUploadUrl } from '@/api/infra/file'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    fileType?: string[]
    fileSize?: number
    limit?: number
    isShowTip?: boolean
  }>(),
  {
    modelValue: '',
    fileType: () => ['doc', 'xls', 'ppt', 'txt', 'pdf', 'jpg', 'png'],
    fileSize: 10,
    limit: 5,
    isShowTip: true
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const uploadUrl = getUploadUrl()
const fileList = ref<UploadUserFile[]>([])
const pendingCount = ref(0)
const uploadedUrls = ref<string[]>([])

const syncFromModel = (val?: string) => {
  if (!val) {
    fileList.value = []
    uploadedUrls.value = []
    return
  }
  uploadedUrls.value = val.split(',').filter(Boolean)
  fileList.value = uploadedUrls.value.map((url: string) => ({
    name: url.substring(url.lastIndexOf('/') + 1),
    url
  }))
}

watch(() => props.modelValue, syncFromModel, { immediate: true })

const emitValue = () => {
  emit('update:modelValue', uploadedUrls.value.join(','))
}

const beforeUpload: UploadProps['beforeUpload'] = (file: UploadRawFile) => {
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : ''
  const okType = props.fileType.some((t) => file.type.includes(t) || ext === t)
  if (!okType) {
    ElMessage.error(`请上传 ${props.fileType.join('/')} 格式文件`)
    return false
  }
  if (file.size > props.fileSize * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${props.fileSize}MB`)
    return false
  }
  pendingCount.value++
  return true
}

const httpRequest: UploadProps['httpRequest'] = async (options) => {
  const res: any = await updateFile({ file: options.file as File })
  if (res.code !== 0) {
    throw new Error(res.msg || '上传失败')
  }
  return res
}

const handleSuccess: UploadProps['onSuccess'] = (res: any) => {
  pendingCount.value = Math.max(0, pendingCount.value - 1)
  if (res?.data) {
    uploadedUrls.value.push(res.data)
    emitValue()
  }
}

const handleRemove: UploadProps['onRemove'] = (file) => {
  const url = file.url || (file.response as any)?.data
  if (url) {
    uploadedUrls.value = uploadedUrls.value.filter((item: string) => item !== url)
    emitValue()
  }
}

const handleExceed = () => ElMessage.error(`最多上传 ${props.limit} 个文件`)
const handleError = () => {
  pendingCount.value = Math.max(0, pendingCount.value - 1)
  ElMessage.error('上传失败，请重试')
}
</script>

<style scoped>
.upload-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}
</style>
