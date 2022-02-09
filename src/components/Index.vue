<template>
  <div id="app">
    <el-container class="index-container">
      <!-- 头部 -->
      <el-header>
        <!-- 左边 -->
        <div>
          <img src="../assets/logo.png" alt="" class="logo">
          <span>商品交易系统</span>
        </div>
        <!-- 退出 -->
        <el-button  type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 左导航栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button el-icon-s-fold" @click="toggleCollapse" v-show="!isCollapse"></div>
          <div class="toggle-button el-icon-s-unfold" @click="toggleCollapse" v-show="isCollapse"></div>
          <!-- 侧边栏菜单 -->
          <el-menu
            :default-active="activePath"
            class="el-menu-vertical-demo"
            background-color="#333745"
            text-color="#fff"
            active-text-color="#ffd04b"
            router
            :collapse = isCollapse
            unique-opened
            >
            <!-- 一级菜单的模板区域 -->
            <el-submenu :index="item.id+''" v-for='item in menulist' :key="item.id">
              <template slot="title">
                <i :class="item.icon"></i>
                <span>{{item.name}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                  <template slot="title">
                    <i :class="subItem.icon"></i>
                    <span>{{subItem.name}}</span>
                  </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

export default {
  data () {
    return {
      isCollapse: false,
      // 左侧导航栏数据
      menulist: [],
      // 当前激活的链接
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出
    async logout () {
      var confirmText = await this.$confirm('此操作退出登录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmText !== 'confirm') {
        return this.$message.info('以取消退出')
      }
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message.success('退出成功')
    },

    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 获取所有菜单
    async getMenuList () {
      const data = await this.$http.post('api/Menu/list')
      if (data.status !== 200) return this.message.error(data.data.msg)
      this.menulist = data.data.data
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>
<style lang="less" scoped>
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    background-color: #333745;
  }
  .index-container {
    height: 100%;
  }
  .index-container .el-header {
    display: flex;
    padding-left: 0;
    justify-content:space-between;
    align-items: center;
    background-color: #373d41;
    color: #fff;
  }
  .el-header div {
    display: flex;
    height: 100%;
    align-items: center;
    .logo {
      height: 100%;
    }
    .el-button {
      height: 40px;
    }
  }

  .el-header div>span {
    text-align: center;
    font-weight: 700;
    margin-left: 10px;
    font-size: 25px;
  }

  .el-container {
    overflow: auto;
  }
  .el-aside {
    transition: 0.3s;
    background-color: #333745;
    color: #333;
    .el-menu {
      border-right: none;
      .el-menu-item {
        background-color: rgba(0, 0, 0, 0.3)!important;
      }
    }
    .toggle-button {
      display: flex;
      width: 100%;
      height: 30px;
      line-height: 30px;
      justify-content: center;
      background-color: #4a5064;
      font-size: 25px;
      color: #fff;
    }
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
  }

</style>