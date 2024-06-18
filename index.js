const fastify = require("fastify")({ logger: true });

const productService = require("./services/product-service");

fastify.get("/products", productService.findAll);
fastify.get("/products/:id", productService.findById);
fastify.post("/products", productService.create);
fastify.put("/products/:id", productService.update);
fastify.delete("/products/:id", productService.remove);

module.exports = fastify;
