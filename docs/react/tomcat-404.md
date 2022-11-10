---
date: 2022-6-10
title: React项目部署在tomcat容器刷新404问题
tags:
  - react
describe: React项目部署在tomcat容器刷新404问题
---
  
解决方法：

在`tomcat/webapps/ROOT`下添加`WEB-INF/web.xml`文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                    http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
version="3.1"
metadata-complete="true">

    <error-page>
        <error-code>404</error-code>
        <location>/index.html</location>
    </error-page>

</web-app>
```
