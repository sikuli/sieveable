'use strict';
const chai = require('chai'),
    should = chai.should(),
    findByDataset = require('../lib/findBy/dataset');

describe('test find by dataset.', function() {
  it('should compute the intersection of ui, listing, code and manifest ids.', (done) => {
        this.timeout(0);
        const env = {},
            query = {
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
                results.should.have.length(55);
                done();
            }).catch((e) => {
                console.error(e.message);
                should.not.exist(e);
                done(e);
            });
  });
});
