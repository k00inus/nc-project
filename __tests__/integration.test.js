const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const request = require("supertest");
const app = require("../app/app");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("GET /api/treasures", () => {
    test("200: returns an array of the topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {            
            for (const topic of topics) {
                expect(topic).toEqual(
                    expect.objectContaining({
                      description: expect.any(String),
                      slug: expect.any(String),
                    })
                  );
            }
        });
    });

  });