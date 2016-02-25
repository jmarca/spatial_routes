/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')

var request = require('request')
var osm_links = require('../lib/osm_links').osm_links
var osm_topojson = require('../lib/osm_links').osm_topojson

var http = require('http')
var express = require('express')

// use config file for database parameters
var config_okay = require('config_okay')
var path    = require('path')
var config_file = path.normalize(process.cwd()+'/test.config.json')
var config={}

var testhost = '127.0.0.1'
var testport = 3000

before(function(done){

    config_okay(config_file,function(e,c){
        if(e) throw new Error (e)
        config = c
        return done()
    })
    return null

})

describe ('ways to not invoke the osm links service', function(){

    it('should complain about bad invocations',function(done){

        osm_links.should.throw()
        osm_topojson.should.throw()
        function f2 (){
            osm_links({})
            return null
        }
        function f3 (){
            osm_topojson({})
            return null
        }
        f2.should.throw()
        f3.should.throw()
        return done()
    })
})
describe ('ways to invoke the osm service',function(){
    it('should accept alternate json filename',function(done){
        var options = Object.assign({},config.postgresql,config.postgresql.auth)
        var app = express()
        function f(){
            osm_links(options
                       ,'json/osm_links.json'
                       ,app)
            return null
        }
        function f2(){
            osm_topojson(options
                       ,'json/osm_links.json'
                       ,app)
            return null
        }
        f.should.not.throw()
        f2.should.not.throw()
        return done()
    })
})

describe ('osm links service', function(){

    var app,server

    before(
        function(done){
            var options = Object.assign({},config.postgresql,config.postgresql.auth)
            app = express()
            osm_links(options,app)
            osm_topojson(options,app)
            server=http
                .createServer(app)
                .listen(testport,testhost,done)
            return null
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
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
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
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','Topology')
                       c.should.have.property('arcs')
                       c.arcs.should.have.property('length')
                       c.arcs.length.should.be.above(0)
                       //console.log('arcs.length is '+c.arcs.length)

                       c.should.have.property('objects')
                       c.objects.forEach(function(obj){
                           obj.should.have.property('type','LineString')
                           obj.should.have.property('id')
                           obj.id.should.match(/^\d+_(north|south|east|west)$/)
                       })

                       return done()
                   })
       })
})
