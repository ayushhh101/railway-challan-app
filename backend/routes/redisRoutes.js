// src/routes/redisTest.routes.js
const express = require("express");
const { setJson, getJson, incrWithTtl } = require("../services/redisBasic.service");

const router = express.Router();

router.get("/test-set-get", async (req, res, next) => {
  try {
    const key = "rail:demo:hello";
    await setJson(key, { msg: "hello from redis", at: Date.now() }, 60); 

    const value = await getJson(key);
    res.json({ key, value });
  } catch (err) {
    next(err);
  }
});

router.get("/test-counter", async (req, res, next) => {
  try {
    const key = "rail:demo:counter";
    const { count, ttl } = await incrWithTtl(key, 30); 
    res.json({
      key,
      count,
      ttlSeconds: ttl,
      note: "Counter resets after TTL expires",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
