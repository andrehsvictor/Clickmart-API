const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const findAll = async (req, reply) => {
  const products = await prisma.product.findMany();
  reply.send(products);
};

const findById = async (req, reply) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  product ? reply.send(product) : reply.status(404).send();
};

const create = async (req, reply) => {
  const product = await prisma.product.create({ data: req.body });
  reply.status(201).send(product);
};

const update = async (req, reply) => {
  const { id } = req.params;
  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: req.body,
  });
  product ? reply.send(product) : reply.status(404).send();
};

const remove = async (req, reply) => {
  const { id } = req.params;
  const product = await prisma.product.delete({
    where: { id: parseInt(id) },
  });
  reply.status(204).send();
};

const buy = async (req, reply) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });
  if (product.quantity > 0) {
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { quantity: product.quantity - 1 },
    });
    reply.send({ message: "Product bought" });
  } else {
    reply.status(400).send({ message: "Product out of stock" });
  }
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
