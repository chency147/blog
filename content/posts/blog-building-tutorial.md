---
title: "hugo + GitHub Webhook 博客搭建教程"
date: 2020-09-12T13:46:44+08:00
lastmod: 2020-09-12T13:46:44+08:00
draft: ture
toc:
  auto: false
---

## 写在前面

搭建博客这个过程，我曾经操作过不下十遍，但是每次因为VPS到期或者重装忘记备份，内容亡佚。后来在 `简书` 上创建了账号，也更新了几篇文章，但是这个平台一点都不极客，没有什么技术韵味，再加之平时工作忙碌不堪，当初更新博客这样的热情也渐渐地退却。

后来工作越久越是发觉，身边厉害的同事以及行业内的技术大牛，总是有着非凡的总结能力，而这也是我自己所欠缺的。最近在工作、编码中遇到的坑，可能事发时做了一下总结，但是由于没有良好记录，过段时间便又被抛在脑后，于是反复踩坑，毕竟*好记性不如烂笔头*嘛；还有学习技术过程中的感想和感悟，也缺乏记录总结，学习效果不明显。看起来，搭建博客并且定时更新博客这件事情亟待提上日程~

所以搭建本博客的目的为：**给自己创建一个可以日常做总结的平台，培养自己的总结能力，达到自我技术提升**。

至于为什么不选择 `CSDN`、`cnblog` 这样的平台？

第一点，`CSDN` 是我最不喜欢的博客平台，广告太多，而且给我的印象是上面的文章都特别水，各种转载，虽然SEO做得好，但是搜索引擎第一页结果往往*千篇一律甚至连内容都一模一样*，对其天然没有好感，甚至有时候谷歌搜索时直接排除掉它的结果，比如这样搜索 `phpredis 安装 -site:csdn.net`;

第二点，我自己有域名和VPS，希望可以把它们利用起来，毕竟每年都在交钱呢，而且自己的域名很有个性嘛。


