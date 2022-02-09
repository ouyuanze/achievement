<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }" :replace='true'>首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户中心</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入用户名"  clearable v-model="queryInfo.userName">
                        <el-button slot="append" icon="el-icon-search" @click="queryUserName"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 用户列表 -->
            <el-table :data="userlist" style="width: 100%" border v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading">
              <el-table-column prop="id" label="编号" width="60"></el-table-column>
              <el-table-column prop="username" label="用户名" width="180"></el-table-column>
              <el-table-column prop="backname" label="别名" width="180"></el-table-column>
              <el-table-column prop="phone" label="电话" width="180"></el-table-column>
              <el-table-column label="头像" width="100">
                   <template slot-scope="scope">
                       <img :src="scope.row.avatar_url" alt="" width="90px">
                   </template>
              </el-table-column>
              <el-table-column prop="type" label="用户类型">
                   <template slot-scope="scope">
                       <span v-if="scope.row.type ==1 " style='color:#409EFF'>普通用户</span>
                       <span v-if="scope.row.type ==2 " style='color:#67C23A'>供应</span>
                   </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
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
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[10, 20, 30, 40, 50]" :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
          <!-- 修改用户的对话框  :before-close="handleClose"-->
          <el-dialog
            title="编辑用户"
            :visible.sync="editDialogVisible"
            width="30%"
            top='250px'
            >
            <!-- 编辑框内容 -->
            <el-form :model="dictForm" :rules="dictFormrules" ref="addFormRef" label-width="60px" class="demo-ruleForm">
              <el-form-item label="名称" prop="username">
                <el-input v-model="dictForm.username"></el-input>
              </el-form-item>

              <el-form-item label="别名" prop="backname">
                <el-input v-model="dictForm.backname"></el-input>
              </el-form-item>

              <el-form-item label="电话" prop="phone">
                <el-input v-model="dictForm.phone"></el-input>
              </el-form-item>

              <el-form-item label="密码" prop="password">
                <el-input type='password' v-model="dictForm.password" show-password ></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editDialog">确 定</el-button>
            </span>
          </el-dialog>
        </el-card>
    </div>
</template>

<script>
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
      input: '',
      // 表格数据
      userlist: [],
      // 编辑框的数据
      dictForm: [],
      loading: false,
      queryInfo: {
        // 查询用户名
        userName: '',
        // 每页多少条
        pageSize: 10,
        // 当前页
        page: 1
      },
      // 总条数
      total: 0,
      // 对话框的显示于隐藏
      editDialogVisible: false,
      // 编辑的验证规则
      dictFormrules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        backname: [
          { required: true, message: '请输入别名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserlist()
  },
  methods: {
    // 获取表格数据
    async getUserlist () {
      this.loading = true
      const res = await this.$http.post('/api/User/list',
        this.queryInfo
      )
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error(res.data.msg)
      }
      this.userlist = res.data.data.data
      this.total = res.data.data.count
      this.loading = false
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getUserlist()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getUserlist()
    },
    // 搜索按钮
    queryUserName () {
      this.queryInfo.userName = this.queryInfo.userName.trim()
      this.getUserlist()
    },
    // 点击编辑 弹出对话框
    async edit (id) {
      console.log(1)
      const res = await this.$http.post('/api/User/query', { id: id })
      console.log(2)
      if (res.status !== 200) { return this.$message.error('获取该数据失败') }
      this.dictForm = res.data.data
      this.editDialogVisible = true
    },
    // 点击编辑框中的确定
    editDialog () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const data = await this.$http.post('/api/User/edit', {
          id: this.dictForm.id,
          username: this.dictForm.username,
          backname: this.dictForm.backname,
          phone: this.dictForm.phone,
          password: this.dictForm.password
        })
        if (data.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.editDialogVisible = false
        this.$message.success('修改成功')

        this.getUserlist()
      })
    },
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
      const res = await this.$http.post('/api/User/del', { id: id })
      if (res.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 刷新表格
      this.getUserlist()
    }

  }
}
</script>

<style lang="less" scoped>
body {
  margin:0
}
.el-dialog {
  padding-left: 30px;
  padding-right: 30px;
}
</style>