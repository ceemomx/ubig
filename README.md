# ubig

基于百度地图开放API 开发的地图相册


##### 项目结构

```
|- lib/
|- public/
    |- admin/
|- source/
    |- albums/
|- template/
    |- default/
|- index.js
|- config.js
|- render.js
|- package.json
```


---

### 1 运行相册服务

##### 1.1 修改配置文件

复制config.default.js 并重命名为 config.js

##### 1.2 申请百度地图API key

在百度地图开放API中申请key
在config.js map key 填入

##### 1.3 配置git地址

config.js git url 中填写git地址

关于创建github pages请参考 [github pages](https://pages.github.com/)

相册创建好的静态文件将推送至github pages

##### 1.4 安装依赖

打开终端 在项目根目录下 执行

    npm install

##### 1.5 本地启动服务

打开终端 在项目根目录下 执行

    node index

或

    npm start

##### 1.6 使用相册

访问后台地址 `http://localhost:4000/admin` 或 `http://127.0.0.1:4000/admin` 进入后台

**<font color="red" size="2"> * 端口号默认4000 如果在config.js文件中修改了port 那么请将地址改为对应的端口</font>**


##### 1.7 提交相册

在后台点击提交按钮 所有source/下的静态文件将被提交到github仓库中

---

### 2 静态文件目录

所有的静态文件包括相册会存放在source/目录下

相册文件会以 年/月/相册标题 的目录形式存放在source/albums目录中

---

### 3 独立域名

具体请参考 [github pages custom domain](https://help.github.com/articles/using-a-custom-domain-with-github-pages/)

自定义的CNAME文件存放到source/目录下 提交静态文件CNAME将一并提交上去

---

### 4 模板

模板文件存放在template/目录下

已经存在一个default模板

可以在template/目录下创建自己的模板

模板中的字段变量将以`{{variable}}`的形式传递

请确保页面中引用note.js

``` javascript
<script src="note.js"></script>
```
并且在所有引用的js的最上方

创建好模板后将config.js中 template 修改为自己创建的模板文件夹的名称

---

### License

MIT