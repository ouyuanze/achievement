<template>
    <div>
      <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }" :replace='true'>首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单中心</el-breadcrumb-item>
            <el-breadcrumb-item>需求管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
          <div slot="header" class="clearfix">
          <el-form :model="queryInfo" label-width="90px">
            <!-- 第一行的查询 -->
            <el-row :gutter="20">
              <el-col :span="5"  style="min-width:250px">
                <el-form-item label="名称:">
                  <el-input v-model="queryInfo.name"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="5">
                <el-form-item label="类型:">
                  <el-select v-model="queryInfo.type" placeholder="请输入状态" >
                    <el-option label="全部" value=""></el-option>
                    <el-option label="出售" value="1"></el-option>
                    <el-option label="求购" value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="4" >
                <el-form-item>
                   <el-button type="primary" @click="query">查询</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div>
          <!-- 第二行添加按钮 -->
          <el-row>
            <el-button type="primary" @click="edit()">添加</el-button>
          </el-row>
        </div>

        <!-- 表格区域 -->
        <el-table :data="needslist" style="width: 100%" border v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading">
          <el-table-column prop="id" label="编号" width="60"></el-table-column>
          <el-table-column prop="username" label="需求用户"></el-table-column>
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column prop="type" label="类型">
            <template slot-scope="scope">
               <span v-if="scope.row.type ==1 " style='color:#409EFF'>出售</span>
               <span v-if="scope.row.type ==2 " style='color:#67C23A'>求购</span>
            </template>
          </el-table-column>
          <el-table-column label="收货信息" min-width="200">
            <template slot-scope="scope">
              <p>收货人：{{scope.row.receiver}}</p>
              <p>收货人电话：{{scope.row.phone}}</p>
              <p>收货人地址：{{scope.row.address}}</p>
            </template>
          </el-table-column>
          <el-table-column prop="receive_status" label="接单状态"></el-table-column>
          <el-table-column prop="status" label="下单状态"></el-table-column>
          <el-table-column prop="quantity" label="数量/吨"></el-table-column>
          <el-table-column prop="price" label="预期价格/元"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope" class="operation">
              <el-button type="primary" size="mini" @click="examine(scope.row.id)">审核需求</el-button>
              <el-button type="primary" size="mini" @click="deposit(scope.row.id)">定金已付</el-button>
              <el-button type="primary" size="mini" @click="distribution(scope.row.id)">分配需求</el-button>
              <el-button type="primary" size="mini" @click="balancePayment(scope.row.id)">尾款已付</el-button>
              <el-button type="primary" size="mini" @click="edit(scope.row.id)">修改需求</el-button>
              <el-button type="danger" size="mini" @click="del(scope.row.id)">删除需求</el-button>
            </template>
          </el-table-column>
        </el-table>
         <!-- 分页 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
      </el-card>

       <!-- 添加或者修改 -->
      <el-dialog title="编辑需求" :visible.sync="EditDialogVisible" width="0%" @close="editClose">
        <el-form :model="NeedsForm" :rules="NeedsRules" ref="NeedsFormRef" label-width="90px" class="demo-ruleForm">
          <el-form-item label="需求名称" prop="name">
            <el-input v-model="NeedsForm.name"></el-input>
          </el-form-item>
          <el-form-item label="收货地址" prop="address">
            <el-input v-model="NeedsForm.address"></el-input>
          </el-form-item>
          <el-form-item label="数量/每吨" prop="quantity">
            <el-input v-model="NeedsForm.quantity"></el-input>
          </el-form-item>
          <el-form-item label="价格/每吨" prop="price">
            <el-input v-model="NeedsForm.price"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="EditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="EditDialog">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加或者修改 -->
      <el-dialog title="编辑需求" width="35%" :visible.sync="transfer">
          <el-transfer v-model="transferData.UserValue" :data="transferData.UserData"></el-transfer>
        <span slot="footer" class="dialog-footer">
          <el-button @click="transfer = false">取 消</el-button>
          <el-button type="primary" @click="UserTransfer">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 穿梭框 -->

    </div>
