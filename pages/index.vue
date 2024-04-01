<script setup lang="ts">
import type { Ref } from "vue";
import type { User } from "~/interfaces/entity/User";
import { userLogout } from "~/api/UserApi";
import LocalStorageKey from "~/enums/LocalStorageKey";

const storeShowUserLogin = useShowUserLogin();
const storeShowUserRegister = useShowUserRegister();
const storeUser = useUser();

const showDrawerMenu = ref(false);

const { value: user }: { value: Ref<User | null> } = storeToRefs(storeUser);
const avatarContent = computed(() => {
  return user.value?.name.substring(0, 1) || "登录";
});

const { width: windowWidth } = useWindowSize();
const showAsideMenu = computed(() => {
  return windowWidth.value > 450;
});

/**用户登出*/
const logout = () => {
  userLogout().then((res) => {
    elPrompt.success(res.message);
    localStorage.removeItem(LocalStorageKey.TOKEN);
  });
};
</script>

<template>
  <Login />
  <Register />
  <div class="layout">
    <el-container>
      <!--头部-->
      <el-header>
        <client-only>
          <div class="head">
            <i
              class="menu-button iconfont icon-menu"
              v-if="!showAsideMenu"
              @click="showDrawerMenu = true"
            />
            <h1>XNote</h1>
            <div class="avatar">
              <el-dropdown>
                <el-avatar>
                  <div>{{ avatarContent }}</div>
                </el-avatar>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-if="!user"
                      @click="storeShowUserLogin.show()"
                      >登录</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="!user"
                      @click="storeShowUserRegister.show()"
                      >注册</el-dropdown-item
                    >
                    <el-dropdown-item v-if="user" @click="logout"
                      >注销</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </client-only>
      </el-header>
      <el-container>
        <!--菜单-->
        <client-only>
          <div class="menu">
            <!--宽屏-->
            <div class="aside" v-if="showAsideMenu">
              <el-aside>
                <Menu />
              </el-aside>
            </div>
            <!--窄屏-->
            <div class="drawer" v-else>
              <el-drawer
                v-model="showDrawerMenu"
                title="菜单"
                size="150"
                direction="ltr"
              >
                <Menu />
              </el-drawer>
            </div>
          </div>
        </client-only>
        <!--main-->
        <el-main>
          <el-scrollbar>
            <div class="view">
              <RouterView />
            </div>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
    <!--footer-->
    <Footer />
  </div>
</template>

<style scoped lang="less">
.layout {
  width: 100%;
  height: 100%;

  .el-container {
    width: 100%;
    height: 100%;

    .el-header {
      border-bottom: @color-lightGray 1px solid;

      .head {
        .flex();
        align-items: center;

        .menu-button {
          margin-right: 10px;

          &:hover {
            transition: color linear 0.2s;
          }
        }

        h1 {
          margin: 15px 0;
        }

        .avatar {
          font-size: 25px;
          position: absolute;
          right: 15px;
        }
      }
    }

    .el-container {
      .menu {
        .aside {
          width: 120px;
          height: calc(100vh - 90px);
          border-right: @color-lightGray solid 1px;

          .el-aside {
            width: 100%;
          }
        }
      }

      .el-main {
        .el-scrollbar {
          height: calc(100vh - 120px);

          .view {
            width: 99%;
          }
        }
      }
    }
  }
}
</style>
