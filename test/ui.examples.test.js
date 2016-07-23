/* eslint-env node, mocha */
/* eslint no-console: 0, max-statements:[2,20] */

'use strict';
const Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  _ = require('lodash'),
  request = require('supertest'),
  app = require('../lib/server/server'),
  chai = require('chai'),
  config = require('config'),
  pd = require('pretty-data').pd,
  path = require('path'),
  eyes = require('eyes'),
  should = chai.should(),
  testApiAsync = Promise.promisify(testApi);

function getFileContent(fileName) {
  const fixturesDir = path.join(__dirname, '..', 'fixtures', 'examples', 'ui');
  return fs.readFileAsync(path.join(fixturesDir, fileName), 'utf-8');
}

function testApi(q, expected, deepMatch, callback) {
  request(app)
  .get('/q')
  .query({ queryText: q })
  .set('Accept', 'application/json')
  .expect(200)
  .end((err, res) => {
    should.not.exist(err);
    should.exist(res.body);
    should.exist(res.body.apps);
    res.body.apps.should.be.an('array', 'Response body is not an array');
    res.body.apps.should.have.length(expected.length);
    let apps = {};
    try {
      if (deepMatch) {
        apps = _.map(res.body.apps, (appObj) => {
          return _.pick(appObj, ['id', 'packageName', 'versionCode', 'versionName']);
        });
        apps.should.deep.include.members(expected);
      }
    }
    catch (e) {
      console.log('Expected:');
      eyes.inspect(expected);
      console.log('Actual:');
      console.log(apps);
      throw e;
    }
    callback();
  });
}

function deepMatching(q, expectedResultFile, done) {
  getFileContent(expectedResultFile)
  .then((expectedResultContent) => {
    return testApiAsync(q, JSON.parse(expectedResultContent), true);
  })
  .then(() => {
    done();
  })
  .catch((e) => {
    done(e);
  });
}

