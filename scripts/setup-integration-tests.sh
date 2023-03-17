DIR=$(dirname $0)

pushd $DIR 
cd ..
docker compose -f docker-compose-test.yml up -d
