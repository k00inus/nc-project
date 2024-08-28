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

describe("GET /api/users", () => {
  test("200: returns an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {        
        for (const user of users) {
          if (user !== 0) {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
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
          );
          expect(Object.keys(article).includes("body")).toBe(false);
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
          expect(comment.article_id).toBe(1);
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

describe("POST /api/articles/:article_id/comments", () => {
  test("201: adds a comment for an article", () => {
    const newComment = {
      username: "butter_bridge",
      body: "my new comment",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment.article_id).toBe(5);
        expect(Object.keys(comment).length).toBe(6);
        expect(comment.body).toBe(newComment.body);
        expect(comment.author).toBe(newComment.username);
      });
  });
  test("404: reject if article_id is wrong/invalid", () => {
    const newComment = {
      username: "butter_bridge",
      body: "my new comment",
    };
    return request(app)
      .post("/api/articles/555/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article_id 555 not found");
      });
  });
  test("422: username not supplied", () => {
    const newComment = {
      body: "my new comment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username is required");
      });
  });
  test("422: reject if a comment is omitted", () => {
    const newComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment is required");
      });
  });
  test("404: reject if username is wrong/invalid", () => {
    const newComment = {
      username: "random_name",
      body: "my new comment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username random_name not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: updates the article with the given id by increasing or decreasing the votes tally", () => {
    const newVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/articles/7")
      .send(newVotes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(7);
        expect(article.votes).toBe(newVotes.inc_votes);
      });
  });
  test("404: reject if article_id does not exist", () => {
    const newVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/articles/456")
      .send(newVotes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article_id 456 not found");
      });
  });
  test("400: reject if article_id is invalid", () => {
    const newVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/articles/banana")
      .send(newVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
  test("400: reject if no votes object is supplied", () => {
    const newVotes = {};
    return request(app)
      .patch("/api/articles/7")
      .send(newVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Input required");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes the comment with the given id", () => {
    return request(app).delete("/api/comments/7").expect(204);
  });
  test("404: reject if comment_id is wrong/invalid", () => {
    return request(app)
      .delete("/api/comments/643")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("comment_id 643 not found");
      });
  });
  test("400: reject if article_id is invalid", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
});
