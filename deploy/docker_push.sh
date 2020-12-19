user="$DOCKER_USERNAME"
pass="$DOCKER_PASSWORD"
image="$DOCKER_USERNAME/howezt-memoria:latest"

echo "$pass" | docker login -u "$user" --password-stdin
docker pull $image || true
docker build -t $image --cache-from $image
docker push $image
