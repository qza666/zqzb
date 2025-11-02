```bash
curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh && \
docker run -d --name goproxy --restart always --network host stilleshan/goproxy sh -c '/proxy http -p :11111 & /proxy socks -p :22222' && \
EXTERNAL_PORT=33333 && docker run -d --name xray_reality --restart=always --log-opt max-size=100m --log-opt max-file=3 -p $EXTERNAL_PORT:443 -e EXTERNAL_PORT=$EXTERNAL_PORT wulabing/xray_docker_reality:latest && \
sleep 3 && \
docker exec -it xray_reality cat /config_info.txt
```
