<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户中心</el-breadcrumb-item>
          <el-breadcrumb-item>地址列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card class="box-card" >
            <!-- 查询区域 -->
            <el-form :inline="true">
                <el-form-item label="用户名:">
                    <el-input placeholder="输入用户名" v-model="queryInfo.username"></el-input>
                </el-form-item>
                <el-form-item label="收件人:">
                    <el-input placeholder="收件人"  v-model="queryInfo.receiver"></el-input>
                </el-form-item>
                <el-form-item label="电话:">
                    <el-input placeholder="电话"  v-model="queryInfo.phone"></el-input>
                </el-form-item>
                <el-form-item label="详细地址:">
                    <el-input placeholder="详细地址"  v-model="queryInfo.address"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="query">查询</el-button>
                </el-form-item>
            </el-form>
            <!-- 表格数据区域 -->
            <el-table :data="addresslist" border style="width: 100%" v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading">
                <el-table-column prop="id" label="" width="60"></el-table-column>
                <el-table-column prop="username" label="用户名" min-width="100"></el-table-column>
                <el-table-column prop="receiver" label="收件人" min-width="100"></el-table-column>
                <el-table-column prop="phone" label="收货人电话" width="120"></el-table-column>
                <el-table-column prop="region" label="地区" min-width="180"></el-table-column>
                <el-table-column prop="address" label="详细地址" min-width="180"></el-table-column>
                <el-table-column label="是否是默认地址" width="120">
                  <template slot-scope="scope">
                    <el-switch v-model="scope.row.is_default" :active-value="1" :inactive-value="0" active-text="是" inactive-text="否" @change="isDefaultChange(scope.row.id)"></el-switch>
                  </template>
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="160"></el-table-column>
                <el-table-column  label="操作" width="160">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
                           <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)"></el-button>
                       </el-tooltip>
                       <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                           <el-button type="danger" icon="el-icon-delete" size="mini" @click="del(scope.row.id)"></el-button>
                       </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
             <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

        </el-card>

        <!-- 编辑 对话框 -->
        <el-dialog title="编辑框" :visible.sync="editdialogVisible" width="30%" @close="handleClose" style="margin-top: 5vh">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
            <el-form-item label="收件人:" prop="receiver">
              <el-input v-model="editForm.receiver"></el-input>
            </el-form-item>
            <el-form-item label="收货人电话:" prop="phone">
              <el-input v-model="editForm.phone"></el-input>
            </el-form-item>
            <el-form-item label="地区:" prop="region">
              <!-- 地区级联选择器 -->
              <el-cascader :options="options" size="medium" v-model="selectedOptions" :props="{ expandTrigger: 'hover' }" @change="handleChange"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址:" prop="address">
              <el-input v-model="editForm.address"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editdialog">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
// 地区级联选择器
import { regionData, CodeToText, TextToCode } from 'element-china-area-data'

export default {
  data () {
    // 验证手机号的规则
    var checkPhone = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      loading: false,
      // 地区选择器 省市区 级联选择器
      options: regionData,
      selectedOptions: [],
      // 表格数据
      addresslist: [],
      // 编辑数据
      editForm: {},
      queryInfo: {
        username: '',
        receiver: '',
        address: '',
        phone: '',
        // 每页多少条
        pageSize: 10,
        // 当前页
        page: 1
      },
      total: 0,
      editdialogVisible: false,
      // 表达验证
      editFormRules: {
        receiver: [
          { required: true, message: '请输入收件名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        region: [
          { required: true, message: '选择地区', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getAddressList()
  },
  methods: {
    async getAddressList () {
      this.loading = true
      const res = await this.$http.post('/api/Address/list', this.queryInfo)
      if (res.status !== 200) {
        return this.$message.error('更新失败')
      }
      this.addresslist = res.data.data.data
      this.total = res.data.data.count
      this.loading = false
    },
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getAddressList()
    },
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getAddressList()
    },
    // 点击查询
    query () {
      this.getAddressList()
    },
    // 编辑
    async edit (id) {
      const res = await this.$http.post('/api/Address/query', { id: id })
      if (res.status !== 200) {
        return this.$message.error('获取编辑数据失败')
      }
      this.editForm = res.data.data
      var arr = this.editForm.region.split('-')
      if (arr.length === 3) {
        this.selectedOptions = [TextToCode[arr[0]].code, TextToCode[arr[0]][arr[1]].code, TextToCode[arr[0]][arr[1]][arr[2]].code]
      } else if (arr.length === 2) {
        this.selectedOptions = [TextToCode[arr[0]].code, TextToCode[arr[0]][arr[1]].code]
      }
      this.editdialogVisible = true
    },
    // 编辑框的确定按钮
    editdialog () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$http.post('/api/Address/edit', this.editForm)
        if (res.status !== 200) return this.$message.error('b编辑数据失败')
        this.$message.success('修改数据成功')
        this.editdialogVisible = false
        this.getAddressList()
      })
    },
    // 地区级联选择器变化时
    handleChange (value) {
      this.selectedOptions = value
      console.log(this.selectedOptions)
      var name = ''
      for (var i = 0; i < this.selectedOptions.length; i++) {
        if (i === this.selectedOptions.length - 1) {
          name += CodeToText[this.selectedOptions[i]]
        } else {
          name += CodeToText[this.selectedOptions[i]] + '-'
        }
      }// 将省市区三个拼接一起
      this.editForm.region = name
    },

    // 编辑框关闭时触发
    handleClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 删除
    async del (id) {
      // 提示框
      const confirmDel = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 加载开
      this.loading = true
      if (confirmDel !== 'confirm') {
        this.loading = false
        return this.$message('已取消删除')
      }
      const res = await this.$http.post('/api/Address/del', { id: id })
      if (res.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getAddressList()
    },
    // 是否默认开关 发生变化时
    async isDefaultChange (id) {
      this.loading = true
      const res = await this.$http.post('/api/Address/updateIsDefault', { id: id })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('修改默认地址失败')
      }
      if (res.data.code === 1) {
        this.loading = false
        this.$message.warning(res.data.msg)
      } else if (res.data.code === 0) {
        this.$message.success(res.data.data)
      }
      return this.getAddressList()
    }
  }
}
</script>

<style lang="less" scoped>
.box-card .el-form .el-form-item {
    margin-right: 20px;
}
.el-cascader-panel {
  height: 300px;
}

</style>