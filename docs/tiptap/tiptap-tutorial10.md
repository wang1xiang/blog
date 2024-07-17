---
date: 2024-3-2
title: 文档内脑图， WORD 脑图扩展
tags:
  - tiptap
describe: tiptap-tutorial10
---

需求：WORD 中不涉及具体脑图代码、只渲染需要操作的脑图（性能）、兼容历史记录

1. 属性：height、脑图 ID、脑图快照。默认显示快照，选中后再渲染脑图

   ```js
   addAttributes() {
     return {
       height: { // 默认半屏高
         default: '50vh'
       },
       'mind-id': {
         default: ''
       },
       snapshot: { // 默认快照
         default: 'https://faworkfile.xxx.cn/userUpload/docs/rjU0JlwXSfvtcdjiGExIQgQIczZUExReBjOcqzTI.svg'
       }
     }
   },
   ```

2. 方法：插入脑图、更新脑图、删除脑图。插入脑图时发送创建请求，请求失败删除脑图，成功以 addToHistory：false 更新脑图

   ```js
   addCommands() {
   return {
     // prettier-ignore
     setMind: () => ({ commands, editor }) => {
       api_create_mind().then((mindId: string) => {
         // 更新ID
         editor.commands.updateMind({ oldId: mindIngId, newId: mindId })
       }).catch(err => {
         ElMessage.error(err.message)
         // 删除节点
         editor.commands.removeMind(mindIngId)
       })
       const mindIngId = `ing-${uuidv4()}` // 创建中的临时ID
       return commands.insertContent({
         type: this.name,
         attrs: { 'mind-id': mindIngId }
       })
     },
     // prettier-ignore
     updateMind: ({ oldId, newId }) => ({ tr }) => {
       let currPos = -1
       tr.doc.nodesBetween(0, tr.doc.content.size, (node, pos) => {
         if (currPos !== -1 || node.type.name !== this.name) return false
         if (node.attrs['mind-id'] !== oldId) return false
         currPos = pos
       })
       if (currPos > -1) {
         // 以 不要历史记录的方法 更新脑图ID
         tr.setMeta('addToHistory', false)
         tr.setNodeMarkup(currPos, undefined, { 'mind-id': newId })
       }
       return true
     },
     // prettier-ignore
     removeMind: (mindId: string) => ({ tr, state }) => {
       let currPos = -1
       tr.doc.nodesBetween(0, tr.doc.content.size, (node, pos) => {
         if (currPos !== -1 || node.type.name !== this.name) return false
         if (node.attrs['mind-id'] !== mindId) return false
         currPos = pos
       })
       if (currPos > -1) {
         // 删除脑图节点
         tr.replaceWith(currPos, currPos + 1, state.schema.nodes.paragraph.create())
       }
       return true
     }
   }
   },
   ```

3. QtableMind.vue

   a. ID 为临时 ID 显示空节点
   b. 节点未聚焦显示快照（一张图片，在顶层），一个空 DIV `<div class="mind-node" :data-id="mindId"></div>`
   c. 节点聚焦，发送 statusChange 事件给 web 项目 { type: 'renderMind', payload: mindId }
   • web 项目收到后调用 mind/InDoc.vue
   • mind/InDoc.vue 组件以 `<teleport to='.mind-node[data-id="mindId"]'>` 方式渲染进 WORD
   • MIND 渲染完成后发送自定义事件 mindRendered
   • onBeforeUnmount 钩子中生成脑图快照 base64
   d. 收到 mindRendered 事件隐藏快照
   e. 节点失焦，发送 statusChange 事件给 web 项目 { type: 'renderMind', payload: '' }
   • web 项目收到后删除 mind/InDoc.vue
   • mind/InDoc.vue onBeforeUnmount 钩子生成脑图快照 base64，发送自定义事件 mindDestroy
   f. 收到 mindDestroy 事件以 base64 当作快照
   g. 将 base64 上传到服务器，拿到 URL 后替换节点 snapshot 属性
