/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')

var request = require('request');
var async = require('async')
var _ = require('underscore');
var detectors  = require('../lib/detectors').detectors

var http = require('http')
var express = require('express')

var env = process.env;
var puser = process.env.PSQL_USER ;
var ppass = process.env.PSQL_PASS ;
var phost = process.env.PSQL_HOST ;
var pport = process.env.PSQL_PORT || 5432;


var testhost = env.SHAPES_TEST_HOST || '127.0.0.1'
var testport = env.SHAPES_TEST_PORT || 3000


describe ('detectors service', function(){

    var app,server;

    before(
        function(done){
            app = express()
            detectors({},app)
            server=http
                   .createServer(app)
                   .listen(testport,done)

        })
    after(function(done){
        server.close(done)
    })

    it('should spit out vds points'
      ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/vds_detectors/8/44/102.json'
                   ,'headers':{'accept':'application/json'}
                   ,'followRedirect':true}
                  ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(5334)
                       _.each(c.features
                             ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('freeway')
                                  member.properties.should.have.property('direction')
                                  member.properties.should.have.property('type')
                                  member.properties.should.have.property('detector_id')
                                  member.properties.detector_id.should.match(/^vdsid_/)
                              })
                           return done()
                   })
       })

    it('should spit out wim points'
      ,function(done){
           // load the service for wim shape data
           request({'url':'http://'+ testhost +':'+testport+'/wim_detectors/8/44/102.json'
                   ,'headers':{'accept':'application/json'}
                   ,'followRedirect':true}
                  ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(38)
                       _.each(c.features
                             ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('freeway')
                                  member.properties.should.have.property('direction')
                                  member.properties.should.have.property('type')
                                  member.properties.should.have.property('detector_id')
                                  member.properties.detector_id.should.match(/^wimid_/)
                              })
                           return done()
                   })
       })
})
