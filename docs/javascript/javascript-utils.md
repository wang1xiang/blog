---
date: 2022-8-11
title: javascript工具类函数
tags:
  - javascript
describe: 整理了工作中使用的js工具函数，相信你在工作中肯定遇到
---
  
### 区分基础类型和对象类型

```js
export const isString = (data) => typeof data === "string";
/**
 * 基础类型判断
 * @param value 要判断的数据
 */
const getBasicType = value => typeof value;
getBasicType('a') // string
getBasicType(456) // number
getBasicType({}) // object
getBasicType([]) // object

/**
 * 类型判断
 * @param value 要判断的数据
 * @param type 类型
 * @return true or false
 */
const isType = (value, type: string): boolean => {
  const { toString } = {};
  return toString.call(value) === `[object ${type}]`;
};
const getType = (n: Object) => Object.prototype.toString.call(n).slice(8, -1);
getType(1) // number
getType('124') // String
getType({}) // Object
getType([]) // Array
getType(Symbol(1)) // Symbol

isType({}, 'Object') // true
isType([], 'Object') // false
```

### 字符串操作

```ts
// 首字母大写
const upperFisrtWord = (word = '') => word.slice(0, 1).toUpperCase() + word.slice(1);
```

### 深浅拷贝

```ts

/**
 * 浅克隆
 * @param source 要浅克隆的目标对象
 */
const clone = (source: Object) => {
  if (!source) {
    return source;
  }
  const target = {};
  // eslint-disable-next-line guard-for-in
  for (const k in source) {
    target[k] = source[k];
  }
  return target;
};
/**
 * 深克隆
 * @param source 要深克隆的目标对象
 */
const deepClone = (source: Object | undefined) => {
  if (!source) {
    return source;
  }

  const target = new source.constructor();

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      
      target[key] =
        getType(source[key]) === 'Object' || getType(source[key]) === 'Array'
          ? deepClone(source[key])
          : source[key];
    }
  }

  return target;
};
```

### 判断对象类型的数据是否发生变化

```ts
/**
 * 检测对象属性变化
 * @param source 原对象
 * @param comparision 改变后的对象
 * @param ignoreFields 有些改变了不需要的key
 */
const iterable = data => ['Object', 'Array'].includes(getType(data));
const isObjectChanged = (source, comparision, ignoreFields: string[] = []) => {
  if (!iterable(source)) return;
  // 类型不一致 数据已发生变化
  if (getType(source) !== getType(comparision)) {
    console.log(source)
    console.log(comparision)
    return true
  };

  // 获取所有key
  const sourceKeys = Object.keys(source);
  // 将对比数据合并到数据源 并提取所有属性名
  const comparisonKeys = Object.keys({ ...source, ...comparision });

  // 两次key不同直接return
  if (sourceKeys.length !== comparisonKeys.length) {
    return true
  };

  return comparisonKeys.some(key => {
    // 对象类型继续递归
    if (iterable(source[key])) {
      return isObjectChanged(source[key], comparision[key], ignoreFields)
    } else {
      if (!ignoreFields.includes(key)) {
        if (source[key] !== comparision[key]) {
          console.log(key, source[key], comparision[key]);
        }
        return source[key] !== comparision[key];
      }
    }
  })
}
```

### 转换字节单位

```ts
export function bytesToSize(size) {
  if (size < 0.1 * 1024) {
      //小于0.1KB，则转化成B
      size = size.toFixed(2) + "B";
  } else if (size < 0.1 * 1024 * 1024) {
      // 小于0.1MB，则转化成KB
      size = (size / 1024).toFixed(2) + "KB";
  } else if (size < 0.1 * 1024 * 1024 * 1024) {
      // 小于0.1GB，则转化成MB
      size = (size / (1024 * 1024)).toFixed(2) + "MB";
  } else {
      // 其他转化成GB
      size = (size / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  return size;
}
```

### 所有国家列表/国家旗帜

```ts
// https://github.com/benkeen/country-region-data.git
import CountryRegionData from 'country-region-data/data.json';
const countryShortCodeObj = {};

const option = CountryRegionData.map(country => {
  const { countryName, regions, countryShortCode } = country;
  const children = regions.map(rg => {
    const { name: label } = rg;
    return {
      label, value: label
    }
  })
  countryShortCodeObj[countryName] = countryShortCode;
  return {
    label: countryName, value: countryName, children
  }
})

export { countryShortCodeObj }
export default option;

// 获取国家旗帜
[CN](https://purecatamphetamine.github.io/country-flag-icons/3x2/CN.svg)
```

### 对localStorage进行封装

```ts
const ls = {
  getItem (key: string) {
    let data = window.localStorage.getItem(key)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error(e)
      }
    }
  },
  setItem (key: string, value: any) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(e)
    }
  },
  removeItem (key: string) {
    window.localStorage.removeItem(key)
  }
}
export default ls
```

### 一些常用的正则表达式

