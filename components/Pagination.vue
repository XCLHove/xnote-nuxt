<script setup lang="ts">
/**
 * 页码
 */
const currentPage = defineModel('currentPage', {
  default: 1,
  type: Number,
})
/**
 * 每页大小
 */
const pageSize = defineModel('pageSize', {
  default: 10,
  type: Number,
})
/**
 * 总数
 */
const total = defineModel('total', {
  default: 0,
  type: Number,
})
/**
 * 禁用
 */
const disabled = defineModel('disabled', {
  default: false,
  type: Boolean,
})

const layout = (() => {
  if (DeviceUtil.isMobile()) {
    return 'sizes, prev, slot, next, jumper'
  }

  return 'sizes, prev, slot, next, jumper'
})()
const sizes = (() => {
  let _sizes = [10, 20, 50, 100]
  if (import.meta.env.DEV) {
    _sizes = [1, 2, 3, 4, 5, ..._sizes]
  }
  return _sizes
})()
const size = (() => {
  if (DeviceUtil.isMobile()) {
    return 'small'
  }

  return 'default'
})()
const pages = computed(() => {
  return total.value === 0 ? 1 : Math.ceil(total.value / pageSize.value)
})

const emit = defineEmits(['change'])
</script>

<template>
  <div class="pagination-box">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="sizes"
      :layout="layout"
      :total="total"
      background
      :size="size"
      :disabled="disabled"
      @change="emit('change')"
    >
      <el-text>{{ currentPage }} / {{ pages }}</el-text>
    </el-pagination>
  </div>
</template>

<style scoped lang="less">
.pagination-box {
  position: absolute;
  bottom: 0;
  margin-left: 10px;
  margin-bottom: 10px;
}
</style>
