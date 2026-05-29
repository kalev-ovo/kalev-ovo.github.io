+++
date = '2026-01-09T21:43:29+08:00'
draft = true
title = 'Code Blocks Beautify'
+++

### 尝试修改代码块的样式
在`/assets/scss/partials/custom.scss`中添加如下代码块后发现代码块仍为深色样式
```scss
/* code block style */
pre {
    padding: 20px;
    border-radius: 20px;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    line-height: 1.5;
    overflow: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
code {
    font-family: 'Fira Code', monospace;
    font-size: 16px;
    color: var(--color-text);
}
```
### 暴力覆盖
尝试添加`!important`覆盖原有样式
```scss
.article-content {
  .highlight:before {
    content: '';
    display: block;
    height: 24px;
    width: 100%;
    margin-bottom: 8px;
    background: url(../icons/macOS-code-header.svg) no-repeat;
    background-size: 57px;
    background-position: -1px 2px;
  }

  /* 外层和 pre 背景，圆角、阴影、内边距 */
  .highlight,
  .highlight pre {
    border-radius: 20px !important;
    overflow: hidden !important; /* 确保圆角生效 */
    box-shadow: var(--shadow-l1) !important;
    margin: 0 auto;
    padding: 1em 1.2em;

    /* 背景与文字颜色使用 CSS 变量 */
    background-color: var(--pre-background-color) !important;
    color: var(--pre-text-color) !important;
  }

  /* 清除 token 背景，防止 Prism/Highlight.js 黑底 */
  .highlight code span {
    background-color: transparent !important;
  }

  /* 代码字体样式 */
  .highlight code {
    font-family: var(--code-font-family);
    font-size: 14px !important;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    background: transparent !important;
    color: var(--code-text-color) !important;
  }

  /* 滚动条美化 */
  .highlight::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  .highlight::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 4px;
  }

  .highlight::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }

  .highlight::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  /* 可选：高亮当前行 */
  .highlight .line-highlight {
    background: rgba(255, 229, 100, 0.2);
    display: block;
    margin: 0 -1em;
    padding: 0 1em;
  }
}

/* =======================================
   CSS 变量定义 —— 浅色模式
   ======================================= */
:root {
  --pre-background-color: #fafafa; /* 代码块背景 */
  --pre-text-color: #272822;       /* 代码文字 */
  --code-background-color: rgba(0,0,0,0.05); /* code 内背景 */
  --code-text-color: #333;         /* code 内文字 */

  /* 滚动条 */
  --scrollbar-thumb: hsl(0, 0%, 85%);
  --scrollbar-track: #fafafa;
}

/* =======================================
   CSS 变量定义 —— 深色模式
   ======================================= */
[data-scheme="dark"] {
  --pre-background-color: #2b2b2b;
  --pre-text-color: #f8f8f2;
  --code-background-color: rgba(255,255,255,0.05);
  --code-text-color: #f8f8f2;

  --scrollbar-thumb: hsl(0,0%,40%);
  --scrollbar-track: #2b2b2b;
}
```

