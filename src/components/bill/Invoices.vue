<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }" :replace='true'>首页</el-breadcrumb-item>
      <el-breadcrumb-item>账单管理</el-breadcrumb-item>
      <el-breadcrumb-item>发票管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 查询 -->
          <el-form :model="queryInfo" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="5"  style="min-width:250px">
                <el-form-item label="用户名称:">
                  <el-input v-model="queryInfo.username"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="5">
                <el-form-item label="状态:">
                  <el-select v-model="queryInfo.status" placeholder="请选择状态" >
                    <el-option label="全部" value=""></el-option>
                    <el-option label="已拒绝" value="0"></el-option>
                    <el-option label="待处理" value="1"></el-option>
                    <el-option label="已确定" value="2"></el-option>
                    <el-option label="已取消" value="3"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="4" >
                <el-form-item>
                   <el-button type="primary" @click="getInvoiceLite">查询</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

           <!-- 表格 -->
          <el-table :data="invoicelist" border style="width: 100%" v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading" header-align>
            <el-table-column prop="id" label="编号" width="60" header-align></el-table-column>
            <el-table-column prop="username" label="用户名" header-align></el-table-column>
            <el-table-column prop="invoice_amount" label="开票金额"></el-table-column>
            <el-table-column prop="name" label="处理人员"></el-table-column>
            <el-table-column label="状态" width="90">
              <template slot-scope="scope">
                  <el-tag v-if='scope.row.status == 2'>已确定</el-tag>
                  <el-tag v-if='scope.row.status == 1' type="warning">待处理</el-tag>
                  <el-tag v-if='scope.row.status == 0' type="danger">已拒绝</el-tag>
                  <el-tag v-if='scope.row.status == 3' type="info">已取消</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="handle_time" label="处理时间" width="180"></el-table-column>
            <el-table-column label="操作" width="240">
              <template slot-scope="scope">
                   <div v-if='scope.row.status === 1'>
                       <el-button type="primary" size="mini" @click="determine(scope.row.id)" class="btn">确定开取发票</el-button>
                       <el-button type="danger" size="mini" @click="refuse(scope.row.id)">拒绝开取发票</el-button>
                   </div>
              </template>
            </el-table-column>
          </el-table>

           <!-- 分页 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
    </el-card>

    <el-dialog title="拒绝开取发票" :visible.sync="refuseDialogVisible" width="30%" @close="invoiceClose">
      <el-form :model="invoiceForm" :rules="invoiceRules" ref="invoiceFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="拒绝原因：" prop="cause">
          <el-input v-model="invoiceForm.cause"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="refuseDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="invoiceDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      queryInfo: {
        username: '',
        status: '',
        pageSize: 10,
        page: 1
      },
      // 表格列表
      invoicelist: [],
      // 总数
      total: 0,
      // 拒绝开取发票的对话框
      refuseDialogVisible: false,
      // 拒绝开取发票的对话框表单
      invoiceForm: {},
      invoiceRules: {
        cause: [
          { required: true, message: '请输入拒绝原因', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    console.log(this)
    this.getInvoiceLite()
  },
  methods: {
    async getInvoiceLite () {
      this.loading = true
      const res = await this.$http.post('/api/Invoice/list', this.queryInfo)
      this.loading = false
      if (res.status !== 200) return this.$message.error('更新数据失败')
      this.total = res.data.data.total
      this.invoicelist = res.data.data.data
    },
    // 监听一页有多少数据
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getInvoiceLite()
    },
    // 监听当前页面数
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getInvoiceLite()
    },
    // 确定开取发票
    async determine (id) {
      const confirm = await this.$confirm('此操作将确定开取发票, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message('已取消')
      this.loading = true
      const res = await this.$http.post('/api/Invoice/determine', { id: id })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('开取发票失败')
      }
      console.log(res.data)
      if (res.data.code !== 0) {
        this.loading = false
        return this.$message.error(res.data.msg)
      }
      this.loading = false
      this.getInvoiceLite()
      return this.$message.success(res.data.data)
    },
    // 拒绝开取发票
    async refuse (id) {
      this.refuseDialogVisible = true
      const res = await this.$http.post('/api/Invoice/query', { id: id })
      if (res.status !== 200) return this.$message.error('获取数据失败')
      this.invoiceForm = res.data.data
    },
    // 拒绝开取发票确定时触发
    invoiceDialog () {
      this.$refs.invoiceFormRef.validate(async valid => {
        if (!valid) return
        this.loading = true
        const res = await this.$http.post('/api/Invoice/refuse', {
          id: this.invoiceForm.id,
          cause: this.invoiceForm.cause
        })
        if (res.status !== 200) {
          this.loading = false
          return this.$message.error('修改失败')
        }
        if (res.data.code !== 0) {
          this.loading = false
          return this.$message.error(res.data.msg)
        }
        this.refuseDialogVisible = false
        this.getInvoiceLite()
      })
    },
    // 拒绝开取发票关闭时触发
    invoiceClose () {
      // 去除表单验证
      this.$refs.invoiceFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>

</style>