```ts
// 中文
export const chinese = /^[\u0391-\uFFE5]+$/
// 手机号
export const mobile = /^[0-9]\d{3,9}$/
// 座机
export const landline = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/
// 邮箱
export const email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
// 网址
export const url = /^((http|ftp|https):\/\/)(([a-zA-Z0-9._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(\/[a-zA-Z0-9&%_./-~-]*)?/
//禁止输入空格
export const blank = /^[^\s]*$/
export const number = /^\d+$/

//禁止只输入空格
export const onlyBlank = /^([\s\S]*\S).*$/

export const password = /^.*(?=.*[0-9])(?=.*[a-zA-Z])\w{8,20}/

// 特殊字符
export const specialReg = /[`~!#$%^&*()_\\+=<>?:/"{}|~！#￥%……&*（）={}|《》？：“”【】、；;',.‘’，。、\s+]/g;
// 日期格式传入日期+时间时校验也可通过
export const date = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])(\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d)*$/;
export const dateTime = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;

// url
export const isUrl = (str: string) => /^((http|ftp|https):\/\/)(([a-zA-Z0-9._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(\/[a-zA-Z0-9&%_./-~-]*)?/.test(str)
```

### 复制功能

```ts
export function copy(text: string) {
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.append(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
}
```

### 移动端判断

```ts
/* 判断pc移动端 */
export function IsMobile() {
  var userAgentInfo = navigator.userAgent;
  var Agents = [
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod',
  ];
  var flag = false;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = true;
      break;
    }
  }
  return flag;
}
```

### 字符串操作

```ts
/**
 * 获取字符串长度，英文字符 长度1，中文字符长度2
 * @param {*} str
 */
export const getStrFullLength = (str = '') =>
  str.split('').reduce((pre, cur) => {
    const charCode = cur.charCodeAt(0)
    if (charCode >= 0 && charCode <= 128) {
      return pre + 1
    }
    return pre + 2
  }, 0)
/**
 * 获取字符串宽度
 * @param {*} str
 */
export const textSize = (fontSize, fontFamily, text) => {
  var span = document.createElement('span')
  var result = {}
  result.width = span.offsetWidth
  result.height = span.offsetHeight
  span.style.visibility = 'hidden'
  span.style.fontSize = fontSize
  span.style.fontFamily = fontFamily
  span.style.display = 'inline-block'
  document.body.appendChild(span)
  if (typeof span.textContent !== 'undefined') {
    span.textContent = text
  } else {
    span.innerText = text
  }
  result.width = parseFloat(window.getComputedStyle(span).width) - result.width
  result.height = parseFloat(window.getComputedStyle(span).height) - result.height
  return result
}

/** 字符串前后补0操作 */
'123'.padStart(5, 0) // 00123
'123'.padEnd(4, 0) // 1230

/** 生成随机ID */
const randomId = len => Math.random().toString(36).substr(3, len);
const id = randomId(10);

/** 生成随机HEX色值 */
const randomColor = () => "#" + Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, "0");
const color = randomColor();
```

### Number操作

```ts
/** 精确小数位 */
const RoundNum = (num, decimal) => Math.round(num * 10 ** decimal) / 10 ** decimal;
const num = RoundNum(1.69, 1); 

/** 生成随机数 */
const RandomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const num = RandomNum(12, 122);

```

### 获取URL查询参数

```ts
const params = new URLSearchParams(location.search.replace(/\?/ig, "")); // location.search = /book?id=6850413616484040711"
params.has("id"); // true
params.get("id"); // "6850413616484040711"
```

### 数组操作

```ts

// 创建长度为7的数组
Array.from({ length: 7 }) //[undefined, undefined, undefined, undefined, undefined, undefined, undefined]

// 创建长度为3的数组 并向其中插入0
const length = 3;
const init = 0;
const result = Array.from({ length }, () => init); // [0,0,0]
const arr = new Array(length).fill(0); // [0,0,0]

// Array.from的第二个参数，可以遍历数组 相当于map
let b = [1,2,3]
console.log(Array.from(b, v=> v + 2)); // [3,4,5]

/**
 * 求数组差集
 */
export const subSet = function (arr1, arr2) {
  let set1 = new Set(arr1)
  let set2 = new Set(arr2)
  let subset = []
  for (let item of set1) {
    if (!set2.has(item)) {
      subset.push(item)
    }
  }
  return subset
}
```

### 数字千分位

```ts
/**
 * 数字加，
 */
export const formatNumber = function (n) { 
  var b = parseInt(n).toString()
  var len = b.length
  if (len <= 3) { return b }
  var r = len % 3
  return r > 0 ? b.slice(0, r) + ',' + b.slice(r, len).match(/\d{3}/g).join(',') : b.slice(r, len).match(/\d{3}/g).join(',')
}

(v) => ${v}.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => ${s},)

export const thousandNum = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const money = thousandNum(2548745.45); // '2,548,745.45'
 
```

### 文件下载

```ts
/**
* 文件下载
* @param {Object} url
*/
export async function downLoadFile (url, name) {
  const response = await service({
    method: 'get',
    url,
    responseType: 'arraybuffer'
  })  
  // 内容转变成blob地址
  const blob = await new Blob([response.data], { type: 'application/vnd.ms-excel' })
  // 创建隐藏的可下载链接
  const objectUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  name && (a.download = name)
  document.body.appendChild(a)
  a.click()
  setTimeout(() => document.body.removeChild(a), 1000)
}
```
