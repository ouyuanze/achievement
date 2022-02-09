<template>
    <div>
      <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }" :replace='true'>首页</el-breadcrumb-item>
            <el-breadcrumb-item>账单管理</el-breadcrumb-item>
            <el-breadcrumb-item>提现管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
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
                  <el-select v-model="queryInfo.status" placeholder="请输入状态" >
                    <el-option label="全部" value=""></el-option>
                    <el-option label="已拒绝" value="0"></el-option>
                    <el-option label="待处理" value="1"></el-option>
                    <el-option label="已提现" value="2"></el-option>
                    <el-option label="已取消" value="3"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="4" >
                <el-form-item>
                   <el-button type="primary" @click="getWithdrawalLite">查询</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <!-- 表格 -->
          <el-table :data="Withdrawallist" border style="width: 100%" v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading">
            <el-table-column prop="id" label="编号" width="60"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="amount" label="提现金额"></el-table-column>
            <el-table-column prop="fee" label="手续费"></el-table-column>
            <el-table-column prop="payable" label="到账金额"></el-table-column>
            <el-table-column label="处理信息" min-width="240">
                <template slot-scope="scope">
                    <div class="row-spacing">
                        <span>处理人：{{scope.row.name}}</span> <br/>
                        <span>处理信息：{{scope.row.handle_info}}</span> <br/>
                        <span>处理时间：{{scope.row.handle_time}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="payable" label="收款信息" min-width="240">
                <template slot-scope="scope">
                    <div class="row-spacing">
                        <span>收款人姓名：{{scope.row.payee_name}}</span> <br/>
                        <span>开户行信息：{{scope.row.payee_bank}}</span> <br/>
                        <span>收款人账户：{{scope.row.payee_account}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template slot-scope="scope">
                  <el-tag v-if='scope.row.status == 2'>已提现</el-tag>
                  <el-tag v-if='scope.row.status == 1' type="warning">待处理</el-tag>
                  <el-tag v-if='scope.row.status == 0' type="danger">已拒绝</el-tag>
                  <el-tag v-if='scope.row.status == 3' type="info">已取消</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="申请时间" width="160"></el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                   <div v-if='scope.row.status == 1'>
                       <el-button type="primary" size="mini" @click="determine(scope.row.id)" class="btn">确定提现</el-button>
                       <br/>
                       <el-button type="danger" size="mini" @click="refuse(scope.row.id)">拒绝提现</el-button>
                   </div>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </el-card>
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
      Withdrawallist: [],
      // 加载
      loading: false
    }
  },
  created () {
    this.getWithdrawalLite()
  },
  methods: {
    async getWithdrawalLite () {
      this.loading = true
      const res = await this.$http.post('/api/Withdrawal/list', this.queryInfo)
      this.loading = false
      if (res.status !== 200) return this.$message.error('获取数据失败')
      this.Withdrawallist = res.data.data.data
      this.total = res.data.data.count
    },
    // 监听每页条数
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getWithdrawalLite()
    },
    // 监听当前页码
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getWithdrawalLite()
    },
    // 确定提现
    async determine (id) {
      console.log('确定提现' + id)
      const confirm = await this.$confirm('此操作将确定提现, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message('已取消提现')
      this.loading = true
      const res = await this.$http.post('/api/Withdrawal/determine', { id: id })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('提现失败')
      }
      if (res.data.data !== true) {
        this.loading = false
        return this.$message.error(res.data.data)
      }
      this.getWithdrawalLite()
      return this.$message.success('提现成功')
    },
    // 拒绝提现
    async refuse (id) {
      const confirm = await this.$confirm('此操作将拒绝提现, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message('已取消拒绝提现')
      const res = await this.$http.post('/api/Withdrawal/refuse', { id: id })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('提现失败')
      }
      if (res.data.data !== true) {
        this.loading = false
        return this.$message.error(res.data.data)
      }
      // this.getWithdrawalLite()
      return this.$message.success('拒绝提现成功')
    }
  }
}
</script>
<style lang="less" scoped>
.row-spacing span {
    line-height: 30px;
}
.btn {
  margin-bottom: 10px;
}
</style>