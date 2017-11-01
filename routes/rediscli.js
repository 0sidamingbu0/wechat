var redis = require("redis");

var RedisRepository = function () {
                RedisRepository.redisClient = redis.createClient({
                host: "localhost",
                port: 6379
                });
                 RedisRepository.redisClient.auth("thought");
		return RedisRepository;
 };

    RedisRepository.hsetFn = function (key, field, value, callback) {
        RedisRepository.redisClient.hset(key, field, value, function (error, result) {
            callback(error, result);
        });
    };
    RedisRepository.hmsetFn = function (key, value, callback) {
        RedisRepository.redisClient.hmset(key, value, function (error, result) {
            callback(error, result);
        });
    };
    RedisRepository.hgetFn = function (key, field, callback) {
        RedisRepository.redisClient.hget(key, field, function (error, result) {
            callback(error, result);
        });
    };
    RedisRepository.hgetallFn = function (key, callback) {
        RedisRepository.redisClient.hgetall(key, function (error, result) {
            callback(error, result);
        });
    };
    RedisRepository.hdelFn = function (key, field, callback) {
        RedisRepository.redisClient.hdel(key, field, function (error, result) {
            callback(error, result);
        });
    };
    RedisRepository.lpopFn = function (key, cb) {
        RedisRepository.redisClient.lpop(key, function (error, result) {
            cb(error, result);
        });
    };
    RedisRepository.lpushFn = function (key, value, cb) {
        RedisRepository.redisClient.lpush(key, value, function (error, result) {
            cb(error, result);
        });
    };
    RedisRepository.lrangeFn = function (key, start, end, cb) {
        RedisRepository.redisClient.lrange(key, start, end, function (error, result) {
            cb(error, result);
        });
    };

RedisRepository.set = function (key,value, cb) {
        RedisRepository.redisClient.set(key, value, function (error, result) {
            cb(error, result);
        });
    };
RedisRepository.get = function (key, cb) {
        RedisRepository.redisClient.get(key, function (error, result) {
            cb(error, result);
        });
    };

 

module.exports = RedisRepository;
