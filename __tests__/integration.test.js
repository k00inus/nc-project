const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const request = require("supertest");
const app = require("../app/app");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: serves up a json representation of all the available endpoints of the api", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { apis } }) => {
        apiArray = [];
        for (const key in apis) {
          apiArray.push(apis[key]);
        }

        for (const api of apiArray.slice(1)) {
          if (api.length !== 0) {
            expect(api).toEqual(
              expect.objectContaining({
                description: expect.any(String),
                queries: expect.arrayContaining([]),
                exampleResponse: expect.objectContaining({}),
              })
            );
          }

        }
      });
  });
});

describe("GET /api/topics", () => {
  test("200: returns an array of the topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        for (const topic of topics) {
          if (topic !== 0) {
            expect(topic).toEqual(
              expect.objectContaining({
                description: expect.any(String),
                slug: expect.any(String),
              })
            );
          }

        }
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: returns an article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {        
        expect(article[0]).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            article_id: expect.any(Number),
          })
        );
      });
  });
  test("404: wrong article_id", () => {
    return request(app)
      .get("/api/articles/100")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("400: reject if article_id is wrong/invalid", () => {
    return request(app)
      .get("/api/articles/1random-input")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
});
