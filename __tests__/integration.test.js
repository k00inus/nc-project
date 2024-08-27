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

describe("GET /api/articles", () => {
  test("200: returns an articles array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        for (const article of articles) {
          expect(article).toEqual(
            expect.objectContaining({
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              article_id: expect.any(Number),
              comment_count: expect.any(Number),
            })
          )
          expect(Object.keys(article).includes("body")).toBe(false)
        }
      });
  });
  test("200: returns an array of article objects sorted by, date", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
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

describe("GET /api/articles/:article_id/comments", () => {
  test("200: returns an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        for (const comment of comments) {
          expect(comment.article_id).toBe(1)
          expect(comment).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_id: expect.any(Number),
              article_id: expect.any(Number),
            })
          );
        }
      });
  });
  test("200: returns an array array of comments sorted by date", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("200:valid article_id but no comments, returns an empty array", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test("404: wrong article_id", () => {
    return request(app)
      .get("/api/articles/100/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article_id 100 not found");
      });
  });
  test("400: reject if article_id is wrong/invalid", () => {
    return request(app)
      .get("/api/articles/1random-input/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
});