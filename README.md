下面是将您的命令转换为适合 GitHub 的 `README.md` 文件格式的写法：

````markdown
# Docker 安装 GoProxy 和 Xray 实现代理服务

此脚本将帮助您在 Docker 中安装并配置 GoProxy 和 Xray，并使其以代理服务的形式运行。

## 安装 Docker

首先，您需要安装 Docker。可以运行以下命令来安装：

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
````

## 启动 GoProxy 容器

安装完 Docker 后，您可以通过以下命令启动 GoProxy 容器：

```bash
docker run -d --name goproxy --restart always --network host stilleshan/goproxy sh -c '/proxy http -p :11111 & /proxy socks -p :22222'
```

## 启动 Xray 容器

设置 Xray 的端口并运行容器：

```bash
EXTERNAL_PORT=33333
docker run -d --name xray_reality --restart=always --log-opt max-size=100m --log-opt max-file=3 -p $EXTERNAL_PORT:443 -e EXTERNAL_PORT=$EXTERNAL_PORT wulabing/xray_docker_reality:latest
```

## 获取 Xray 配置信息

运行 Xray 容器后，您可以通过以下命令查看 Xray 配置信息：

```bash
sleep 3
docker exec -it xray_reality cat /config_info.txt
```

该命令会返回 Xray 配置文件中的相关信息，您可以根据需要进一步配置和使用 Xray 代理。

## 参考

* [GoProxy 官方 Docker 镜像](https://hub.docker.com/r/stilleshan/goproxy)
* [Xray 官方 Docker 镜像](https://hub.docker.com/r/wulabing/xray_docker_reality)

```

在 `README.md` 文件中使用这种格式可以帮助其他开发者更好地理解如何使用该命令及其配置。如果有进一步的需求，您可以根据实际情况调整此文件中的说明。
```