describe('UI Examples: Answers to multiple UI design by example questions.', function () {
  // The entire test suite may timeout in a minute
  this.timeout(60000);
  const queryQ1a = '<view class="com.whatsapp.*"/>',
    queryQ1b = '<com.whatsapp.*/>',
    queryQ1c = '<com.whatsapp.* android:gravity="center"/>',
    queryQ2 = `<appwidget-provider
      android:resizeMode="horizontal|vertical"></appwidget-provider>`,
    queryQ3a = `<android.support.v4.widget.DrawerLayout>
        <_/>
        <_/>
    </android.support.v4.widget.DrawerLayout>`,
    queryQ3b = `<view class="android.support.v4.widget.DrawerLayout">
        <_/>
        <_/>
    </view>`,
    queryQ4 = `<TabHost>
        <_>
            <TabWidget/>
        </_>
    </TabHost>`,
    queryQ5a = `<LinearLayout>
        <Button></Button>
        <Button></Button>
        <Button></Button>
    </LinearLayout>`,
    queryQ5b = `<Button></Button>
    <Button></Button>
    <Button></Button>
    <Button></Button>
    <Button></Button>
    <Button></Button>`,
    queryQ5c = `<EditText android:inputType="textEmailAddress"/>
    <EditText android:inputType="textPassword"/>
    <EditText/>
    <Button/>`,
    queryQ6 = '<android.support.v4.view.ViewPager/>',
    queryQ7 = `<PreferenceScreen>
        <PreferenceScreen/>
    </PreferenceScreen>`,
    queryQ8 = `<LinearLayout>
        <RatingBar/>
        <ImageView/>
    </LinearLayout>`,
    queryQ9 = `<LinearLayout android:orientation="horizontal">
        <Button android:text="OK"/>
        <Button android:text="Cancel"/>
    </LinearLayout>`;
    /* queryQ10 = `<menu>
        <item __regex='*:actionViewClass="android.support.v7.widget.SearchView"'></item>
    </menu>`;
    */

  it('q1-a it should search for the following example: \n' +
      `${pd.xml(queryQ1a)}\nand find two versions of` +
      '"com.whatsapp", version: "48364" and "48450"', (done) => {
    const q = `MATCH app\nWHERE\n${queryQ1a}\nRETURN app`;
    deepMatching(q, 'q1-a.json', done);
  });

  it('q1-b it should search for the following example: \n' +
    `${pd.xml(queryQ1b)}\nand find two versions of ` +
    '"com.whatsapp", version: "48364" and "48450"', (done) => {
    const q = `MATCH app\nWHERE\n${queryQ1b}\n RETURN app`;
    deepMatching(q, 'q1-b.json', done);
  });

  it('q1-c it should search for the following example: \n' +
      `${pd.xml(queryQ1c)}\n and find only one version ` +
      'of com.whatsapp, version: 48450', (done) => {
    const q = `MATCH app\nWHERE\n${queryQ1c}\nRETURN app`;
    deepMatching(q, 'q1-c.json', done);
  });

  it('q2 it should search for the following example: \n' +
    `${pd.xml(queryQ2)}\nand find 13 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryQ2}\nRETURN app`;
    deepMatching(q, 'q2.json', done);
  });

  it('q3-a it should search for the following example: \n' +
    `${pd.xml(queryQ3a)}\nand find 4 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryQ3a}\nRETURN app`;
    deepMatching(q, 'q3-a.json', done);
  });

  it('q3-b it should search for the following example: \n' +
    `${pd.xml(queryQ3b)}\nand find 3 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryQ3b}\nRETURN app`;
    deepMatching(q, 'q3-b.json', done);
  });

  it('q4 it should search for the following example: \n' +
    `${pd.xml(queryQ4)}\nand find 9 apps.`, (done) => {
    const q = `MATCH app\nWHERE\n${queryQ4}\nRETURN app`;
    deepMatching(q, 'q4.json', done);
  });

  it('q5-a it should search for the following example: \n' +
    `${pd.xml(queryQ5a)}\nand find 24 apps.`, (done) => {
    const q = `MATCH App\nWHERE\n${queryQ5a}\nRETURN app`;
    deepMatching(q, 'q5-a.json', done);
  });

  it('q5-b it should search for the following example: \n' +
    `${pd.xml(queryQ5b)}\n and find 12 apps.`, (done) => {
    const q = `MATCH App\nWHERE\n${queryQ5b}\nRETURN app`;
    deepMatching(q, 'q5-b.json', done);
  });

  it('q5-c it should search for the following example: \n' +
      `${pd.xml(queryQ5c)}\nand find 4 apps.`, (done) => {
    const q = `MATCH App\nWHERE${queryQ5c}\nRETURN app`;
    deepMatching(q, 'q5-c.json', done);
  });

  it('q6 it should search for the following example: \n' +
    `${pd.xml(queryQ6)}\n and find 32 apps.`, (done) => {
    const q = `MATCH app\nWHERE ${queryQ6}\nRETURN app`;
    deepMatching(q, 'q6.json', done);
  });

  it('q7 it should search for the following example: \n' +
    `${pd.xml(queryQ7)}\nand find 9 apps.`, (done) => {
    const q = `MATCH app\nWHERE ${queryQ7}\n RETURN app`;
    deepMatching(q, 'q7.json', done);
  });

  it('q8 it should search for the following example: \n' +
    `${pd.xml(queryQ8)}\nand find 1 app: ` +
    ' "com.google.android.youtube, version: 5738."\n', (done) => {
    const q = `MATCH app\nWHERE ${queryQ8}\nRETURN app`;
    deepMatching(q, 'q8.json', done);
  });

  it('q9 it should search for the following example: \n' +
    `${pd.xml(queryQ9)}\nand find 5 apps.`, (done) => {
    const q = `MATCH app\nWHERE ${queryQ9}\n RETURN app`;
    deepMatching(q, 'q9.json', done);
  });

  it('q10 it should search for the following example: \n<View/>\nand returns' +
    ' a number of apps equal to the limit ' +
    `defined in the config file (${config.get('results.maxUI')})`, (done) => {
    const q = 'MATCH app\nWHERE <View/>\n RETURN app';
    testApiAsync(q, Array(config.get('results.maxUI')), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q11 it should search for apps that have an element name ' +
    '<android.support.v4.widget.DrawerLayout/> that has any descendant child named ' +
    '<FrameLayout/> using the non-default normal matching mode.', (done) => {
    const q = 'MATCH app\nWHERE <LinearLayout>\n' +
        '\n\t<RelativeLayout></RelativeLayout>' +
        '\n\t<RelativeLayout></RelativeLayout>' +
        '\n\t<RelativeLayout></RelativeLayout>' +
        '\n</LinearLayout>' +
        '\nRETURN app\nMODE normal';
    testApiAsync(q, Array(35), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
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
    testApiAsync(q, Array(18), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });

  it('q13 it should search for apps that have the following example using ' +
    'normal macth mode:' +
    '\n<FrameLayout>\n\t<ProgressBar/>\n\t<ImageView/>\n</FrameLayout>\n', (done) => {
    const q = 'MATCH app\nWHERE\n<FrameLayout>' +
          '\n\t<ProgressBar/>' +
          '\n\t<ImageView/>' +
          '\n\t<TextView/>' +
          '\n</FrameLayout>' +
          '\nRETURN app\nMODE normal';
    testApiAsync(q, Array(35), false)
    .then(() => {
      done();
    })
    .catch((e) => {
      done(e);
    });
  });
});
