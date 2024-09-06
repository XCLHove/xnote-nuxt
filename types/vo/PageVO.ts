import type { PageRequestForm } from '~/types/form/PageRequestForm'

export type PageVO<T> = PageRequestForm & {
  total: number
  records: T[]
}
