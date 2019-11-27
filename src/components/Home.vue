<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/images/user.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="asideWidth">
        <div class="toggle-btn" @click="toggleCollapse">＜＞</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="subItem.id + ''"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <i class="el-icon-menu"></i>
              <span slot="title">{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      isCollapse: false,
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      }
    }
  },
  computed: {
    asideWidth() {
      return this.isCollapse ? '64px' : '200px'
    }
  },
  methods: {
    // 获取菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 点击按钮 切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  },
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  > div {
    display: flex;
    align-items: center;
    font-size: 20px;
    color: #fff;
    img {
      width: 44px;
      margin-right: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .toggle-btn {
    line-height: 30px;
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    text-align: center;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
    .iconfont {
      margin-right: 10px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>