</template>
<script>
export default {
  data () {
    return {
      // 是否加载
      loading: false,
      // 穿梭框是否开启
      transfer: false,
      // 对话框关闭
      EditDialogVisible: false,
      queryInfo: {
        name: '',
        type: '',
        // 每页多少条
        pageSize: 10,
        // 当前页
        page: 1
      },
      // 总条数
      total: 0,
      // 表格数据
      needslist: [],
      // 需求
      NeedsForm: {},
      // 验证
      NeedsRules: {
        name: [
          { required: true, message: '请输入需求名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入收货地址', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ]
      },
      // 穿梭框的用户分配
      transferData: {
        id: '',
        UserData: [{ key: 1, pinyin: 1 }, { key: 3, pinyin: 'nihao' }],
        UserValue: [3]
      }

    }
  },
  created () {
    this.getNeedLite()
  },
  methods: {
    async getNeedLite () {
      this.loading = true
      const res = await this.$http.post('/api/Needs/lite', this.queryInfo)
      this.loading = false
      if (res.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.needslist = res.data.data.data
      this.total = res.data.data.count
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getNeedLite()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getNeedLite()
    },
    // 修改
    async edit (id) {
      var needsId = id ?? ''
      const res = await this.$http.post('/api/Needs/editform', { id: needsId })
      if (res.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.NeedsForm = res.data.data
      console.log(res)
      this.EditDialogVisible = true
    },
    // 删除
    async del (id) {
      const delConfirm = await this.$confirm('此将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (delConfirm !== 'confirm') {
        return this.$message.warning('已取消删除')
      }

      this.loading = true
      const res = await this.$http.post('api/Needs/del', { id: id })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getNeedLite()
    },
    // 审核
    async examine (id) {
      const delConfirm = await this.$confirm('需求审核是否通过?', '提示', {
        confirmButtonText: '通过',
        cancelButtonText: '拒绝',
        cancelButtonClass: 'redBtn',
        type: 'warning',
        center: true,
        distinguishCancelAndClose: true
      }).catch((err) => err)
      var res = {}
      if (delConfirm === 'close') {
        return this.$message.warning('已取消删除')
      } else if (delConfirm === 'cancel') { // 拒绝
        res = await this.$http.post('api/Needs/updateStatus', { id: id, status: 'refuse' })
      } else if (delConfirm === 'confirm') { // 通过
        res = await this.$http.post('api/Needs/updateStatus', { id: id, status: 'adopt' })
      }
      console.log(res)
      if (res.status !== 200) {
        return this.$message.error('审核失败')
      }
      this.$message.warning(res.data.data.msg)
      this.getNeedLite()
    },
    // 付定金
    async deposit (id) {
      const delConfirm = await this.$confirm('是否确定定金已付?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (delConfirm !== 'confirm') {
        return this.$message.warning('已取消删除')
      }
      const res = await this.$http.post('api/Needs/deposit', { id: id })
      if (res.status !== 200) {
        return this.$message.error('状态改变失败')
      }
      if (res.data.data.msg === 'ok') {
        this.$message.success('ok')
      } else {
        this.$message.warning(res.data.data.msg)
      }

      this.getNeedLite()
    },
    // 分配需求
    async distribution (id) {
      this.transfer = true
      const res = await this.$http.post('api/Needs/getUser', { id: id })
      if (res.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.transferData.UserData = res.data.data.data
      this.transferData.UserValue = res.data.data.value
      this.transferData.id = id
    },
    // 尾款已付
    async balancePayment (id) {
      const delConfirm = await this.$confirm('是否确定尾款已付?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (delConfirm !== 'confirm') {
        return this.$message.warning('已取消删除')
      }
      const res = await this.$http.post('api/Needs/balancePayment', { id: id })
      if (res.status !== 200) {
        return this.$message.error('状态改变失败')
      }
      if (res.data.data.msg === 'ok') {
        this.$message.success('ok')
      } else {
        this.$message.warning(res.data.data.msg)
      }
      this.getNeedLite()
    },
    // 查询
    query () {
      this.getNeedLite()
    },
    // 编辑确定
    async EditDialog () {
      const res = await this.$http.post('/api/Needs/addNeeds', {
        id: this.NeedsForm.id ?? '',
        address: this.NeedsForm.address,
        quantity: this.NeedsForm.quantity,
        price: this.NeedsForm.price,
        name: this.NeedsForm.name
      })
      if (res.status !== 200 || res.data.code !== 0) {
        this.loading = false
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
      this.EditDialogVisible = false
      this.getNeedLite()
    },
    // 穿梭框确定按钮
    async UserTransfer () {
      const res = await this.$http.post('api/Needs/distribution', { id: this.transferData.id, needsUserId: this.transferData.UserValue.join(',') })
      if (res.status !== 200) {
        return this.$message.error('保存失败')
      }
      if (res.data.code !== 0) {
        return this.$message.error(res.data.msg)
      }
      this.transfer = false
      this.getNeedLite()
    },
    // 编辑款关闭时触发
    editClose () {
      // q去除表单验证
      this.$refs.NeedsFormRef.resetFields()
    }
  }
}
</script>
<style>
.cell .el-button {
margin: 5px 5px;
}
.redBtn {
  background-color: red !important;
  color: #fff !important;
}
</style>