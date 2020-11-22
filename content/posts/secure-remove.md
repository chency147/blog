---
title: "Linux下的文件安全删除"
date: 2020-09-24T01:44:54+08:00
draft: true
toc:
  auto: false
# featuredImage: https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/secure-remove/cover.jpg
---

{{< admonition danger >}}
rm -rf /
{{</admonition>}}

这是一条运维、程序员都非常忌惮的指令。当我们登录root用户或者拥有root权限的时候，一股毁灭世界的力量也被赋予。我曾亲眼见证过身边的同事在我们的开发环境中敲下这一行指令，随着而来的就是开发环境的**宕机**，**数据丢失**，**一下午的开发停滞**。

为了减少悲剧再次上演的几率，我们有必要对 `rm` 指令进行调整。

网络上流传着的解法皆大同小异，基本思路都是使用回收站命令替代 `rm`，再用计划任务定时清理回收站，但是我并不喜欢这样的操作，因为我很明确地想要删除这批文件，我想让它们即刻消失，不再占据我的磁盘空间。

所以我的需求逐渐明了：规避掉高危删除操作的同时，支持文件立即删除。

好在互联网上志同道合的同学不胜枚举，原来早有大神有这样的需求和想法，并且得以实现，并把成果发表在了[博客](https://www.dwhd.org/20150816_015727.html)中，感谢大神。

我在此将其用法整理如下。

### 脚本源码
```bash
#!/bin/bash
# rm指令参数
RMARGS="${@}"
# rm指令绝对路径
RMPATH="/bin/rm"
# 列出根目录下的文件，并将它们拼接，用空格隔开
sys1dir=$(ls / | sed 's/^/\//'|paste -s -d " ")

# 如果删除参数为空并且rm指令不存在，则直接退出
[ "${RMARGS}" == "" ] && ${RMPATH} && exit

# 输出错误提示并退出
SBRUN() {
    echo -ne "\033[41;37mWhy run this command\033[0m\n"
    exit 255 
}

# 判断是否是在删除根目录
if grep "$sys1dir" <<< $RMARGS >/dev/null 2>&1; then
    SBRUN;
fi

# 检查删除目录里面是否包含根目录
for i in ${@}; do [ "$i" = "/" ] && SBRUN; done

if [ "${RMARGS}" == '-h' ] || [ "${RMARGS}" == '--help' ]; then
    # 显示帮助文档
    ${RMPATH} ${RMARGS}
else
    # 要求输入yes才真正执行删除
    while [ "${confirm}" != "yes" ] && [ "${confirm}" != "no" ]; do
        echo -ne "You are going to execute \"${RMPATH} \033[41;37m${RMARGS}\033[0m\",please confirm (yes or no):"
        read confirm
    done
    # 执行删除
    [ "${confirm}" == "yes" ] && ${RMPATH} ${RMARGS} || exit
fi
```

### 用法
拷贝上述脚本内容，在服务器上 `vim /usr/bin/securityremove` 新建文件粘贴，并保存，接着依次执行如下命令
```bash
# 赋予执行权限
chmod +x /usr/bin/securityremove
# 命令替代
echo 'alias rm="/usr/bin/securityremove"' >> /etc/bashrc
. /etc/bashrc
```

随后使用 rm 指令删除操作就会有确认和检查了~

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/secure-remove/command-1.jpg)

![](https://cdn.jsdelivr.net/gh/chency147/image-bed@main/img/secure-remove/command-2.jpg)

### 已知问题
如果文件名中带有空格时会删除失败，这时候需要用 `\rm` 指令来进行删除。
