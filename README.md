# Node Blog

## 项目设计过程
### 后端接口

实现 Restful API, 前端交互通过简单的 `<a>`标签 (GET) 和 表单 (POST) 与后端进行交互

1. 注册
   * 注册页 : `GET /signup`
   * 注册 : `POST /signup`
2. 登录
   * 登录页 : `GET /signin`
   * 登录 : `POST /signin`
3. 登出 `GET /signout`
4. 文章
   * 发表文章
     * 发表文章页 : `GET /posts/create`
     * 发表文章 : `POST /posts/create`
   * 查看文章
     * 主页 : `GET /posts`
     * 个人主页: `GET /posts?author=xxx`
     * 查看一篇文章 : `GET /posts/:postId`
   * 修改文章
     * 修改文章页 : `GET /posts/:postId/edit`
     * 修改文章 : `POST /posts/:postId/edit`
   * 删除文章 : `GET /posts/:postId/remove`
5. 留言
   * 创建留言 : `POST /comments`
   * 删除留言 : `GET /comments/:commentId/remove`