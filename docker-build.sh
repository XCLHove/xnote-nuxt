#!/bin/bash

build_dir=".output"
if [ ! -d "$build_dir" ]; then
  npm run build || yarn run build || (echo "构建失败" && exit 1)
fi

version=$1
if [ -z "$version" ]; then
    version=$(date +1.%y%m%d.%H%M%S)
fi

tag=ghcr.io/xclhove/xnote-nuxt:$version
docker build . -t $tag
echo $GH_PAT | docker push $tag