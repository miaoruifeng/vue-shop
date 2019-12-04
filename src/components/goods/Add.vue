<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" :label-position="'top'">
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="tabBeforeLeave"
          @tab-click="handleTabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_value">
                <el-checkbox
                  border
                  size="small"
                  :label="param"
                  v-for="(param, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeader"
              :on-success="handleSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">上传图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button class="btn-add" type="primary" size="small" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img class="preview-img" :src="previewUrl" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    // 商品价格校验规则
    const checkNum = (rule, value, cb) => {
      // const regNum = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/
      const regNum = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
      if (regNum.test(value)) {
        return cb()
      }
      cb(new Error('请输入大于0的数值'))
    }
    // 级联选择器验证规则
    const checkCate = (rule, value, cb) => {
      if (this.addForm.goods_cat.length !== 3) {
        return cb(new Error('请选择商品分类'))
      } else {
        cb()
      }
    }
    return {
      // 设置当前激活的步骤 关联tab切换
      activeIndex: '0',
      // 添加商品表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类
        goods_cat: [],
        // 商品的参数、属性
        attrs: [],
        // 商品的图片数组
        pics: [],
        // 商品详情描述
        goods_introduce: ''
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: checkNum, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkNum, trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
          { validator: checkCate, trigger: ['blur', 'change'] }
        ]
      },
      // 分类列表
      cateList: [],
      // 级联选择器绑定的属性对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品参数
      manyTableData: [],
      // 商品属性
      onlyTableData: [],
      // 上传图片请求路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片设置请求头 tonken
      uploadHeader: {
        Authorization: window.sessionStorage.token
      },
      // 控制图片预览对话框显示隐藏
      previewVisible: false,
      // 图片预览地址
      previewUrl: ''
    }
  },
  computed: {
    catId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 获取分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取分类数据失败!')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 监听 级联选择器选中值改变
    handleChange() {
      console.log(this.addForm.goods_cat)
    },
    // 监听tab切换标签之前的钩子
    tabBeforeLeave(activeName, oldActiveName) {
      // console.log(activeName)
      // console.log(oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类!')
        return false
      }
    },
    // 获取商品参数
    async getManyTableData() {
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes`,
        {
          params: {
            sel: 'many'
          }
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        this.message.error('获取动态参数失败!')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 复制一份attr_value数组 用来渲染当前复选框选中状态，默认全选
        item.attr_value = item.attr_vals
      })
      this.manyTableData = res.data
      console.log(this.manyTableData)
    },
    // 获取商品属性
    async getOnlyTableData() {
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes`,
        {
          params: {
            sel: 'only'
          }
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        this.message.error('获取静态属性失败!')
      }
      // res.data.forEach(item => {
      //   item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      // })
      this.onlyTableData = res.data
    },
    // 监听tab点击事件
    handleTabClick() {
      if (this.activeIndex === '1') {
        this.getManyTableData()
      } else if (this.activeIndex === '2') {
        this.getOnlyTableData()
      }
    },
    // 监听图片上传成功事件
    handleSuccess(response) {
      console.log(response)
      if (response.meta.status !== 200) {
        return this.$message.error('上传图片失败!')
      }
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 监听图片移除事件
    handleRemove(file) {
      console.log(file)
      const picPath = file.response.data.tmp_path
      this.addForm.pics.forEach((item, index) => {
        if (item.pic === picPath) {
          this.addForm.pics.splice(index, 1)
        }
      })
      console.log(this.addForm)
    },
    // 图片预览
    handlePreview(file) {
      console.log(file)
      this.previewUrl = file.response.data.url
      this.previewVisible = true
    },
    // 点击添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // 深拷贝出一个新对象
        const newForm = _.cloneDeep(this.addForm)
        // 处理所属分类 数组转为字符串
        newForm.goods_cat = newForm.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(' ')
          }
          newForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          newForm.attrs.push(newInfo)
        })
        console.log(newForm)
        // 发起添加商品的请求
        const { data: res } = await this.$http.post('goods', newForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 5px 0 !important;
}
.preview-img {
  width: 100%;
}
.btn-add {
  margin-top: 15px;
}
</style>
