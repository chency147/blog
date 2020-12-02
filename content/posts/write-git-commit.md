---
title: "写好 Git Commit Log"
date: 2020-12-03T02:24:42+08:00
draft: true
featuredImage: https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/cover.jpg
---
## 背景
公司部门开发团队今年开始将代码仓库从svn迁移到GitLab，迁移过程中我也进行了Git使用方式的分享，帮助团队的一些小伙伴了解了Git的历史和基本使用方法。
岁月静好，直至一次我在查找BUG时想追溯一次commit的关联任务时，发现当前团队没有一个git commit 信息的规范，有些提交信息甚是随意，查找任务只能摸索，实在令人头大。
本人甚是懒惰，不想在追溯任务的事情上多费功夫，所以规范 `git commit log` 这样的事情应当尽快提上日程。
## 思路
我认为规范这件事，需要首先 `确定规范`，再者为 `确保规范执行`。
### 确定适用团队的规范
目前社区中已经存在不少的 Git 提交规范示例，其中以 [AngularJs项目](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)的规范最为流行，本文也将以此作为参考进行介绍。
AngularJs的commit规范大致为如下形式：
```
<type>(<scope>): <subject>

<body>

<footer>
```
其中第一部分为 `header`，第二部分为 `body`，第三部分为 `footer`；
#### header
`header` 要求为一行，需要包含 `type`，`scope`, `subject` 字段，其总体内容需要控制在100个字符（中文则为50）以内，方便在 `GitHub`  或 `GitLab` 中查看，示例；
```
<feat>(login): 新增登录界面验证码验证
```
##### type
`type` 字段表示本次提交的类型，需要为下列值其中之一：
- `feat`: 新增功能特性；
- `fix`: BUG修复；
- `docs`: 只包含文档修改；
- `styles`: 不影响代码运行的变动，比如代码格式化、去掉空格等；
- `refactor`: 重构，既不是新增功能，也不是修复BUG；
- `pref`: 性能优化；
- `test`: 新增或者修改测试用例；
- `chore`: 构建工具或者辅助工具的变动，比如文档生成工具、CI配置等；
##### scope
`scope` 表示本次改动所影响的范围，可以是项目的模块名称，比如订单、用户信息等，根据业务具体配置；
当一次影响到多个 `scope` 时，可以填写一个 `*` 来表示；
##### subject
`subject` 用以简单介绍本次提交的改动内容，有以下规范：
- 使用动词开头，第一人称现在时：比如使用 `change` 而不是 `changed` 或 `changes`；
- 首字母小写（中文无此要求）；
- 不要使用句号结尾；
#### body
`body` 用来说明本次改动的具体内容，需要包含 `改动动机` 和 `改动的前后对比`，可以多行进行描述，示例：
```
本次将数据库插件从 mybatis 修改为 mybatis-plus；
减少XXX接口redis操作次数，从而提升接口性能；
```
#### footer
`footer` 用来描述 `不兼容改动` 和 `关联任务`；
- 不兼容改动
不兼容改动的描述需要以 `BREAKING CHANGE:` 开头，跟上一个空格，开始编写不兼容改动的简单说明，前两行用来填写该说明；
剩余部分则可用于进行具体描述，示例：
```
BREAKING CHANGE: 去掉XXX接口的路由，外部将无法请求该接口；

Before:

@RequestMapping("XXXX")
public Response XXX()

After:
@RequestMapping("XXXX")
public Response XXX()


因为该接口存在安全问题且目前不在被使用，所以进行下线处理；
```

- 关联任务
在 `GitHub` 中，使用 `Closes #123` 或者 `Closes #123, #234` 这样的标示语法关联issus；而针对我们自己，则可以用特定语法来关联其它的任务跟踪系统，如 `Jira`，则可以约定成 `@jira: XXXX-23456` 这样的形式；
#### Revert
如果本次提交时一个回退操作，需要将本次提交的内容以 `revert: ` 开头，然后跟上被回退的提交的 `header`；`body` 需要为特定的格式：`This reverts commit <hash>`，其中的 `<hash>` 为被回退的提价的SHA值。示例：
```
revert: feat(login): 新增登录短信验证码验证

this reverts commit a7dffaa3f7a79bc1aed3ee6135c80740e13de9ab
```

上述 AngularJs 的 Git 提交规范具有很好的**普适性**，我认为可以用作我们团队的规范；

