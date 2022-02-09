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
            <el-button type="primary" @click="add">添加</el-button>
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
              <p>收货人地址：{{scope.row.region + scope.row.address}}</p>
            </template>
          </el-table-column>
          <el-table-column prop="receive_status" label="接单状态"></el-table-column>
          <el-table-column prop="status" label="下单状态"></el-table-column>
          <el-table-column prop="quantity" label="数量/吨"></el-table-column>
          <el-table-column prop="price" label="预期价格/元"></el-table-column>
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
      </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 是否加载
      loading: false,
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
      needslist: []
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
    // 添加
    add () {},
    // 修改
    edit (id) {},
    // 删除
    del (id) {},
    // 查询
    query () {
      this.getNeedLite()
    }
  }
}
</script>
<style lang="less" scoped>

</style>