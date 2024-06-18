const request = require("supertest");
const app = require("../index").server;
const { test } = require("@jest/globals");
const { PrismaClient } = require("@prisma/client");

describe("Product service", () => {
  const prisma = new PrismaClient();

  beforeEach(async () => {
    await prisma.$executeRaw`DELETE FROM "products"`;
  });

  afterEach(async () => {
    await prisma.$disconnect();
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
      .send({ name: "Product 1", quantity: 10 });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ id: 1, name: "Product 1", quantity: 10 });
  });

  test("Should update a product", async () => {
    await prisma.product.create({ data: { name: "Product 1", quantity: 10 } });
    const response = await request(app)
      .put("/products/1")
      .send({ name: "Product 2", quantity: 20 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ id: 1, name: "Product 2", quantity: 20 });
  });

  test("Should return 404 when updating a non-existing product", async () => {
    const response = await request(app)
      .put("/products/999")
      .send({ name: "Product 2", quantity: 20 });
    expect(response.statusCode).toBe(404);
  });

  test("Should delete a product", async () => {
    await prisma.product.create({
      data: { name: "Product 1", quantity: 10, price: 100 },
    });
    const response = await request(app).delete("/products/1");
    expect(response.statusCode).toBe(204);
  });

  test("Should return 404 when deleting a non-existing product", async () => {
    const response = await request(app).delete("/products/999");
    expect(response.statusCode).toBe(404);
  });

  test("Should return 400 when product out of stock", async () => {
    await prisma.product.create({
      data: { name: "Product 1", quantity: 0, price: 100 },
    });
    const response = await request(app).patch("/products/1/buy");
    expect(response.statusCode).toBe(400);
  });

  test("Should buy a product", async () => {
    await prisma.product.create({
      data: { name: "Product 1", quantity: 1, price: 100 },
    });
    const response = await request(app).patch("/products/1/buy");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Product bought" });
  });

  test("Should return 404 when product not found", async () => {
    const response = await request(app).patch("/products/999/buy");
    expect(response.statusCode).toBe(404);
  });

  test("Given three products, when updating one and deleting another, then the updated product should be returned and the deleted product should not exist", async () => {
    await prisma.product.create({
      data: { name: "Product 1", quantity: 10, price: 100 },
    });
    await prisma.product.create({
      data: { name: "Product 2", quantity: 20, price: 200 },
    });
    await prisma.product.create({
      data: { name: "Product 3", quantity: 30, price: 300 },
    });
    const updateResponse = await request(app)
      .put("/products/2")
      .send({ name: "Product 2 Updated", quantity: 25 });
    const deleteResponse = await request(app).delete("/products/3");
    const getResponse = await request(app).get("/products");
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual({
      id: 2,
      name: "Product 2 Updated",
      quantity: 25,
    });
    expect(deleteResponse.statusCode).toBe(204);
    expect(getResponse.body).toEqual([
      { id: 1, name: "Product 1", quantity: 10 },
      { id: 2, name: "Product 2 Updated", quantity: 25 },
    ]);
  });
});
