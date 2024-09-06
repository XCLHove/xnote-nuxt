import { addNoteTypeApi, updateNoteTypeApi } from '~/apis/noteTypeApi'
import type { NoteTypeUpdateForm } from '~/types/form/noteType/NoteTypeUpdateForm'

const add = (inputValue = '') => {
  return new Promise<void>((resolve, reject) => {
    ElMessageBox.prompt('', '添加笔记类型', {
      inputValue: inputValue,
      inputPlaceholder: '请输入笔记类型名称',
      inputPattern: /^\S{1,10}$/,
      inputErrorMessage: '类型名称只能为1-10位的非空字符',
    })
      .then(({ value }) => {
        addNoteTypeApi({
          name: value,
        })
          .then(() => {
            ElMessage.success('添加成功')
            resolve()
          })
          .catch(() => {
            add(value)
          })
      })
      .catch((reason: 'cancel' | 'close') => {
        reject(reason)
      })
  })
}

const update = (form: NoteTypeUpdateForm) => {
  return new Promise<void>((resolve, reject) => {
    ElMessageBox.prompt('', '添加笔记类型', {
      inputValue: form.name,
      inputPlaceholder: '请输入笔记类型名称',
      inputPattern: /^\S{1,10}$/,
      inputErrorMessage: '类型名称只能为1-10位的非空字符',
    })
      .then(({ value }) => {
        form.name = value

        updateNoteTypeApi(form)
          .then(() => {
            ElMessage.success('修改成功')
            resolve()
          })
          .catch(() => {
            update(form)
          })
      })
      .catch((reason: 'cancel' | 'close') => {
        reject(reason)
      })
  })
}

export default {
  add,
  update,
}
