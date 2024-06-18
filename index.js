const fastify = require("fastify")({ logger: true });

const productService = require("./services/product-service");

fastify.get("/products", productService.findAll);
fastify.get("/products/:id", productService.findById);
fastify.post("/products", productService.create);
fastify.put("/products/:id", productService.update);
fastify.delete("/products/:id", productService.remove);
fastify.patch("/products/:id/buy", productService.buy);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});

module.exports = fastify;
