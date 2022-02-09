<template>
    <div class="login_container"  v-loading="loading" element-loading-text="登录加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 表单form -->
            <el-form ref="loginRef"  label-width="70px" :model="user" :rules='userRules'>
                <el-form-item label="账户:" prop="username">
                    <el-input v-model="user.username" ></el-input>
                </el-form-item>
                <el-form-item label="密码:" prop="password">
                  <el-input placeholder="请输入密码" v-model="user.password" show-password></el-input>
                </el-form-item>
                <el-form-item label-width="0px">
                    <el-row :gutter="20">
                      <el-col :span="6" :offset="6">
                        <div class="code" @click="codeChange">{{code}}</div>
                      </el-col>
                      <el-col :span="7">
                        <el-input v-model="picCode" class="picCode"></el-input>
                      </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item class="btns" label-width="0">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="primary" @click="register">注册</el-button>
                </el-form-item>

            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 用户账户和密码
      user: {
        username: 'admin',
        password: '123456'
      },
      // 加载
      loading: false,
      // 验证码
      code: '',
      picCode: '',
      // 验证码长度
      codeLength: 4,
      userRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
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
    // 重置验证码
    this.codeChange()
  },
  methods: {
    login () {
      this.$refs.loginRef.validate(async valid => {
        if (this.code !== this.picCode.toUpperCase()) {
          this.codeChange()
          this.picCode = ''
          return this.$message.error('验证码错误')
        }
        if (!valid) return
        this.loading = true
        const res = await this.$http.post('api/Admin/list', this.user)
        if (res.status !== 200) {
          this.loading = false
          return this.$message.error('登录失败')
        }
        if (res.data.code === 1) {
          this.loading = false
          return this.$message.error('账号或密码错误')
        }
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.data.token)
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /index
        this.loading = false
        this.$router.push('/index')
      })
    },
    register () {
      alert('注册')
    },
    // 验证码切换
    codeChange () {
      const random = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      var c = ''
      for (var i = 0; i < this.codeLength; i++) {
        const index = Math.floor(Math.random() * 36)
        c += random[index]
      }
      this.code = c
    }

  }

}
</script>

<style lang="less" scoped>

.login_container  {
    height: 100%;
    background-color: #2b4b6b;
}
.login_box {
    width: 450px;
    height: 350px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.3);
    .avatar_box {
        position: absolute;
        left: 50%;
        top: -25%;
        width: 150px;
        height: 150px;
        transform: translate(-50%,0);
        border-radius: 50%;
        box-shadow: 0px 0px 15px rgba(0,0,0,1);
        border: 1px solid #eee;
        overflow: hidden;
        background-color: #fff;
        img {
            width: 100%;
            transform: translate(0,25%);
        }
    }
    .el-form {
        margin-top: 100px;
        padding: 0 20px;
        .code {
          cursor:pointer;
          border: 1px solid #ccc;
          text-align: center;
          letter-spacing:4px;
          background-color: pink;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .picCode {
          font-size: 20px;
        }
        .btns {
          display: flex;
          justify-content: flex-end;
        }
    }
}

</style>
