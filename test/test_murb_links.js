/* global require console process it describe after before */

// test that the murb service works as expected

var should = require('should')

var request = require('request')
var murb_links = require('../lib/murb_links').murb_links
var murb_topojson = require('../lib/murb_links').murb_topojson

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

describe ('ways to not invoke the murb links service', function(){

    it('should complain about bad invocations',function(done){

        murb_links.should.throw()
        murb_topojson.should.throw()
        function f2 (){
            murb_links({})
            return null
        }
        function f3 (){
            murb_topojson({})
            return null
        }
        f2.should.throw()
        f3.should.throw()
        return done()
    })
})
describe ('ways to invoke the murb service',function(){
    it('should accept alternate json filename',function(done){
        var options = Object.assign({},config.postgresql,config.postgresql.auth)
        var app = express()
        function f(){
            murb_links(options
                       ,'json/murb_links.json'
                       ,app)
            return null
        }
        function f2(){
            murb_topojson(options
                       ,'json/murb_links.json'
                       ,app)
            return null
        }
        f.should.not.throw()
        f2.should.not.throw()
        return done()
    })
})


describe ('murb links service', function(){

    var app,server

    before(
        function(done){
            var options = Object.assign({},config.postgresql,config.postgresql.auth)
            app = express()
            murb_links(options,app)
            murb_topojson(options,app)
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
           request({'url':'http://'+ testhost +':'+testport+'/detectors/murb/2007/11/353/820.json'
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
                       c.features.length.should.eql(322)
                       return done()
                   })
       })
    it('should spit out topojson, not geojson'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/detectors/murb_topo/2008/11/353/820.json'
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
                       c.arcs.length.should.eql(201)

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
