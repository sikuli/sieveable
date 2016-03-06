/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */

'use strict';
const fs = require('fs'),
  _ = require('lodash'),
  request = require('supertest'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  config = require('config'),
  pd = require('pretty-data').pd,
  path = require('path'),
  eyes = require('eyes'),
  should = chai.should();

function getFileContent(fileName) {
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'ui');
  return fs.readFileSync(path.join(fixturesDir, fileName), 'utf-8');
}

function testAPI(q, expected, deepMatch, callback) {
  request(app)
  .get('/q')
  .query({ queryText: q })
  .set('Accept', 'application/json')
  .expect(200)
  .end((err, res) => {
    should.not.exist(err);
    should.exist(res.body);
    res.body.should.be.an('array', 'Response body is not an array');
    res.body.should.have.length(expected.length);
    let apps = {};
    try {
      if (deepMatch) {
        apps = _.map(res.body, 'app');
        apps.should.deep.include.members(expected);
      }
    }
    catch (e) {
      console.log('Expected:');
      eyes.inspect(expected);
      console.log('Actual:');
      eyes.inspect(apps);
      throw e;
    }
    callback();
  });
}

describe('UI Examples: Answers to multiple UI design by example questions.', function () {
  // The entire test suite may timeout in a minute
  this.timeout(60000);
  const queryFileQ1a = getFileContent('q1-a.xml'),
    resultFileQ1a = getFileContent('q1-a.json'),
    queryFileQ1b = getFileContent('q1-b.xml'),
    resultFileQ1b = getFileContent('q1-b.json'),
    queryFileQ1c = getFileContent('q1-c.xml'),
    resultFileQ1c = getFileContent('q1-c.json'),
    queryFileQ2 = getFileContent('q2.xml'),
    resultFileQ2 = getFileContent('q2.json'),
    queryFileQ3a = getFileContent('q3-a.xml'),
    resultFileQ3a = getFileContent('q3-a.json'),
    queryFileQ3b = getFileContent('q3-b.xml'),
    resultFileQ3b = getFileContent('q3-b.json'),
    queryFileQ4 = getFileContent('q4.xml'),
    resultFileQ4 = getFileContent('q4.json'),
    queryFileQ5a = getFileContent('q5-a.xml'),
    resultFileQ5a = getFileContent('q5-a.json'),
    queryFileQ5b = getFileContent('q5-b.xml'),
    resultFileQ5b = getFileContent('q5-b.json'),
    queryFileQ5c = getFileContent('q5-c.xml'),
    resultFileQ5c = getFileContent('q5-c.json'),
    queryFileQ6 = getFileContent('q6.xml'),
    resultFileQ6 = getFileContent('q6.json'),
    queryFileQ7 = getFileContent('q7.xml'),
    resultFileQ7 = getFileContent('q7.json'),
    queryFileQ8 = getFileContent('q8.xml'),
    resultFileQ8 = getFileContent('q8.json'),
    queryFileQ9 = getFileContent('q9.xml'),
    resultFileQ9 = getFileContent('q9.json');
    /* queryFileQ10 = getFileContent('q10.xml'),
    resultFileQ10 = getFileContent('q10.json');
    */

  it('q1-a it should search for the following example: \n' +
      `${pd.xml(queryFileQ1a)}\nand find two versions of` +
      '"com.whatsapp", version: "48364" and "48450"', (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ1a}\nRETURN app`,
      expectedQ1a = JSON.parse(resultFileQ1a);
    testAPI(q, expectedQ1a, true, () => {
      done();
    });
  });

  it('q1-b it should search for the following example: \n' +
    `${pd.xml(queryFileQ1b)}\nand find two versions of ` +
    '"com.whatsapp", version: "48364" and "48450"', (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ1b}\n RETURN app`,
      expectedQ1b = JSON.parse(resultFileQ1b);
    testAPI(q, expectedQ1b, true, () => {
      done();
    });
  });

  it('q1-c it should search for the following example: \n' +
      `${pd.xml(queryFileQ1c)}\n and find only one version ` +
      'of com.whatsapp, version: 48450', (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ1c}\nRETURN app`,
      expectedQ1c = JSON.parse(resultFileQ1c);
    testAPI(q, expectedQ1c, true, () => {
      done();
    });
  });

  it('q2 it should search for the following example: \n' +
    `${pd.xml(queryFileQ2)}\nand find 13 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ2}\nRETURN app`,
      expectedQ2 = JSON.parse(resultFileQ2);
    testAPI(q, expectedQ2, true, () => {
      done();
    });
  });

  it('q3-a it should search for the following example: \n' +
    `${pd.xml(queryFileQ3a)}\nand find 4 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ3a}\nRETURN app`,
      expectedQ3a = JSON.parse(resultFileQ3a);
    testAPI(q, expectedQ3a, true, () => {
      done();
    });
  });

  it('q3-b it should search for the following example: \n' +
    `${pd.xml(queryFileQ3b)}\nand find 3 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ3b}\nRETURN app`,
      expectedQ3b = JSON.parse(resultFileQ3b);
    testAPI(q, expectedQ3b, true, () => {
      done();
    });
  });

  it('q4 it should search for the following example: \n' +
    `${pd.xml(queryFileQ4)}\nand find 9 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryFileQ4}\nRETURN app`,
      expectedQ4 = JSON.parse(resultFileQ4);
    testAPI(q, expectedQ4, true, () => {
      done();
    });
  });

  it('q5-a it should search for the following example: \n' +
    `${pd.xml(queryFileQ5a)}\nand find 24 apps.`, (done) => {
    const q = `MATCH App\nWHERE\n${queryFileQ5a}\nRETURN app`,
      expectedQ5a = JSON.parse(resultFileQ5a);
    testAPI(q, expectedQ5a, true, () => {
      done();
    });
  });

  it('q5-b it should search for the following example: \n' +
    `${pd.xml(queryFileQ5b)}\n and find 12 apps.`, (done) => {
    const q = `MATCH App\nWHERE\n${queryFileQ5b}\nRETURN app`,
      expectedQ5b = JSON.parse(resultFileQ5b);
    testAPI(q, expectedQ5b, true, () => {
      done();
    });
  });

  it('q5-c it should search for the following example: \n' +
      `${pd.xml(queryFileQ5c)}\nand find 4 apps.`, (done) => {
    const q = `MATCH App\nWHERE${queryFileQ5c}\nRETURN app`,
      expectedQ5c = JSON.parse(resultFileQ5c);
    testAPI(q, expectedQ5c, true, () => {
      done();
    });
  });

  it(
    'q6 it should search for the following example: \n' +
    `${pd.xml(queryFileQ6)}\n and find 32 apps.`, (done) => {
    const q = `MATCH app\nWHERE ${queryFileQ6}\nRETURN app`,
      expectedQ6 = JSON.parse(resultFileQ6);
    testAPI(q, expectedQ6, true, () => {
      done();
    });
  });

  it(
    'q7 it should search for the following example: \n' +
    `${pd.xml(queryFileQ7)}\nand find 9 apps.`, (done) => {
    const q = `MATCH app\nWHERE ${queryFileQ7}\n RETURN app`,
      expectedQ7 = JSON.parse(resultFileQ7);
    testAPI(q, expectedQ7, true, () => {
      done();
    });
  });

  it('q8 it should search for the following example: \n' +
    `${pd.xml(queryFileQ8)}\nand find 1 app: ` +
    ' "com.google.android.youtube, version: 5738."\n', (done) => {
    const q = `MATCH app\nWHERE ${queryFileQ8}\nRETURN app`,
      expectedQ8 = JSON.parse(resultFileQ8);
    testAPI(q, expectedQ8, true, () => {
      done();
    });
  });

  it('q9 it should search for the following example: \n' +
    `${pd.xml(queryFileQ9)}\nand find 5 apps.`, (done) => {
    const q = `MATCH app\nWHERE ${queryFileQ9}\n RETURN app`,
      expectedQ9 = JSON.parse(resultFileQ9);
    testAPI(q, expectedQ9, true, () => {
      done();
    });
  });

  it(
    'q10 it should search for the following example: \n<View/>\nand returns' +
    ' a number of apps equal to the limit ' +
    `defined in the config file (${config.get('results.maxUI')})`, (done) => {
    const q = 'MATCH app\nWHERE <View/>\n RETURN app';
    testAPI(q, Array(config.get('results.maxUI')), false, () => {
      done();
    });
  });

  it(
    'q11 it should search for apps that have an element name ' +
    '<android.support.v4.widget.DrawerLayout/> that has any descendant child named ' +
    '<FrameLayout/> using the non-default normal matching mode.', (done) => {
    const q = 'MATCH app\nWHERE <LinearLayout>\n' +
        '\n\t<RelativeLayout></RelativeLayout>' +
        '\n\t<RelativeLayout></RelativeLayout>' +
        '\n\t<RelativeLayout></RelativeLayout>' +
        '\n</LinearLayout>' +
        '\nRETURN app\nMODE normal';
    testAPI(q, Array(35), false, () => {
      done();
    });
  });

  it(
    'q12 it should search for apps that have the following siblings using normal macth mode:' +
    '<FrameLayout/>\n<FrameLayout/>\n' +
    '<FrameLayout/>\n<FrameLayout/>.\n', (done) => {
    const q = 'MATCH app\nWHERE\n' +
        '\n\t<FrameLayout/>' +
        '\n\t<FrameLayout/>' +
        '\n\t<FrameLayout/>' +
        '\n\t<FrameLayout/>' +
        '\nRETURN app\nMODE normal';
    testAPI(q, Array(18), false, () => {
      done();
    });
  });

  it(
    'q13 it should search for apps that have the following example using normal macth mode:' +
    '\n<FrameLayout>\n\t<ProgressBar/>\n\t<ImageView/>\n</FrameLayout>\n', (done) => {
    const q = 'MATCH app\nWHERE\n<FrameLayout>' +
          '\n\t<ProgressBar/>' +
          '\n\t<ImageView/>' +
          '\n\t<TextView/>' +
          '\n</FrameLayout>' +
          '\nRETURN app\nMODE normal';
    testAPI(q, Array(35), false, () => {
      done();
    });
  });
});