### 确保规范执行
确保规范的执行必须使用工具，利用工具解决这两个问题即可：**生成符合规范的提交信息**、**提交信息的规范检查**，很幸运，这两点都有现成的开源解决方案：
- 提交信息生成：[commitizen/cz-cli](https://github.com/commitizen/cz-cli)
- 提交信息检查：[conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint)
- Git提交hook：[typicode/husky](https://github.com/typicode/husky)

## commitizen | 规范信息生成和提交
`commitizen/cz-cli` 是使用js编写命令行工具，所以执行它需要机器安装node环境；
### 安装
使用如下指令可全局安装该工具：
```bash
npm install -g commitizen
```
### 使用
使用指令 `git cz` 或 `git-cz` 代替 `git commit`，即可按照工具的提示进行提交，而且工具是具有一定的交互性，十分友好；
> **小贴士**
> `windows` 的 `git bash` 下使用需要使用指令 `winpty git-cz`，否则交互式操作会失效；
> 可以使用下面的指令来为之设置别名，下次直接使用 `git-cz` 就好啦；
> ```bash
> echo 'alias git-cz="winpty git-cz"' >> ~/.bashrc_profile; source ~/.bashrc_profile
> ```

#### 提交流程

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/git-cz-1.jpg)

#### git log 效果

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/git-log.jpg)

## cz-customizable | 客制化信息规范
可以发现，上面的指令是英文的，对于一些英文苦手而言不太友好，那么有没有可能我们可以将它的提示改成中文的呢？甚至把提示修改为更加符合我们的项目呢？
答案是肯定的，`cz-customizable` 这款工具为我们提供了方案；
### 安装
`cz-customizable` 同样是node的工具，可以使用npm指令直接安装；
这里我推荐直接全局安装和适配器指定，因为我们的项目都是node项目，全局安装可在其它任意技术栈内使用；
```bash
# 安装
npm install -g cz-customizable
# 全局指定cz适配器
touch ~/.czrc
echo '{ "path": "cz-customizable" }' > ~/.czrc
```

### 配置
插件官方的配置下载地址[在此](https://raw.githubusercontent.com/leoforfree/cz-customizable/master/cz-config-EXAMPLE.js)，我们可以在此基础上进行汉化以及定制处理，可通过[这个链接](/write-git-commit/cz-config.js)直接下载内容；

将配置文件命名为 `.cz-config.js` 放在工程的跟目录下，然后执行 `git cz` 即可看到效果；

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/husky-success.jpg)

可以看到提示都变成中文啦，`scope` 可以根据项目情况进行调整，而且 `footer` 我在这里更换为 `JIRA`，更加符合我们的工作流；

## commitlint | 信息规范检查
`commitlint` 也是使用js编写命令行工具，它需要搭配对应的适配器才能运作。我们这里由于存在自定义 `scope` 或者 `type` 的情况，只需要引入格式检查的适配器即可，这里选用相对宽松的检查适配器 `@commitlint/config-conventional`。

### 安装
安装指令如下：
```bash
npm install -g @commitlint/cli @commitlint/config-conventional
```
然后在自己的工程目录的根目录下执行如下指令指定适配器：
```bash
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```
### 验证
安装完毕之后，可以执行如下指令进行验证先前提交格式是否符合规范：
```bash
commitlint --from HEAD~1 --to HEAD --verbose
```

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/commitlint-1.jpg)

## husky | 确保提交前检查
`husky` 可以轻松地管理项目中的git钩子，其基本原理就是**将工程的 hooks 路径修改到项目的根目录下的 `.husky` 目录**，然后在此目录中管理 hooks 脚本，这些脚本可以被代码管理起来。

### 安装
可以使用如下指令进行安装，建议直接安装最新版本(v5)。
```bash
npm install husky@next -g
```
然后在工程的 `package.json` 中添加如下片段：
```json
  "scripts": {
    "postinstall": "husky install"
  }
```
这样可以在每次的 `npm install` 操作之后都能使得 hooks 路径被 husky 所修改。

### 添加 hook
执行如下指令即可完成 commit 信息的提交前检查：
```bash
husky add commit-msg "commitlint --edit $1"
```

### 验证 hook
执行一个携带非规范的信息提交，可以发现本地的提交已经会被拦截：

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/husky-failed.jpg)

通过 `cz-cli` 生成的信息则可以通过验证；

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/write-git-commit/husky-success.jpg)


## IDE集成
JetBrains IDEA 上可以安装插件 [Git Commit Template](https://plugins.jetbrains.com/plugin/9861-git-commit-template) 进行规范化的提交信息生成，喜欢用GUI客户端的同学可以尝试一下。

## 结语
- npm 社区真心强大，各种各样的工具都有，并且可以和其它技术栈结合使用；
- 先挖个坑，既然使用了工具生成标准的提交信息，那肯定可以由此生成 `changelog`，后面学习和介绍一下如何使用工具生成 `changelog` 信息；


