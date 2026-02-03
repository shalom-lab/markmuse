# MarkMuse WeChat 测试文档

这是一个完整的 Markdown 测试文档，包含各种常见元素。

## 标题层级

### 三级标题

#### 四级标题

##### 五级标题

## 文本格式

这是**粗体文本**，这是*斜体文本*，这是***粗斜体***。

这是`行内代码`示例，还有~~删除线~~文本。

## 数学公式

### 行内公式

爱因斯坦的质能方程：$E = mc^2$

勾股定理：$a^2 + b^2 = c^2$

欧拉公式：$e^{i\pi} + 1 = 0$

### 块级公式

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 代码块

### JavaScript 代码

```javascript
// 计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 使用示例
console.log(fibonacci(10)); // 55
```

### Python 代码

```python
def quick_sort(arr):
    """快速排序算法"""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# 测试
numbers = [3, 6, 8, 10, 1, 2, 1]
print(quick_sort(numbers))
```

### TypeScript 代码

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

function findUser(id: number): User | undefined {
  return users.find(user => user.id === id);
}
```

### CSS 代码

```css
.markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.8;
  color: #333;
}

.markmuse h1 {
  font-size: 2em;
  border-bottom: 3px solid #667eea;
  padding-bottom: 1rem;
}
```

## 列表

### 无序列表

- 第一项
- 第二项
  - 嵌套项 1
  - 嵌套项 2
- 第三项

### 有序列表

1. 第一步：准备环境
2. 第二步：安装依赖
   ```bash
   npm install markmuse-wechat
   ```
3. 第三步：开始使用

## 引用

> 这是一段引用文本。
> 
> 可以包含多行内容。
> 
> — 引用来源

## 表格

| 功能 | 支持 | 说明 |
|------|------|------|
| Markdown | ✅ | 完整支持 |
| 数学公式 | ✅ | LaTeX 语法 |
| 代码高亮 | ✅ | highlight.js |
| 表格 | ✅ | 标准表格 |
| 图片 | ✅ | 支持图片 |

| 算法 | 时间复杂度 | 空间复杂度 |
|------|------------|------------|
| 冒泡排序 | $O(n^2)$ | $O(1)$ |
| 快速排序 | $O(n \log n)$ | $O(\log n)$ |
| 归并排序 | $O(n \log n)$ | $O(n)$ |

## 链接

访问 [MarkMuse GitHub](https://github.com/shalom-lab/markmuse) 了解更多。

## 水平线

---

## 混合示例

这是一个包含**粗体**、*斜体*、`代码`和行内公式 $f(x) = x^2 + 2x + 1$ 的段落。

### 代码与公式结合

在算法中，我们经常需要计算时间复杂度。例如，二分查找的时间复杂度是 $O(\log n)$：

```javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}
```

### 数学推导

证明：$\sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}$

$$
\begin{aligned}
\sum_{i=1}^{n} i^2 &= 1^2 + 2^2 + 3^2 + \cdots + n^2 \\
&= \frac{n(n+1)(2n+1)}{6}
\end{aligned}
$$

## 特殊字符

- HTML 实体：&lt;div&gt; &amp; &quot;test&quot;
- Emoji：🚀 ✨ 💡
- 中文标点：，。；：！？

---

**测试完成！** 这个文档包含了各种常见的 Markdown 元素。

