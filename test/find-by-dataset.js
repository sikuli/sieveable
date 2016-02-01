'use strict';
const chai = require('chai'),
    should = chai.should(),
    findByDataset = require('../lib/findBy/dataset');

describe('test find by dataset.', function() {
  const env = {};

  before((done) => {
    // Initialize env.ids
    env.ids = {};
    env.ids.code = ['com.facebook.orca-936981', 'com.android.chrome-1547059', 'com.cleanmaster.mguard-40101776'];
    env.ids.listing = ['com.adobe.reader-77969', 'com.facebook.katana-666397', 'com.android.chrome-1547059'];
    env.ids.ui = ['com.facebook.katana-666397', 'com.android.chrome-1547059', 'com.outfit7.talkingtom2free-83'];
    env.ids.manifest = ['com.android.chrome-1547059', 'com.opera.mini.android-25'];
    done();
  });

  it('should compute the intersection of ids for ui, listing, code and manifest ids.', (done) => {
        this.timeout(0);
        const query = {
                  match: [ 'app' ],
                  listing: '<desc>ch*t SMS</desc><cat>(*)</cat>',
                  ui: '<Button android:text="(*)"/>',
                  manifest: '<uses-permission android:name="(android.permission.READ_*)"/>',
                  code: '<code class="android.hardware.Camera" method="startPreview" />',
                  return: [ 'app'],
                  limit: 100,
                  mode: 'strict'
              };
        return findByDataset.find(env, query)
          .then((results) => {
            results.should.have.length(1);
            done();
          }).catch((e) => {
            console.error(e.message);
            should.not.exist(e);
            done(e);
          });
  });
});
