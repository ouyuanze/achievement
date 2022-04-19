<template>
    <div>
      <!-- 面包屑 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据中心</el-breadcrumb-item>
        <el-breadcrumb-item>广告列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图 -->
      <el-card>
        <div slot="header" class="clearfix">
          <el-form :model="queryInfo" label-width="90px">
            <!-- 第一行的查询 -->
            <el-row :gutter="20">
              <el-col :span="5"  style="min-width:250px">
                <el-form-item label="广告标题:">
                  <el-input v-model="queryInfo.short_name"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="5">
                <el-form-item label="状态:">
                  <el-select v-model="queryInfo.status" placeholder="请输入状态" >
                    <el-option label="全部" value=""></el-option>
                    <el-option label="禁用" value="0"></el-option>
                    <el-option label="启用" value="1"></el-option>
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
            <el-button type="primary" @click="edit('')">添加</el-button>
          </el-row>
        </div>
        <!-- 表格 -->
        <el-table :data="adlist" border style="width: 100%" v-loading="loading" element-loading-text="加载中" element-loading-spinner="el-icon-loading">
          <el-table-column prop="id" label="广告编号" width="90"></el-table-column>
          <el-table-column prop="short_name" label="广告标题" ></el-table-column>
          <el-table-column label="图片" width="120">
            <template slot-scope="scope" >
              <div class="demo-image__preview">
                <el-image style="width: 100px;" :src="scope.row.icon" :preview-src-list="[scope.row.icon]"></el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容"></el-table-column>
          <el-table-column prop="go_url" label="跳转地址"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column label="状态" width="160px">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-text="开启" inactive-text="禁用" :active-value="1" :inactive-value="0" @change="statusChange(scope.row.id)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="160px"></el-table-column>
          <el-table-column label="操作"  width="140px">
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
      </el-card>

      <!-- 添加或者修改 -->
      <el-dialog title="名称" :visible.sync="EditDialogVisible" width="30%" @close="EditClose">
        <el-form :model="AdForm" :rules="AdRules" ref="AdFormRef" label-width="60px" class="demo-ruleForm">
          <el-form-item label="标题" prop="short_name">
            <el-input v-model="AdForm.short_name"></el-input>
          </el-form-item>
          <el-form-item label="图片" prop="icon">
            <el-input v-model="AdForm.icon"></el-input>
          </el-form-item>
          <el-form-item label="图片" prop="icon">
            <el-upload action="#" list-type="picture-card" :auto-upload="false" :on-change="ImgChange">
              <i slot="default" class="el-icon-plus"></i>
              <div slot="file" slot-scope="{file}">
                <img
                  class="el-upload-list__item-thumbnail"
                  :src="file.url" alt=""
                >
                <!-- :src="file.url" alt="" -->
              </div>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item label="备注" prop="remark">
            <el-input v-model="AdForm.remark"></el-input>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="AdForm.content"></el-input>
          </el-form-item> -->
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="EditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="EditDialog">确 定</el-button>
        </span>
      </el-dialog>

    </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询详情
      queryInfo: {
        short_name: '',
        status: '',
        // 每页多少条
        pageSize: 10,
        // 当前页
        page: 1
      },
      total: 0,
      // 表格数据
      adlist: [],
      // 加载
      loading: false,
      // 添加和修改对话框的开启与关闭
      EditDialogVisible: false,
      // 添加和修改的表单数据
      AdForm: {},
      // 验证表单
      AdRules: {
        short_name: [],
        icon: [],
        remark: [],
        content: []
      }

    }
  },
  created () {
    this.getAdLite()
  },
  methods: {
    async getAdLite () {
      this.loading = true
      const res = await this.$http.post('/api/Ad/list', this.queryInfo)
      this.loading = false
      if (res.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.adlist = res.data.data.data
      this.total = res.data.data.count
    },
    // 获取广告表格的所有数据
    query () {
      this.getAdLite()
    },
    // 添加广告
    add (id) {
      console.log(id)
      this.EditDialogVisible = true
    },
    // 编辑按钮 修改和添加按钮
    async edit (id) {
      const res = await this.$http.post('/api/Ad/query', { id: id })
      if (res.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.AdForm = res.data.data
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
      const res = await this.$http.post('/api/Ad/del', { id: id })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getAdLite()
    },
    // 监听每页条数
    handleSizeChange (val) {
      this.queryInfo.pageSize = val
      this.getAdLite()
    },
    // 监听当前页码
    handleCurrentChange (val) {
      this.queryInfo.page = val
      this.getAdLite()
    },
    // 点击图片放大
    enlargeImg () {
      console.log('123')
    },
    // 监听 添加或者修改 电话框的关闭
    EditClose () {
      console.log(111)
    },
    // 点击 添加或者修改中的确定按钮
    async EditDialog () {
      this.loading = true
      const res = await this.$http.post('/api/Ad/edit', {
        id: this.AdForm.id,
        short_name: this.AdForm.short_name,
        icon: this.AdForm.icon,
        remark: this.AdForm.remark,
        content: this.AdForm.content
      })
      if (res.status !== 200) {
        this.loading = false
        return this.$message.error('编辑失败')
      }
      this.EditDialogVisible = false
      this.getAdLite()
    },
    // 状态发生改变时
    async statusChange (id) {
      const res = await this.$http.post('/api/Ad/updateStatus', { id: id })
      if (res.status !== 200) {
        return this.$message.error('状态改变失败')
      }
      if (res.data.code === 1) {
        return this.$message.error(res.data.data)
      }
      return this.$message.success('状态修改成功')
    },
    // 选取文件触发
    async ImgChange (file, fileList) {
      console.log(file)
      console.log(fileList)
      const res = await this.$http.post('/api/Ad/upload', { file: file })
      console.log(res)
    }
  }
}
</script>
<style lang="less" scoped>

</style>