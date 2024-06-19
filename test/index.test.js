const request = require("supertest");
const app = require("../index").server;
const { test } = require("@jest/globals");
const { PrismaClient } = require("@prisma/client");

describe("Product service", () => {
  const prisma = new PrismaClient();

  beforeEach(async () => {
    await prisma.$executeRaw`DELETE FROM "products"`;
  });

  test("Should return all products", async () => {
    const response = await request(app).get("/products");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Should return 404 when getting a non-existing product", async () => {
    const response = await request(app).get("/products/999");
    expect(response.statusCode).toBe(404);
  });

  test("Should create a product", async () => {
    const response = await request(app)
      .post("/products")
      .send({ name: "Product 1", quantity: 10, price: 100 });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      name: "Product 1",
      quantity: 10,
      price: 100,
      description: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test("Should update a product", async () => {
    const product = await prisma.product.create({
      data: { name: "Product 1", quantity: 10, price: 100 },
    });
    const response = await request(app)
      .put(`/products/${product.id}`)
      .send({ name: "Product 2", quantity: 20 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: product.id,
      name: "Product 2",
      description: null,
      quantity: 20,
      price: 100,
      createdAt: product.createdAt.toISOString(),
      updatedAt: expect.any(String),
    });
  });

  test("Should return 404 when updating a non-existing product", async () => {
    const response = await request(app)
      .put("/products/999")
      .send({ name: "Product 2", quantity: 20 });
    expect(response.statusCode).toBe(404);
  });

  test("Should delete a product", async () => {
    const product = await prisma.product.create({
      data: { name: "Product 1", quantity: 10, price: 100 },
    });
    const response = await request(app).delete(`/products/${product.id}`);
    expect(response.statusCode).toBe(204);
  });

  test("Should return 404 when deleting a non-existing product", async () => {
    const response = await request(app).delete("/products/999");
    expect(response.statusCode).toBe(404);
  });

  test("Should return 400 when product out of stock", async () => {
    const product = await prisma.product.create({
      data: { name: "Product 1", quantity: 0, price: 100 },
    });
    const response = await request(app).patch(`/products/${product.id}/buy`);
    expect(response.statusCode).toBe(400);
  });

  test("Should buy a product", async () => {
    const product = await prisma.product.create({
      data: { name: "Product 1", quantity: 1, price: 100 },
    });
    const response = await request(app).patch(`/products/${product.id}/buy`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Product bought" });
  });

  test("Should return 404 when product not found", async () => {
    const response = await request(app).patch("/products/999/buy");
    expect(response.statusCode).toBe(404);
  });
});
