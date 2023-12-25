---
date: 2023-12-11
title: nest入门笔记
tags:
  - next
describe: nest-start
---

## 介绍

[Nest](https://nestjs.com/)是 Node 最流行的企业级服务端开发框架，提供了 IOC、AOP、微服务等架构特性。

是前端同学尝试全栈开发的不二之选。

## Nest 项目初始化

Nest 项目初始化有两种方式：

1. 全局安装脚手架工具

   ```bash
   npm install -g @nestjs/cli
   next new xxx
   ```

2. 直接使用 npx 安装

   ```bash
   npx @nestjs/cli new xxx
   ```

安装完成后，控制台输入`nest`查看可以执行的命令：
![nest-all-commands](./images/nest-all-commands.png)

### 命令

#### new

用于初始化项目，更多配置可通过添加`-h`来查看帮助。接下来介绍的命令都可以通过`-h`来查看帮助。

```bash
# -h查看帮助
nest new -h
```

![nest-new-h](./images/nest-new-h.png)

可以看到`new`命令支持多种选项的设置，通过简写大概大概就能看出他们的意思：

- --directory：指定创建目录
- --skip-git：跳过 git 的初始化
- --skip-install：跳过 npm install
- --package-manager：指定包管理工具，指定后初始化项目时不用选择
- --language：指定语言，默认为 typescript
- --strict：是否开启严格模式

#### generate

类似于 plop 这种，`generate`命令可以帮助我们快速生成模板代码，并且自动更新依赖

#### build

使用 tsc 或者 webpack 构建代码，默认使用 tsc 构建，通过`--webpack`切换为使用 webpack 进行打包

```bash
nest build --webpack
```

#### nest-cli.json

项目创建完成后，会生成`next-cli.json`文件，以上说的选项都可在这里进行配置。

如设置使用 webpack 进行打包，设置`"webpack": true`即可

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true
  }
}
```

打包结果如下：

![nest-cli-json](./images/nest-cli-json.png)

#### start

用于启动开发服务，可以通过`--watch`启动监听

#### info

查看项目信息，包括系统信息、 node、npm 和依赖版本

![nest-info](./images/nest-info.png)

### 目录

项目初始化完成后，在 src 下存在 5 个文件：

```bash
.
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

#### main.ts

应用程序的入口文件，使用函数 `NestFactory.create(AppModule)` 创建 Nest 应用程序实例。

`AppModule`也就是根模块，可以类比为 Vue 的 App 根组件，`NestFactory.create`可以类比为 Vue 的`createApp`

#### app.module.ts

Nest 应用以模块 Module 为单元，Module 中包含两个核心：控制器和提供者。

App 模块即 Nest 应用的根模块，负责将所有的控制器和提供者组织到一起。

```ts
@Module({
  controllers: [AppController],
  providers: [AppService],
})
```

`@Module` 是装饰器语法，将 AppModule 类声明为一个模块。

#### app.controller.ts

App 模块的控制器层代码，用来接收 http 请求，调用服务层 service 处理后，返回响
应数据，**对应的 MVC 中的 C 层**

```ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
```

`@Controller` 装饰器将 AppController 声明为一个控制器
`@Get` 装饰器声明 getHello 是一个处理 Http 的 GET 请求的方法
`@Controller` 和 `@Get` 接收一个字符串用来拼接路由，如 `@Controller('hello')`和`@Get(world)`拼接出的路由就是`/hello/world`。示例代码默认为空，表示根路由`/`

#### app.service.ts

App 模块的服务层代码，主要用于处理业务逻辑，对应 MVC 中的 M 层

```ts
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
}
```

`@Injectable` 装饰器将 AppService 声明为提供者

getHello 方法，返回字符串`Hello, World!`，在控制器 AppController 调用此方法，最终这个字符串返回给到浏览器。

### 运行项目

此时，我们通过`npm run start`启动项目，在浏览器中输入 `localhost:3000` 如下：

![nest-origin-start](./images/nest-origin-start.png)

我们可以试着修改 AppController 中，添加不同的路由：

```ts
// app.controller.ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
  @Get('/random')
  getNum(): number {
    return this.appService.getNum()
  }
}
```

```ts
// app.service.ts
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
  getNum(): number {
    return Math.random() * 10
  }
}
```

此时需要重新运行项目（更新不会立即生效，需要更新立即生效时使用`npm run start:dev`启动项目）

再次访问`localhost:3000/random`，如下

![nest-watch-start](./images/nest-watch-start.png)

## Nest 实现五种 HTTP 数据传输方式

通过 `generate` 来快速创建 crud 模版代码：

```bash
nest generate resource person
```

![nest-generate-resource](./images/nest-generate-resource.png)

接着执行 `npm run start:dev` 来启动项目，一个简单的 crud 项目就启动了，在控制台打印中可以看到有这些接口可以使用：

![nest-crud-interface](./images/nest-crud-interface.png)

get 请求我们可以直接在浏览器中进行测试：

![nest-curd-get](./images/nest-curd-get.png)

**访问静态资源**

如果想访问静态资源，需要在 main.ts 中进行设置

```ts
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets('public', { prefix: '/static' })
  await app.listen(3000)
}
bootstrap()
```

接着在静态文件目录 public 下添加 index.html 文件，访问 `http://localhost:3000/static/index.html` 如下：

![nest-static-html](./images/nest-static-html.png)

### url param

url param 就是将 url 直接写在 url 上，比如 `http://localhost:3000/person/12`，其中 `12` 就是路径中的参数（url param）

在 Nest 中通过 `@Get(':id')` 和 `@Param('id')` 配合拿到它。

如上面创建的`person`模块中：

```ts
@Get(':id')
findOne(@Param('id') id: string) {
  return `received id: ${id}`;
  // return this.personService.findOne(+id);
}
```
