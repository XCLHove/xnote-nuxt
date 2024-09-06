<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { ElMenuItem, ElSubMenu } from 'element-plus'

type MenuItem = {
  label: string
  path: string
  children: Map<string, MenuItem>
}

const cacheMap: Map<string, MenuItem>[] = [new Map<string, MenuItem>()]

Object.entries(
  import.meta.glob('../menus/**/*.ts', {
    eager: true,
    import: 'default',
  }),
).map(([currentPath, _menuInfo]) => {
  const menuInfo = _menuInfo as ReturnType<typeof defineMenu>

  currentPath = currentPath.replace(/^\.\.\/menus(.*)\.ts$/, '$1')
  currentPath = currentPath.replace(/[0-9]+\./, '')

  const needMapNumber = currentPath.split('/').length - 1
  if (needMapNumber >= cacheMap.length) {
    for (let i = cacheMap.length; i < needMapNumber; i++) {
      cacheMap.push(new Map<string, MenuItem>())
    }
  }

  let currentMenuItem: MenuItem = {
    label: menuInfo.label,
    path:
      menuInfo?.path || currentPath.replaceAll('index', '').replace(/\/+/, '/'),
    children: new Map<string, MenuItem>(),
  }
  let parentPath =
    menuInfo?.parentPath ||
    currentPath.substring(0, currentPath.lastIndexOf('/'))
  if (!parentPath) {
    cacheMap[0].set(currentPath, currentMenuItem)
    return
  }

  for (
    let parentMapIndex = parentPath.split('/').length - 2;
    parentMapIndex >= 0;
    parentMapIndex--
  ) {
    const parentMenuItem = cacheMap[parentMapIndex].get(parentPath)
    if (!parentMenuItem) {
      if (parentMapIndex === 0) {
        cacheMap[0].set(currentPath, currentMenuItem)
        break
      }
      parentPath = parentPath.substring(0, parentPath.lastIndexOf('/'))
      continue
    }
    parentMenuItem.children.set(currentMenuItem.path, currentMenuItem)
    cacheMap[parentMapIndex].set(parentPath, parentMenuItem)
    cacheMap[parentMapIndex + 1].set(currentPath, currentMenuItem)
    currentMenuItem = parentMenuItem

    currentPath = parentPath
    parentPath = parentMenuItem.path.substring(
      0,
      parentMenuItem.path.lastIndexOf('/'),
    )
  }
})

const getMenus = (childrenMap: Map<string, MenuItem>) => {
  const children: Menu[] = []
  childrenMap.forEach((menuItem) => {
    const menu: Menu = {
      label: menuItem.label,
      path: menuItem.path,
      children: getMenus(menuItem.children),
    }
    children.push(menu)
  })
  return children
}

type Menu = {
  label: string
  path: string
  children: Menu[]
}
const menus = ref<Menu[]>(getMenus(cacheMap[0]))

const renderMenu = (menu: Menu) => {
  if (!menu.children?.length) {
    return h(ElMenuItem, { index: menu.path }, () => menu.label)
  }

  return h(
    ElSubMenu,
    { index: menu.path },
    {
      title: () => menu.label,
      default: () => menu.children.map((item) => renderMenu(item)),
    },
  )
}

const activeMenu = ref(useRequestURL().pathname)
onMounted(() => {
  const interval = setInterval(() => {
    activeMenu.value = useRequestURL().pathname
  }, 1000)
  onBeforeUnmount(() => {
    clearInterval(interval)
  })
})
</script>

<template>
  <div class="menu">
    <el-menu router :default-active="activeMenu">
      <component
        :is="renderMenu(menu)"
        v-for="(menu, index) in menus"
        :key="index"
      />
    </el-menu>
  </div>
</template>

<style scoped lang="less">
.menu {
  height: 100%;

  .el-menu {
    border: none;
  }
}
</style>