## 技术选型
### 博客引擎(hugo)
[hugo](https://gohugo.io/) 是我最近了解到的博客程序，它可以将书写的 markdown 格式内容转成 html 文件，以静态文件的形式组织博客文章，还可以支持自定义主题，性能好、美观、渲染速度快，特别适用于我这样小水管型的VPS；作为一枚PHP程序员，之前的博客都是用 `WordPress` 或者 `Typecho`，使用它们就不得不在服务器上安装和启动 `php-fpm` 和 `mysql` 服务，对于小水管来说它们还是太重了；

### Web容器(nginx)
这里我推荐直接安装使用 [OpenResty®](https://openresty.org/cn/)；

### 内容上传和发布(GitHub + WebHook)
文章的撰写其实和写代码差不多，我希望我写博客的中的任何修改都能够被记录到，作为程序员，第一个想到能应对这样的需求的就是用 [Git](https://git-scm.com/) 做版本控制了，而且有 [GitHub](https://github.com/) 这样免费的代码托管平台任君使用，怎么闻都香。
还有一个非常重要的原因，`hugo` 是将 markdown 文件转成 html 资源来提供浏览的，这其实可以看作是一个编译过程，我不可能把编译的产物提交到仓库，因为这样做实在太挫了。

`GitHub` 提供了 `WebHook` 功能，可以通知我们的程序有新的提交，利用这个功能，我们可以很容易地实现博客的持续集成写作；

`WebHook` 的服务端可以直接使用 [adanh/webhook](https://github.com/adnanh/webhook) 这个项目，它可以帮助我们很轻松地开启一个 webhook 的服务端，并且自己帮忙做好了安全校验；

### 部署结果通知(Server酱)
上面说到我们要利用 `WebHook` 功能实现持续集成，这里面的部署结果我们需要怎么知晓呢？总不可能我每次都上服务器来查看吧？

幸运的是，已经有大牛提供了 [Server酱](https://sc.ftqq.com/) 通知服务，免费使用而且接入简单，可以利用微信消息推送给我们部署结果。


### 其他
本人 [vim](https://www.vim.org/) 党，markdown 使用 `vim` 进行书写，平时使用 `hugo` 自带的实时预览功能或者 [Typora](https://typora.io/) 进行页面效果查看；

## 博客搭建
### Openresty 安装和启动
Openresty的安装教程可以在[官方文档](https://openresty.org/cn/installation.html)，这里只简单例举一下 centos 上的安装方法，推荐直接使用官方编译好的 Linux包进行安装([官方文档](https://openresty.org/cn/linux-packages.html))；

安装指令参考如下
```
# 添加 openresty yum 源
wget https://openresty.org/package/centos/openresty.repo
sudo mv openresty.repo /etc/yum.repos.d/
# 更新 yum 源
sudo yum check-update
# 安装 openresty
sudo yum install -y openresty
```

安装完毕之后，可直接使用指令 `/usr/local/openresty/nginx/sbin/nginx` 启动 nginx 服务；

记录两条常用的 nginx 指令如下
```
# 检查 nginx 配置是否正确
/usr/local/openresty/nginx/sbin/nginx -t
# 检查并重新载入 nginx 配置
/usr/local/openresty/nginx/sbin/nginx -s reload
```

### HTTPS 支持
HTTPS 支持有两种，CDN方式 和 申请SSL证书方式。
#### CDN方式（推荐）
推荐直接使用 [Cloudﬂare](https://www.cloudflare.com/) 管理的域名，它可以帮助我们非常方便地支持 HTTPS；

![Cloudflare HTTPS 配置界面](https://wx1.sbimg.cn/2020/09/12/9UKWK.jpg)

#### SSL证书方式
可使用免费的 [Let's Entrypt](https://letsencrypt.org/zh-cn/) 进行申请，现在已经支持申请泛域名。相关指令收录如下：
```
# 下载证书申请工具
wget https://dl.eff.org/certbot-auto
chmod +x certbot-auto
# 移动程序到自己喜欢的位置
mkdir /var/opt/letsencrypt/
mv certbot-auto /var/opt/letsencrypt/letsencrypt-auto

# 执行申请，-d 参数内容应该替换为你自己的域名，这里使用DNS的方式进行校验
/var/opt/letsencrypt/letsencrypt-auto certonly --preferred-challenges dns --manual -d "*.rickchen.info" --server "https://acme-v02.api.letsencrypt.org/directory"

# Are you OK with your IP being logged? 这个问题直接填入Yes
# 随后程序会提示要求在自己域名下面添加一条TXT类型的解析记录，按照提示在自己的域名运营商后台操作即可


# 稍等片刻（我等了5分钟左右让域名解析生效）之后按下回车即可完成申请
```
完成申请之后提示如下
```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/rickchen.info/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/rickchen.info/privkey.pem
   Your cert will expire on 2020-12-10. To obtain a new or tweaked
   version of this certificate in the future, simply run
   letsencrypt-auto again. To non-interactively renew *all* of your
   certificates, run "letsencrypt-auto renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```
上面提示中说明了证书所在位置，直接在nginx的443端口server中添加如下配置再reload即可
```
server {
    listen       443 ssl;
    server_name  blog.rickchen.info;

    ssl_stapling on; 
    ssl_stapling_verify on; 
    ssl_trusted_certificate /etc/letsencrypt/live/rickchen.info/fullchain.pem;
    ssl_certificate      /etc/letsencrypt/live/rickchen.info/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/rickchen.info/privkey.pem;

    # 后续配置省略...
}
```
`Let's Encrypt`的证书只有3个月的有效期，所以我们必需要定时地为其续期，这里可以用linux系统的crond进行定时执行。
- 定义 `post_hook`，这一步是为了让更新程序支持在续期完证书之后自动reload nginx。上述域名申请之后，更新相关的配置存放在 `/etc/letsencrypt/renewal/rickchen.info.conf`，打开在最后添加如下配置行即可；
```
post_hook = /usr/local/nginx/sbin/nginx -s reload
```

- 添加定时任务，`vim /etc/crontab` 添加下面配置即可，注意系统的crond服务需要开启；
```
# 每天凌晨2点检查并续期HTTPS证书
0 2 * * * root /var/opt/letsencrypt/letsencrypt-auto renew -q > /dev/null 2>&1 &
```

### Hugo 安装
直接在 [Hugo Release](https://github.com/gohugoio/hugo/releases) 页面中下载最新的、适用于自己操作系统的二进制包即可。服务器和自己的电脑上都应该安装一下。

以 centos 为例，执行以下指令即可完成安装：
```
# 注意替换成最新的版本链接，编写本文时最新的版本为0.74.3
wget "https://github.com/gohugoio/hugo/releases/download/v0.74.3/hugo_0.74.3_Linux-64bit.tar.gz"
# 解压
tar -zxvf hugo_0.74.3_Linux-64bit.tar.gz -C .
mv hugo /usr/local/bin/
```

hugo 安装完毕之后，可以先确定好自己博客文件的存放路径，把 nginx 配置设置好，以我的博客为例，执行如下指令创建目录；
```
mkdir /var/www/blog
```
这里推荐大家修改一下这个文件夹的用户所属，因为后面的 webhook 功能需要执行博客更新指令，用 root 用户会有风险；
```
groupadd blog
usradd blog -g blog
chown -R blog:blog /var/www/blog/ 
```

然后修改 nginx 配置的 root 为 `/var/www/blog/public/`，并 reload；

### GitHub 项目创建
本博客的内容维护在 [chency147/blog](https://github.com/chency147/blog)。大家可以在自己的 GitHub 上创建自己的一个博客工程，拉取到本地之后就可以开始创作了。
```
# 仓库克隆
git clone git@github.com:chency147/blog.git
# 初始化博客
hugo new site blog
# 进入目录
cd blog
```

执行到此，即可进行创作以及主题的修改，本文目前使用的主题为 [LoveIt](https://github.com/dillonzq/LoveIt)，大家可按照其 [文档](https://hugoloveit.com/zh-cn/theme-documentation-basics/) 进行配置；

- 注意
上面的仓库拉取方式为 SSH 方式，需要将在自己电脑上生成SSH钥匙对，并将公钥上传到 GitHub 的 [个人配置](https://github.com/settings/keys)。
没有钥匙生成过对的同学的同学可以在 `Git Bash` 中执行如下指令生成并查看
```
ssh-keygen
# 一路回车到底
cat ~/.ssh/id_rsa.pub
# cat 指令输出即为公钥内容
```
将上述输出的公钥内容拷贝并添加到 GitHub SSH Key 管理页面中：
![9i3Xa.jpg](https://wx1.sbimg.cn/2020/09/12/9i3Xa.jpg)
<center style="font-size:14px;color:#C0C0C0;text-decoration:underline">SSH KEY添加[1]</center> 

![9iPxM.jpg](https://wx1.sbimg.cn/2020/09/12/9iPxM.jpg)
<center style="font-size:14px;color:#C0C0C0;text-decoration:underline">SSK KEY添加[2]</center> 

由于服务器端也需要拉取工程内容，所以服务器端 blog 用户的公钥也需要添加到GitHub配置中。

下面完成博客的首次提交
```
#
hugo new post/hello-world.md
git add -A
git commit -m "Hello World"
git push -u origin master
```

### 博客首次亮相
登录到服务器，执行指令 `su blog` 切换到 blog 用户，执行如下指令拉取工程并使用hugo生成页面文件：
```
cd /var/www/blog
git clone git@github.com:chency147/blog.git .
git submodule update
hugo -D
```

这个时候访问我们自己的博客域名，是不是有内容呈现出来了呢？

### GitHub WebHook 使用
#### 服务端
推荐直接使用 [adnanh/webhook](https://github.com/adnanh/webhook) 项目搭建webhook服务。

##### webhook服务安装
```
wget "https://github.com/adnanh/webhook/releases/download/2.7.0/webhook-linux-amd64.tar.gz"
tar -zxvf webhook-linux-amd64.tar.gz -C .
mv webhook-linux-amd64/webhook /usr/local/bin/
```
##### 部署脚本编写
以我的博客为例，我的部署脚本存放在 `/var/www/blog_deploy.sh`，其作用为 从git仓库中拉取最新的博客内容，并使用 hugo 进行编译，其内容如下：
```
#!/bin/bash
cd /var/www/blog
git checkout master
git pull
git submodule update
hugo -D
```

主要不要忘记 `chmod +x /var/www/blog_deploy.sh` 赋予它可执行权限。

##### webhook配置编写
配置文件位于 `/etc/webhook/hooks.json`，使用vim打开键入如下内容并保存；
```
[
  {
    "id": "blog_deploy",
    "execute-command": "/var/www/blog_deploy.sh",
    "command-working-directory": "/var/www/blog",
    "trigger-rule":
    {
      "and":
      [
        {
          "match":
          {
            "type": "payload-hash-sha1",
            "secret": "这里填写你自己在GitHub WebHook配置页面上填写的密码",
            "parameter":
            {
              "source": "header",
              "name": "X-Hub-Signature"
            }
          }
        },
        {
          "match":
          {
            "type": "value",
            "value": "refs/heads/master",
            "parameter":
            {
              "source": "payload",
              "name": "ref"
            }
          }
        }
      ]
    }
  }
]
```

##### webhook服务启动
切换到 blog 用户，执行如下指令启动webhook服务；
```
nohup webhook -port 9001 -ip 127.0.0.1 -hooks /etc/webhook/hooks.json > /dev/null 2>&1 &
```

优秀的同学可以使用 `supervisord` 进行进程守护，本文将不再赘述，只是贴一下配置文件内容；
```
[program:WebHook]
command = webhook -port 9001 -ip 127.0.0.1 -hooks /etc/webhook/hooks.json
autorestart = true
autostart = true
startretries = 2
numprocs = 1
stderr_logfile = /dev/null
stdout_logfile = /dev/null
stopsignal = KILL
stopsignal = INT
user = blog
```

##### webhook服务nginx转发
在自己的 nginx 配置中添加如下转发配置并reload，这个路径完全可以根据自己的喜好自定义；
```
location ~ ^/XXXXXXXX/webhook/(.*) {
    proxy_pass http://127.0.0.1:9001/$1;
}
```


#### GitHub端
进入仓库的 Settings 页卡，选择 Webhooks 选项，在页面上进行 webhook 添加；

![9nkfJ.jpg](https://wx2.sbimg.cn/2020/09/12/9nkfJ.jpg)
![9nDSd.jpg](https://wx1.sbimg.cn/2020/09/12/9nDSd.jpg)

执行完上述配置之后，我们随便修改一下文章内容，然后进行一次Git提交和推送，博客的文章就能自动更新啦！


## 总结
以上就是本博客搭建的整个过程了，花费的时间并不算多，大概半天的时间即可折腾出来。

但是将上述过程整理成本篇文章花费了不少时间，毕竟社畜一枚，平时太忙了。

好了，博客搭建完成了，希望自己能够持续学习，不断总结，一直进步。
