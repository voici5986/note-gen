# 组件 ID 参考文档

本文档列出了应用中主要组件的唯一 ID，方便用户通过自定义 CSS 功能进行样式定制。

## ID 命名规则

所有组件 ID 采用 `路由-组件名` 的命名规则（全小写），例如：
- 桌面端 AI 对话：`record-chat`
- 移动端写作编辑器：`mobile-writing`

## 桌面端组件

### 写作页面 (Article)
- **主编辑器容器**: `#article-editor`
  - 包含整个 Markdown 编辑器及工具栏
  - 路径：`/core/article`
  
- **文件侧边栏**: `#article-sidebar`
  - 包含文件管理器、工作区选择器
  - 路径：`/core/article`

### AI 对话页面 (Record)
- **对话容器**: `#record-chat`
  - 包含聊天内容、输入框、工具栏
  - 路径：`/core/record`
  
- **笔记侧边栏**: `#record-sidebar`
  - 包含标签管理、笔记列表
  - 路径：`/core/record`

### 搜索页面
- **搜索页面容器**: `#search-page`
  - 包含搜索输入框和搜索结果列表
  - 路径：`/core/search`

### 图片管理页面
- **图片页面容器**: `#image-page`
  - 包含图片列表、上传区域
  - 路径：`/core/image`

### 设置页面
- **设置页面容器**: `#setting-page`
  - 包含设置标签页和内容区域
  - 路径：`/core/setting/*`

## 移动端组件

### AI 对话
- **移动端对话容器**: `#mobile-chat`
  - 移动端 AI 对话界面
  - 路径：`/mobile/chat`

### 写作编辑器
- **移动端编辑器容器**: `#mobile-writing`
  - 移动端 Markdown 编辑器
  - 路径：`/mobile/writing`

### 笔记列表
- **移动端笔记列表**: `#mobile-record`
  - 移动端笔记管理界面
  - 路径：`/mobile/record`

### 设置
- **移动端设置页面**: `#mobile-setting`
  - 移动端设置界面
  - 路径：`/mobile/setting`

## 使用示例

### 修改 AI 对话背景色
```css
/* 桌面端 */
#record-chat {
  background-color: #f5f5f5;
}

/* 移动端 */
#mobile-chat {
  background-color: #f5f5f5;
}
```

### 修改编辑器字体
```css
/* 桌面端编辑器 */
#article-editor {
  font-family: 'Monaco', 'Consolas', monospace;
}

/* 移动端编辑器 */
#mobile-writing {
  font-family: 'Monaco', 'Consolas', monospace;
}
```

### 修改侧边栏宽度
```css
/* 文件侧边栏 */
#article-sidebar {
  min-width: 400px !important;
  max-width: 500px !important;
}

/* 笔记侧边栏 */
#record-sidebar {
  min-width: 350px !important;
  max-width: 450px !important;
}
```

### 修改搜索页面样式
```css
#search-page {
  background: linear-gradient(to bottom, #ffffff, #f0f0f0);
}

#search-page input {
  border-radius: 20px;
  border: 2px solid #4a90e2;
}
```

### 修改设置页面布局
```css
#setting-page {
  max-width: 1400px;
  margin: 0 auto;
}
```

## 注意事项

1. **使用 `!important`**：由于 Tailwind CSS 的优先级较高，某些样式可能需要使用 `!important` 来覆盖。

2. **响应式设计**：建议使用媒体查询来适配不同屏幕尺寸：
   ```css
   @media (max-width: 768px) {
     #article-editor {
       font-size: 14px;
     }
   }
   ```

3. **主题适配**：可以使用 CSS 变量或暗色模式选择器：
   ```css
   /* 亮色主题 */
   #record-chat {
     background-color: #ffffff;
   }
   
   /* 暗色主题 */
   .dark #record-chat {
     background-color: #1a1a1a;
   }
   ```

4. **子元素选择**：可以通过子选择器定位更具体的元素：
   ```css
   #article-editor .vditor-reset {
     line-height: 1.8;
   }
   
   #record-chat .chat-message {
     padding: 16px;
   }
   ```

## 更新日志

- **2025-01-16**: 初始版本，添加主要组件 ID
  - 桌面端：编辑器、对话、搜索、图片、设置
  - 移动端：对话、编辑器、笔记、设置

## 反馈

如果您需要为其他组件添加 ID，请在 GitHub Issues 中提出建议。
