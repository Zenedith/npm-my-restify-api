'use strict';

const chai = require('chai');
const should = chai.should();

const app = require('./sampleApp');

describe('service test', () => {

  it('should start service', done => {
    app.startServer((err, port) => {
      should.not.exist(err);
      port.should.equal(3000);
      done();
    });
  });
});
