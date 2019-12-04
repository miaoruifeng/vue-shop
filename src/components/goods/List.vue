<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="clearInput"
            @keyup.enter.native="searchGoods"
          >
            <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量(kg)" prop="goods_weight" width="95px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog title="修改商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" :label-position="'top'">
        <el-tabs v-model="activeIndex" :tab-position="'left'">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="editForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            商品参数
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_value">
                <el-checkbox
                  border
                  size="small"
                  :label="param"
                  v-for="(param, index) in item.attr_vals"
                  :key="index"
                  :checked="false"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_value"></el-input>
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
              :file-list="editForm.pics"
            >
              <el-button size="small" type="primary">上传图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
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
      const regNum = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
      if (regNum.test(value)) {
        return cb()
      }
      cb(new Error('请输入大于0的数值'))
    }
    return {
      // 表单数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 总共的商品数据
      total: 0,
      // 控制修改商品对话框 显示隐藏
      editDialogVisible: false,
      // 控制tab切换
      activeIndex: '0',
      // 商品ID
      goods_id: null,
      // 修改商品的表单数据
      editForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 当前商品分类
        goods_cat: [],
        // 已经上传的图片列表
        pics: [],
        // 商品详情描述
        goods_introduce: ''
      },
      // 修改商品的表单验证规则
      editFormRules: {
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
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
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
  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表数据失败!')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听每页显示的数量变化
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听当前显示页码变化
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击搜索 获取数据
    searchGoods() {
      this.getGoodsList()
    },
    // 清空搜索框时 触发请求
    clearInput() {
      this.getGoodsList()
    },
    // 获取分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取分类数据失败!')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 点击编辑 展示修改商品信息对话框
    async showEditDialog(goodsId) {
      this.goods_id = goodsId
      // 获取分类数据
      this.getCateList()
      // 根据ID查询商品
      const { data: res } = await this.$http.get(`goods/${goodsId}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败!')
      }
      // 处理商品分类数组
      const catArr = []
      res.data.goods_cat.split(',').forEach(item => {
        item = item - 0
        catArr.push(item)
      })
      // 处理商品参数 和 商品属性
      res.data.attrs.forEach(item => {
        if (item.attr_sel === 'many') {
          this.manyTableData.push(item)
        } else {
          this.onlyTableData.push(item)
        }
      })
      this.manyTableData.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.attr_value = item.attr_value ? item.attr_value.split(' ') : []
      })
      // console.log(this.manyTableData)
      // console.log(this.onlyTableData)
      // 处理商品图片列表
      const picsArr = []
      res.data.pics.forEach(item => {
        const picsInfo = {
          name: item.pics_big,
          url: item.pics_big_url
        }
        picsArr.push(picsInfo)
      })
      this.editForm = {
        goods_name: res.data.goods_name,
        goods_price: res.data.goods_price,
        goods_weight: res.data.goods_weight,
        goods_number: res.data.goods_number,
        goods_introduce: res.data.goods_introduce,
        goods_cat: catArr,
        pics: picsArr
      }
      // console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 监听 级联选择器选中值改变
    handleChange() {
      console.log(this.editForm.goods_cat)
    },
    // 上传图片成功处理函数
    handleSuccess(response) {
      console.log(response)
      if (response.meta.status !== 200) {
        return this.$message.error('上传图片失败!')
      }
      const picInfo = {
        name: response.data.tmp_path,
        url: response.data.url
      }
      this.editForm.pics.push(picInfo)
      console.log(this.editForm)
    },
    // 移除图片处理函数
    handleRemove(file) {
      console.log(file)
      const picUid = file.uid
      this.editForm.pics.forEach((item, index) => {
        if (item.uid === picUid) {
          this.editForm.pics.splice(index, 1)
        }
      })
      console.log(this.editForm)
    },
    // 图片预览处理函数
    handlePreview(file) {
      console.log(file)
      this.previewUrl = file.url
      this.previewVisible = true
    },
    // 监听 修改对话框关闭事件
    editDialogClosed() {
      // 重置表单数据
      this.$refs.editFormRef.resetFields()
      this.activeIndex = '0'
      this.editForm = {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_introduce: '',
        goods_cat: [],
        pics: []
      }
      this.manyTableData = []
      this.onlyTableData = []
    },
    // 点击修改商品信息
    editGoods() {
      console.log(this.editForm)
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // 深拷贝出一个新对象
        const newForm = _.cloneDeep(this.editForm)
        newForm.attrs = []
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
        // 处理上传图片
        const picArr = []
        newForm.pics.forEach(item => {
          if (item.name.indexOf('big_') !== -1) {
            item.name = 'tmp_uploads/' + item.name.split('big_')[1]
          }
          const newPic = {
            pic: item.name
          }
          picArr.push(newPic)
        })
        newForm.pics = picArr
        console.log(newForm)
        // 发起修改商品信息的请求
        const { data: res } = await this.$http.put(
          `goods/${this.goods_id}`,
          newForm
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新商品信息失败!')
        }
        this.$message.success('更新商品信息成功!')
        this.editDialogVisible = false
        this.getGoodsList()
      })
    },
    // editGoods() {
    //   console.log(this.editForm)
    //   this.$refs.editFormRef.validate(async valid => {
    //     if (!valid) return
    //     const { data: res } = await this.$http.put(
    //       `goods/${this.goods_id}`,
    //       this.editForm
    //     )
    //     console.log(res)
    //     if (res.meta.status !== 200) {
    //       return this.$message.error('更新商品信息失败!')
    //     }
    //     this.$message.success('更新商品信息成功!')
    //     this.editDialogVisible = false
    //     this.getGoodsList()
    //   })
    // },
    // 根据商品ID 删除商品
    async removeGoodsById(goodsId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }

      const { data: res } = await this.$http.delete(`goods/${goodsId}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败!')
      }
      this.$message.success('删除商品成功!')
      this.getGoodsList()
    },
    // 点击添加商品 跳转到添加商品页
    goAddGoods() {
      this.$router.push('/goods/add')
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 12px;
}
.el-checkbox {
  margin: 0 10px 5px 0 !important;
}
.preview-img {
  width: 100%;
}
</style>
