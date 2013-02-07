/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')

var request = require('request');
var _ = require('lodash');
var osm_links = require('../lib/osm_links').osm_links
var osm_topojson = require('../lib/osm_links').osm_topojson
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


describe ('osm links service', function(){

    var app,server;

    before(
        function(done){
            app = express()
            osm_links({},app)
            osm_topojson({},app)
            server=http
                   .createServer(app)
                   .listen(testport,done)

        })
    after(function(done){
        server.close(done)
    })

    it('should spit out geojson'
      ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/osm_map/11/353/820.json'
                   ,'headers':{'accept':'application/json'}
                   ,'followRedirect':true}
                  ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                           c.should.have.property('type','FeatureCollection')
                           c.should.have.property('features')
                       c.features.should.have.property('length')
                       c.features.length.should.be.above(0)
                       //console.log('features.length is '+c.features.length)

                       return done()
                   })
       })
    it('should spit out topojson, not geojson'
      ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/osm_topo_map/11/353/820.json'
                   ,'headers':{'accept':'application/json'}
                   ,'followRedirect':true}
                  ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','Topology')
                       c.should.have.property('arcs')
                       c.arcs.should.have.property('length')
                       c.arcs.length.should.be.above(0)
                       //console.log('arcs.length is '+c.arcs.length)

                       c.should.have.property('objects')
                       var topo_objects = c.objects
                       _.each(topo_objects
                             ,function(obj){
                                  obj.should.have.property('type','LineString')
                                  obj.should.have.property('id')
                                  obj.id.should.match(/^\d+_(north|south|east|west)$/)
                              });

                       return done()
                   })
       })
})
