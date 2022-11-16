---
date: 2022-11-15
title: react-intl国际化使用方案
tags:
  - react
describe: react-intl国际化使用方案
---

## 国际化介绍

i18n：internationalization 国家化简称，首字母+首尾字母间隔的字母个数+尾字母，类似的还有 k8s(Kubernetes) <br />
[React-intl](https://formatjs.io/docs/getting-started/installation)是 React 中最受欢迎的库。

## 使用步骤

- 安装

  ```bash
  # use npm
  npm install react-intl -D
  # use yarn
  ```

- 项目入口文件配置

  ```tsx
  // index.tsx
  import React from "react";
  import ReactDOM from "react-dom";
  import { IntlProvider } from "react-intl";
  import App from "src/App";
  import { getCurrentLang, getCurrentMessages } from "src/locales";
  import "./styles/index.less";

  const root = (
    <IntlProvider locale={getCurrentLang()} messages={getCurrentMessages()}>
      <App />
    </IntlProvider>
  );

  ReactDOM.render(root, document.getElementById("root"));
  ```

  IntlProvider 有三个配置参数：

  - locale, `<string>`, 语言标记，例如 'zh-CN' 'en-US'
  - messages, `<object>`, 国际化所需的 key-value 对象
  - formats, `<object>`, 自定义 format，比如日期格式、货币等

- 在 src/locales 中创建国际化文件，一般有 en 和 zh，如

  ```bash
  ├─src
  │  ├─en
  │  │  ├─index.ts
  │  ├─zh
  │  │  ├─index.ts
  |  |——index.ts
  ```

  添加键值对并导出

  ```ts
  // zh/index.ts
  export default {
    whatever: `你好 {placeholder}`,
  };
  ```

  ```ts
  // locales/index.ts
  import zh from './zh';
  import en from './en';

  import ls from 'src/utils/localStore';
  import { createIntl, createIntlCache } from 'react-intl';

  const _currentLang = ls.getItem('qs_lang') || 'zh-CN';
  const messages = {
    'zh-CN': zh,
    'en-US': en,
  };
  export const getCurrentLang = () => _currentLang;
  export const getCurrentMessages = () => messages[_currentLang];

  const cache = createIntlCache();
  const intl = createIntl(
    {
      locale: _currentLang,
      messages: getCurrentMessages(),
    },
    cache
  );

  export default intl;

  ```

- 接着在组件中就可以使用`FormattedMessage`等组件

  ```tsx
  import React from "react";
  import { FormattedMessage } from "react-intl";

  const App = () => {
    return (
      <FormattedMessage
        id="whatever"
        description="hello world"
        defaultMessage="Hello {placeholder}"
        values={{ placeholder: "world" }}
      />
    );
  };

  export default App;
  ```

  或者在函数式组件中使用 hooks

  ```tsx
  import { useIntl } from "react-intl";

  const App = () => {
    const { formatMessage: f } = useIntl();
    return (
      <>
        {f(
          {
            id: "whatever",
            description: "hello world",
            defaultMessage: "Hello {placeholder}",
          },
          { placeholder: "world" }
        )}
      </>
    );
  };

  export default App;
  ```

  - `<FormattedMessage>`组件中可以通过`values`属性来传值，如以上例子传递`{placeholder: 'world'}`，渲染到对应的`你好 {placeholder}`位置
  - `formatMessage`中传递第二个参数作为占位符的入参

## 如何在非组件中使用 react-intl

例如我需要在组件目录下添加`constants.ts`文件来管理静态变量，而且需要国际化处理，因为它不是 react 组件，所以是没法用以上的方法处理。

这时候就需要使用[createIntl](https://formatjs.io/docs/react-intl/api/#createintl)来处理，createIntl 允许在不使用 Provider 的情况下创建 IntlShape 对象，它返回一个可以在 React 组件外部使用的对象。

```ts
// locales/index.ts
import { createIntl, createIntlCache } from 'react-intl';
...
const cache = createIntlCache();
const intl = createIntl(
  {
    locale: _currentLang,
    messages: getCurrentMessages(),
  },
  cache
);

export default intl;
```

在非组件文件中使用时

```ts
// xxx/constants.ts
import intl from "src/locales";

const a = intl.formatMessage(
  { id: "whatever", defaultMessage: "你好 {world}" },
  { placeholder: "world" }
);
```

## 更多

react-intl还能处理像货币、时间、数字等等各种国际化问题，更多请参考[官方文档](https://github1s.com/formatjs/formatjs/blob/main/packages/react-intl/examples/Hooks.tsx#L120)

[github上的demo](https://github1s.com/formatjs/formatjs/blob/main/packages/react-intl/examples/Hooks.tsx#L120)

## antd 国际化方案

参考[国际化](https://ant.design/docs/react/i18n-cn)

其实就是使用 React 的 context 特性，只需要一个 Provider Component，用它来提供国际化的上下文。

```tsx
import zhCN from "antd/es/locale/zh_CN";

return (
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>
);
```

## react-intl结合antd使用

以上步骤完成后，在切换语言为英文时，`react-intl`中使用的国际化文案正常显示。但此时会发现antd中组件依然显示的是中文，因为此时我们还没有对antd组件的国际化进行处理。

1. 在`src/locales`中导出antd相关的国际化文案
2. 在入口文件`index.tsx`中antd全局配置组件中引入即可

```ts
// src/locales/index.ts
import zh from './zh';
import en from './en';

import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import ls from 'src/utils/localStore';
import { createIntl, createIntlCache } from 'react-intl';

const _currentLang = ls.getItem('qs_lang') || 'zh-CN';
export const getCurrLang = () => _currentLang;

const messages = {
  'zh-CN': zh,
  'en-US': en,
};

export const antMessages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export const getAntMessages = () => antMessages[_currentLang];

export const getCurrentMessages = () => messages[_currentLang];
...
```

```tsx
// src/index.tsx
import React from "react";
import ReactDOM from "react-dom";
import { IntlProvider } from "react-intl";
import App from "src/App";
import { ConfigProvider } from "antd";
import { getCurrentLang, getCurrentMessages, getAntMessages } from "src/locales";
import "./styles/index.less";

const root = (
  <IntlProvider locale={getCurrentLang()} messages={getCurrentMessages()}>
    <ConfigProvider locale={getAntMessages()}>
        <App />
    </ConfigProvider>
  </IntlProvider>
);

ReactDOM.render(root, document.getElementById("root"));
```
