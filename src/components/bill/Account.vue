<template>
    <div>
      <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }" :replace='true'>首页</el-breadcrumb-item>
            <el-breadcrumb-item>账单管理</el-breadcrumb-item>
            <el-breadcrumb-item>资金管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
          <!-- 查询 -->
          <el-form :model="queryInfo" label-width="90px">
            <el-row :gutter="20">
              <el-col :span="5"  style="min-width:250px">
                <el-form-item label="名称:">
                  <el-input v-model="queryInfo.username"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="5">
                <el-form-item label="状态:">
                  <el-select v-model="queryInfo.status" placeholder="请输入状态" >
                    <el-option label="全部" value=""></el-option>
                    <el-option label="禁止" value="0"></el-option>
                    <el-option label="正常" value="1"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="4" >
                <el-form-item>
                   <el-button type="primary" @click="getAccountLite">查询</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <!-- 表格 -->
          <el-table :data="accountlist" border style="width: 100%" v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading">
            <el-table-column prop="id" label="编号" width="90"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="currency" label="帐户币种"></el-table-column>
            <el-table-column prop="balance" label="余额"></el-table-column>
            <el-table-column prop="proportion" label="提现服务费比例"></el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-text="开启" inactive-text="禁用" :active-value="1" :inactive-value="0" @change="statusChange(scope.row.id)"></el-switch>
            </template>
            </el-table-column>
            <el-table-column label="操作" width="90">
              <template slot-scope="scope">
                <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
                   <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </el-card>

        <!-- 添加或者修改 -->
      <el-dialog title="编辑需求" :visible.sync="editDialogVisible" width="30%" @close="editClose">
        <el-form :model="AccountForm" :rules="AccountRules" ref="AccountFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="用户名">
            <el-input v-model="AccountForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="币种" prop="currency">
            <el-input v-model="AccountForm.currency"></el-input>
          </el-form-item>
          <el-form-item label="金额/元" prop="balance">
            <el-input v-model="AccountForm.balance" type="number" step="1.00" ></el-input>
          </el-form-item>
          <el-form-item label="服务费比例" prop="proportion">
            <el-input v-model="AccountForm.proportion" type="number" step="0.01" ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialog">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      queryInfo: {
        username: '',
        status: '',
        pageSize: 10,
        page: 1
      },
      total: 0,
      accountlist: [],
      // 加载
      loading: false,
      // 修改
      AccountForm: {},
      // 修改 编辑款的打开与关闭
      editDialogVisible: false,
      // 验证表单
      AccountRules: {
        currency: [
          { required: true, message: '请输入币种', trigger: 'blur' }
        ],
        balance: [
          { required: true, message: '请输入金额', trigger: 'blur' }
        ],
        proportion: [
          { required: true, message: '请输入服务费比例', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getAccountLite()
  },
  methods: {
    async getAccountLite () {
      this.loading = true
      const res = await this.$http.post('/api/Account/list', this.queryInfo)
      this.loading = false
      if (res.status !== 200) return this.$message.error('获取数据失败')
      this.accountlist = res.data.data.data
      this.total = res.data.data.count
    },
    // 监听每页条数
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getAccountLite()
    },
    // 监听当前页码
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getAccountLite()
    },
    // 修改
    async edit (id) {
      const res = await this.$http.post('api/Account/query', { id: id })
      if (res.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.AccountForm = res.data.data
      this.editDialogVisible = true
    },
    // 改变状态
    async statusChange (id) {
      const res = await this.$http.post('/api/Account/updateStatus', { id: id })
      if (res.status !== 200) {
        return this.$message.error('状态改变失败')
      }
      if (res.data.code !== 0) {
        return this.$message.error(res.data.data)
      }
      return this.$message.success('状态修改成功')
    },
    // 编辑款的确定按钮
    editDialog () {
      this.$refs.AccountFormRef.validate(async valid => {
        if (!valid) return
        this.loading = true
        const res = await this.$http.post('/api/Account/edit', {
          id: this.AccountForm.id,
          currency: this.AccountForm.currency,
          balance: this.AccountForm.balance,
          proportion: this.AccountForm.proportion
        })
        console.log(res)
        if (res.status !== 200) {
          this.loading = false
          return this.$message.error('修改失败')
        }
        if (res.data.code !== 0) {
          this.loading = false
          return this.$message.error(res.data.data)
        }
        this.editDialogVisible = false
        this.getAccountLite()
      })
    },
    // 编辑款关闭时触发
    editClose () {
      // q去除表单验证
      this.$refs.AccountFormRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>

</style>