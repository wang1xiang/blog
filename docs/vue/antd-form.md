---
date: '2020-8-17'
title: antd-vue在Modal组件中使用form组件
tags:
  - vue
describe: 如何在Modal组件中使用form组件
---

### 步骤

1. modal中添加form，这里modal的visible属性和form的v-if绑定同一个值，给定form的ref值

  ```javascript
  <a-form
    :form="form"
    v-if="addVisible"
    ref="getForm"
  >
  ```

2. data中初始化form

  ```javascript
  form: this.$form.createForm(this)
  formItemLayout: {
    labelCol: { span: 8 },
    wrapperCol: { span: 10 },
  }
  ```

3. 补充form表单，比如校验等

  ```javascript
    <a-form-item
      v-bind="formItemLayout"
      label="密码"
    >
      <a-input
        type="password"
        v-decorator="[
          'password',
          {
            rules: [{
              required: true, message: '请输入密码',
            }, {
              validator: validateToNextPassword,
            }]
          }
        ]"
      />
    </a-form-item>

    validateToNextPassword  (rule, value, callback) {
      let pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
      if(value) {
        if (!pattern.test(value)) {
          callback(new Error('字母数字下划线组成'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
  ```

4. modal点击ok事件，通过refs来获取form对象

  ```javascript
  const form = this.$refs.getForm.form // 通过refs属性可以获得对话框内form对象
  form.validateFields((err, values) => {
    if(!err){
      this.addVisible = false
    }
  })
  ```

5. 如果需要修改
  使用setFields来全部设置，或者使用setFieldValue单个设置

  ```js
  setTimeout(()=>{
    this.form.setFields({
      'realname': { value: record.realname},
      'username':{ value: record.username},
      'password':{ value: record.password},
      'email':{ value: record.email},
      'phone':{ value: record.phone},
    })
  },0)
  ```
