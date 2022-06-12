# kuu-micro
>基于qiankun的微前端基座

### 使用方法
1. clone 项目
2. 修改本项目`.umirc.js`的`proxy`为api的线上地址, 并启动项目
3. 修改子应用项目的`.umirc.js`, 去掉mfsu功能并清除mfsu的缓存, 再启动项目
4. 在浏览器打开本项目的地址并登陆帐号, 通过修改地址方式访问子应用
   1. 如http://localhost:8000/local-bd/base/floor