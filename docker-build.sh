#!/bin/bash

build_dir=".output"
if [ ! -d "$build_dir" ]; then
  npm run build || yarn run build || (echo "构建失败" && exit 1)
fi

tag=ghcr.io/xclhove/xnote-nuxt:latest
docker build . -t $tag
echo $GH_PAT | docker push $tag