---
date: 2022-9-25
title: react-intl国际化使用方案
tags:
  - react
describe: react-intl国际化使用方案
---
  
## 国际化介绍

i18n：internationalization国家化简称，首字母+首尾字母间隔的字母个数+尾字母，类似的还有k8s(Kubernetes) <br />
[React-intl](https://formatjs.io/docs/getting-started/installation)是React中最受欢迎的库。

## 使用步骤

- 安装

  ```bash
  npm install react-intl -D
  ```

IntlProvider 有三个配置参数：

- locale, `<string>`, 语言标记，例如 'zh-CN' 'en-US'
- messages, `<object>`, 国际化所需的 key-value 对象
- formats, `<object>`, 自定义 format，比如日期格式、货币等

```tsx
<FormattedMessage
    id="whatever"
    description="hello world"
    defaultMessage="Hello {placeholder}"
    values={{placeholder: 'world'}}
/>
{f(
  {id: 'whatever', description="hello world", defaultMessage: 'Hello {placeholder}'},
  {placeholder: 'world'}
)}
```

## antd国际化方案

参考[国际化](https://ant.design/docs/react/i18n-cn)
其实就是使用 React 的 context 特性，只需要一个 Provider Component，用它来提供国际化的上下文。
