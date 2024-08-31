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
        expect(users.length).toBe(4);
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
  test("200: returns an array of article objects sorted by a valid column name in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", {
          descending: true,
        });
      });
  });
  test("200: returns an array of article objects sorted by a valid column name in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("comment_count", {
          ascending: true,
        });
      });
  });
  test("200: returns an array of article objects in ascending or descending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          ascending: true,
        });
      });
  });
  test("200: returns an array of filtered article objects with the topic value specified in the query", () => {
    const topic = "mitch";
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(10);
        for (const article of articles) {
          expect(article.topic).toBe(topic);
        }
      });
  });
  test("200: returns an empty array if topic exists but no entries", () => {
    const topic = "paper";
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
      });
  });
  test("200: returns an array article objects limited by the number specified in the limit query ", () => {
    const limit = 5;
    return request(app)
      .get("/api/articles?topic=cats&limit=5&p=1")
      .expect(200)
      .then(({ body: { articles } }) => {
        if (articles.length < limit) {
          expect(articles.length).toBe(articles.length);
        } else {
          expect(articles.length).toBe(limit);
        }
      });
  });
  test("200: returns an array article objects page by the number specified in the page query ", () => {
    const p = 2;
    const limit = 10;
    return request(app)
      .get("/api/articles?topic=mitch&p=2")
      .expect(200)
      .then(({ body: { articles } }) => {
        if (articles.length < limit) {
          expect(articles.length).toBe(articles.length);
        } else {
          expect(articles.length).toBe(limit);
        }
      });
  });
  test("400: reject if column name (sort_by) is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=username")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
  test("404: reject if topic does not exist", () => {
    const topic = "invalidtopic";
    return request(app)
      .get("/api/articles?topic=invalidtopic&limit=4")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`Topic ${topic} not found`);
      });
  });
  test("400: reject if order query (e.g., order=test) is invalid", () => {
    return request(app)
      .get("/api/articles?order=random")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: returns an article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(
        ({
          body: {
            article: [content],
          },
        }) => {
          expect(content.comment_count).toBe(11);
          expect(content).toEqual(
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
        }
      );
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

describe("GET /api/users/:username", () => {
  test("200: returns an article object", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then(
        ({
          body: {
            user: [content],
          },
        }) => {
          expect(content.username).toBe("icellusedkars");
          expect(typeof content.avatar_url).toBe("string");
          expect(typeof content.name).toBe("string");
        }
      );
  });
  test("404: wrong username", () => {
    const username = "icellusedka";
    return request(app)
      .get("/api/users/icellusedka")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`username ${username} not found`);
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
  test("200: returns an array comment objects limited by the number specified in the limit query ", () => {
    const limit = 5;
    return request(app)
      .get("/api/articles/4/comments?limit=5&p=1")
      .expect(200)
      .then(({ body: { comments } }) => {
        if (comments.length < limit) {
          expect(comments.length).toBe(comments.length);
        } else {
          expect(comments.length).toBe(limit);
        }
      });
  });
  test("200: returns an array comment objects by the given page number specified in the query ", () => {
    const limit = 10;
    const p = 3;
    return request(app)
      .get("/api/articles/1/comments?p=3")
      .expect(200)
      .then(({ body: { comments } }) => {
        if (comments.length < limit) {
          expect(comments.length).toBe(comments.length);
        } else {
          expect(comments.length).toBe(limit);
        }
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
  test("400: reject if limit or page value is not a number", () => {
    const limit = "set";
    const p = 1;
    return request(app)
      .get("/api/articles/1/comments?limit=set&p=3")
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
describe("POST /api/articles", () => {
  test("201: adds a new article", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "my new article",
      body: "my new article body",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article.topic).toBe(newArticle.topic);
        expect(article.title).toBe(newArticle.title);
        expect(Object.keys(article).length).toBe(9);
        expect(article.body).toBe(newArticle.body);
        expect(article.author).toBe(newArticle.author);
        expect(article.comment_count).toBe(0);
      });
  });
  test("404: reject if username is wrong/invalid", () => {
    const newArticle = {
      author: "butter_bridg",
      title: "my new article",
      body: "my new article body",
      topic: "random",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username butter_bridg not found");
      });
  });
  test("404: reject if topic is wrong/invalid", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "my new article",
      body: "my new article body",
      topic: "random",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("slug random not found");
      });
  });
  test("422: topic not supplied", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "my new article",
      body: "my new article body",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article topic is required");
      });
  });
  test("422: author not supplied", () => {
    const newArticle = {
      title: "my new article",
      body: "my new article body",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username is required");
      });
  });
  test("422: reject if the title is omitted", () => {
    const newArticle = {
      author: "butter_bridge",
      body: "my new article body",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article title is required");
      });
  });
  test("422: reject if the body is omitted", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "my new article",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article body is required");
      });
  });
});
describe("POST /api/topics", () => {
  test("201: adds a new topic", () => {
    const newTopic = {
      slug: "My new topic",
      description: "about my new topic",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic.slug).toBe(newTopic.slug);
        expect(topic.description).toBe(newTopic.description);
        expect(Object.keys(topic).length).toBe(2);
      });
  });

  test("422: topic not supplied", () => {
    const newTopic = {
      description: "about my new topic",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Topic slug is required");
      });
  });
  test("422: description not supplied", () => {
    const newTopic = {
      slug: "My new topic",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Topic description is required");
      });
  });
  test("422:reject if topic already exists", () => {
    const newTopic = {
      slug: "paper",
      description: "about my new topic",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(422)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`Topic ${newTopic.slug} already exists`);
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
describe("PATCH /api/comments/:comment_id", () => {
  test("200: updates the votes property on a comment object with the given id by increasing or decreasing the votes tally", () => {
    const newVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/comments/7")
      .send(newVotes)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.comment_id).toBe(7);
        expect(comment.votes).toBe(newVotes.inc_votes);
      });
  });
  test("404: reject if comment_id does not exist", () => {
    const newVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/comments/456")
      .send(newVotes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("comment_id 456 not found");
      });
  });
  test("400: reject if comment_id is invalid", () => {
    const newVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/comments/banana")
      .send(newVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
  test("400: reject if no votes object is supplied", () => {
    const newVotes = {};
    return request(app)
      .patch("/api/comments/7")
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
  test("400: reject if comment_id is invalid", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: delete an article based on the given id, and its respective comments", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });
  test("404: reject if article_id is wrong/invalid", () => {
    return request(app)
      .delete("/api/articles/643")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article_id 643 not found");
      });
  });
  test("400: reject if article_id is invalid", () => {
    return request(app)
      .delete("/api/articles/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid request");
      });
  });
});
