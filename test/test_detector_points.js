/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')

var request = require('request')
var _ = require('lodash')
var detectors  = require('../lib/detectors').detectors

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

        detectors.should.throw()
        function f2 (){
            detectors({})
            return null
        }
        f2.should.throw()
        return done()
    })
})
describe ('ways to invoke the murb service',function(){
    it('should accept alternate json filename',function(done){
        var options = Object.assign({},config.postgresql,config.postgresql.auth)
        var app = express()
        function f(){
            detectors(options
                       ,'json/detectors.json'
                       ,app)
            return null
        }
        f.should.not.throw()
        return done()
    })
})



describe ('detectors service', function(){

    var app,server
    var vds_regex = new RegExp('vdsid_\\d{6,7}')
    var wim_regex = new RegExp('wimid_\\d+_[NSEW]')

    before(
        function(done){
            var options = Object.assign({},config.postgresql,config.postgresql.auth)
            app = express()
            detectors(options,app)
            server=http
                .createServer(app)
                .listen(testport,done)
            return null
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
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.length.should.eql(6442)
                       //console.log(c.features.length)
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
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.length.should.eql(38)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('freeway')
                                  member.properties.should.have.property('direction')
                                  member.properties.should.have.property('type')
                                  member.properties.should.have.property('detector_id')
                                  member.properties.id.should.match(wim_regex)
                              })
                       return done()
                   })
       })
    it('should spit out wim and vds points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/detectors/14/2821/6558.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c

                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(15)
                       _.each(c.features
                                  ,function(member){
                                      member.should.have.property('geometry')
                                      member.should.have.property('properties')
                                      member.properties.should.have.property('id')
                                      member.properties.id.should.match(function(id){
                                          return wim_regex.test(id) || vds_regex.test(id)
                                      })
                                  })
                       return done()
                   })
       })

    it('should fetch all the wim points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/wim_detectors.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.length.should.eql(220)
                           _.each(c.features
                                  ,function(member){
                                      member.should.have.property('geometry')
                                      member.should.have.property('properties')
                                      member.properties.should.have.property('id')
                                      member.properties.id.should.match(wim_regex)
                                      member.properties.id.should.not.match(vds_regex)
                                  })
                       return done()
                   })
       })
    it('should fetch all the points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/detectors.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.length.should.eql(18149)
                           _.each(c.features
                                  ,function(member){
                                      member.should.have.property('geometry')
                                      member.should.have.property('properties')
                                      member.properties.should.have.property('id')
                                      member.properties.id.should.match(function(id){
                                          return wim_regex.test(id) || vds_regex.test(id)
                                      })
                                  })
                       return done()
                   })
       })
    it('should fetch all the vds points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/vds_detectors.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.length.should.eql(17929)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.id.should.match(vds_regex)
                                  member.properties.id.should.not.match(wim_regex)
                              })
                       return done()
                   })
       })

})
