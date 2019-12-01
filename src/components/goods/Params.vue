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
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数-属性 对话框 -->
    <el-dialog
      :title="'添加' + textTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'修改' + textTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
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
      onlyTableData: [],
      // 控制添加参数对话框显示隐藏
      addDialogVisible: false,
      // 添加参数的表单数据绑定
      addForm: {
        attr_name: ''
      },
      // 添加参数表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入分类参数', trigger: 'blur' }
        ]
      },
      // 控制修改参数对话框显示隐藏
      editDialogVisible: false,
      // 修改参数表单数据绑定
      editForm: {
        attr_name: '',
        attr_id: null
      },
      // 修改参数表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入分类参数', trigger: 'blur' }
        ]
      }
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
    // 当前选中的三级分类的id
    catId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算对话框的标题
    textTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
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
    },
    // 点击添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.catId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败!')
        }
        this.$message.success('添加参数成功!')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 监听添加参数对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 显示修改参数对话框
    showEditDialog(paramsInfo) {
      console.log(paramsInfo)
      this.editForm.attr_name = paramsInfo.attr_name
      this.editForm.attr_id = paramsInfo.attr_id
      this.editDialogVisible = true
    },
    // 监听修改参数对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.catId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error('修改参数失败!')
        }
        this.$message.success('修改参数成功!')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 根据参数id 删除对应参数
    async deleteParamsById(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除参数')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.catId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
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
