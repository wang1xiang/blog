// 接收plop对象，用于创建生成器任务
module.exports = (plop) => {
  plop.setHelper('time', () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  })
  // param 生成器名称 生成器配置选项
  plop.setGenerator('create', {
    description: '添加文档并格式化',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '文档名称',
        default: 'text'
      },
      {
        type: 'list',
        name: 'module',
        message: '选择创建文件到下面哪个文件夹',
        choices: ['css', 'git', 'javascript', 'mobile', 'react', 'tool', 'vite', 'vscode', 'work']
      }
    ],
    actions: [
      {
        type: 'add', // 代表添加全新文件
        path: `docs/{{module}}/{{name}}.md`,
        templateFile: 'plop-templates/docs.md.hbs'
      }
    ]
  })
}
