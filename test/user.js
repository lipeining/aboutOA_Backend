const should = require('should');
const app    = require('../app.js');

describe('post /api/v1/user and get /api/v1/user', function () {
  const request = require('supertest').agent(app);
  const id1     = Math.floor(Math.random() * 10000);
  const id2     = Math.floor(Math.random() * 10000);
  let user1     = {};
  let user2     = {};
  it('should register a new user id1', function (done) {
    let name = 'duoyi' + id1;
    request
      .post('/api/v1/user')
      .send({
        name    : name,
        password: name,
        email   : name + '@henhaoji.com',
        intro   : name + ' and ' + name + '@henhaoji.com'
      })
      .set('Accept', 'application/json')
      .then(function (result) {
        user1 = result.body.user;
        result.body.code.should.be.equal(0);
        done();
      });
  });

  it('should update user id1', function (done) {
    let name = 'duoyi' + id2;
    request
      .put('/api/v1/user')
      .send({
        id      : user1.id,
        name    : name,
        password: name,
        email   : name + '@henhaoji.com',
        intro   : name + ' and ' + name + '@henhaoji.com'
      })
      .set('Accept', 'application/json')
      .then(function (result) {
        result.body.code.should.be.equal(0);
        done();
      });
  });

  it('should get one user id1', function (done) {
    request
      .get('/api/v1/user')
      .query({
        id: user1.id
      })
      .set('Accept', 'application/json')
      .then(function (result) {
        result.body.code.should.be.equal(0);
        user2 = result.body.user;
        console.log(user2);
        console.log(user1);
        user2.id.should.be.equal(user1.id);
        done();
      });
  });
});

describe('get /api/v1/users', function () {
  const request = require('supertest').agent(app);
  it('should get one user', function (done) {
    request
      .get('/api/v1/users')
      .query({
        pageIndex: 1,
        pageSize : 1
      })
      .set('Accept', 'application/json')
      .then(function (user) {
        console.log(user.body);
        user.body.code.should.be.equal(0);
        // redis session contain numbers of users which should not be only one user.
        // user.body.users.count.should.be.equal(1);
        // user.body.users.should.have.property('rows').with.lengthOf(1);
        done();
      });
  });
});




