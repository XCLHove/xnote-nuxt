import type { LayoutKey } from '#build/types/layouts'

const layout = (() => {
  let _layout: LayoutKey = 'default'

  if (DeviceUtil.isMobile()) {
    _layout = 'mobile'
  }

  return () => _layout
})()

export default {
  layout,
}
