<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="row">
        <el-col>
          <span class="cas-text">选择商品分类：</span>
          <el-cascader
            :options="cateList"
            :props="cascaderProps"
            v-model="selectedCateKeys"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表数据
      cateList: [],
      // 级联选择器绑定数据对象
      cascaderProps: {
        expandTrigger: 'hover',
        // 可以选择任意一级数据
        // checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中分类的id数组
      selectedCateKeys: [],
      // tab 选项卡当前选中项
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: []
    }
  },
  computed: {
    // 添加按钮是否禁止点击
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    catId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败!')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 监听 级联选择器 改变事件
    async handleChange() {
      console.log(this.selectedCateKeys)
      this.getParamsData()
    },
    // 点击tab选项卡切换
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData() {
      // if (this.selectedCateKeys.length !== 3) {
      //   this.selectedCateKeys = []
      //   // return
      // }
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes`,
        { params: { sel: this.activeName } }
      )
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.row {
  margin-top: 20px;
  margin-bottom: 15px;
}
.cas-text {
  font-size: 14px;
  margin-right: 5px;
}
.el-cascader {
  width: 300px;
}
</style>
