faker = require('faker');

exports.seed = (knex) => {
  const initialData = [
    {
      tableName: 'users',
      values: [
        { id: 1, username: "me", email: "me@me.com", password: "test" },
        { id: 2, username: "username2", email: "me2@me.com", password: "test" },
        { id: 3, username: "username3", email: "me3@me.com", password: "test" }
      ]
    },
    {
      tableName: 'articles',
      values: [
        { id: 1, body: "this is test 1", author: 1 },
        { id: 2, body: "this is test 2", author: 2 },
        { id: 3, body: "this is test 3", author: 2 }
      ]
    },
    {
      tableName: 'votes',
      values: [
        { _Id: 1, points: 10, userId: 1, articleId: 1 },
        { _Id: 2, points: 2, userId: 1, articleId: 1 },
        { _Id: 3, points: 8, userId: 3, articleId: 3 }
      ]
    },
    {
      tableName: 'comments',
      values: [
        { _id: 1, body: "hello", type: "not_spam", author_id: 1, parentCommentId: 2 },
        { _id: 2, body: "hello2", type: "not_spam", author_id: 2, parentCommentId: 3 },
        { _id: 3, body: "hello3", type: "spam", author_id: 1 }
      ]
    },
    {
      tableName: 'links',
      values: [
        { id: 1, url: "http://example.com/1" },
        { id: 2, url: "http://example.com/2" },
        { id: 3, url: "http://example.com/3" },
        { id: 4, url: "http://example.com/4" },
        { id: 5, url: "http://example.com/5" },
        { id: 6, url: "http://example.com/6" },
        { id: 7, url: "http://example.com/7" },
      ]
    },
    ...new Array(10).fill(0).map(_ => {
      const tags = {
        tableName: 'tags',
        values: []
      };

      const books = {
        tableName: 'books',
        values: [...Array(100)].map(() => {
          const book = {
            id: faker.datatype.uuid(),
            title: faker.lorem.lines(1),
            datePublished: faker.date.past().toISOString(),
            isbn: faker.datatype.number({ min: 1000000, max: 9999999 }),
            author: faker.datatype.number({ min: 1, max: 3 })
          };

          tags.values.push({
            id: faker.datatype.uuid(),
            name: faker.lorem.lines(1),
            bookId: book.id,
          })

          return book;
        })
      };

      return [tags, books];
    }).flat(),
  ];
  return Promise.all(initialData.map(({ tableName, values }) => knex(tableName).insert(values))).then(() => { });
};
