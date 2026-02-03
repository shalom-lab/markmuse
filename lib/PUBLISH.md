# 发布指南

手动发布到 npm。

## 配置步骤（只需一次）

### 1. 获取 npm Access Token

1. 登录 [npmjs.com](https://www.npmjs.com/)
2. 进入 **Access Tokens** 页面：https://www.npmjs.com/settings/shalom-lab/tokens
3. 点击 **Generate New Token** → 选择 **Automation** 类型
4. 复制生成的 Token（只显示一次，请妥善保存）

### 2. 配置本地认证

在 `lib` 目录下创建 `.npmrc` 文件：

```bash
cd lib
echo "//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN" > .npmrc
```

⚠️ **注意**：`.npmrc` 已添加到 `.gitignore`，不会提交到仓库。

或者使用环境变量：

```bash
export NODE_AUTH_TOKEN=YOUR_NPM_TOKEN
```

## 发布步骤

### 1. 构建项目

```bash
cd lib
npm run build
```

### 2. 更新版本号

```bash
# 方式 A：自动递增版本号
npm version patch   # 1.0.0 -> 1.0.1（修复 bug）
npm version minor   # 1.0.0 -> 1.1.0（新功能）
npm version major   # 1.0.0 -> 2.0.0（破坏性变更）

# 方式 B：指定版本号
npm version 1.0.1 --no-git-tag-version
```

### 3. 发布到 npm

```bash
npm publish
```

## 版本号管理

遵循 [语义化版本](https://semver.org/)：
- **Patch**：修复 bug（1.0.0 → 1.0.1）
- **Minor**：新功能（1.0.0 → 1.1.0）
- **Major**：破坏性变更（1.0.0 → 2.0.0）

## 验证发布

发布成功后，可以通过以下方式验证：

```bash
# 查看包信息
npm view markmuse-wechat

# 安装测试
npm install markmuse-wechat
```

## 注意事项

1. **发布前检查**：
   - ✅ 确保 `dist/` 目录已构建
   - ✅ 确保 `package.json` 中的版本号正确
   - ✅ 确保 `README.md` 是最新的
   - ✅ 运行 `npm run type-check` 确保没有类型错误

2. **Access Token 安全**：
   - ⚠️ 永远不要将 Token 提交到 Git
   - ⚠️ 使用 **Automation** 类型的 Token（只读/发布权限）
   - ⚠️ 定期轮换 Token

3. **包发布**：
   - 普通包，直接使用 `npm publish` 即可

## 常见问题

### Q: 发布时提示 "You must verify your email"
A: 登录 npmjs.com，验证邮箱地址

### Q: 发布时提示 "You do not have permission"
A: 检查：
1. Token 是否正确配置在 `.npmrc` 或环境变量中
2. npm 账户是否有发布权限
3. 包名是否已被占用（如果被占用，需要更换包名）

### Q: 如何撤销已发布的版本？
A: npm 不允许删除已发布的版本，但可以发布一个新版本修复问题
