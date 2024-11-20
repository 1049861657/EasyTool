# Web Tools 工具集

一个集成了多种实用工具的 Web 应用程序，包括文件上传、图片管理等功能。

## 功能特性

- 📁 文件管理
  - 支持多文件上传
  - 支持压缩文件处理
  - 文件在线预览
  - 安全下载功能

- 🖼️ 图片管理
  - 多图片上传
  - 图片云存储
  - 图片预览
  - 图片删除

## 技术栈

- **后端**
  - Node.js
  - Express.js
  - MySQL
  - Cloudinary (云存储)

- **前端**
  - React
  - Ant Design
  - Axios

## 快速开始

### 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

### 安装步骤

1. 克隆项目

git clone https://github.com/your-username/web-tools.git
cd web-tools


2. 安装依赖

npm install

3. 配置环境变量

cp .env.example .env
编辑 .env 文件，填入配置

4. 启动服务

npm start

## 项目结构

web-tools/
├── api/ # API 路由处理
├── config/ # 配置文件
├── utils/ # 工具函数
├── public/ # 静态资源
├── uploads/ # 上传文件临时目录
└── ...