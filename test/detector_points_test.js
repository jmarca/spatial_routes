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



describe ('detectors service', function(){

    var app,server
    var vds_regex = new RegExp('vdsid_\d{6,7}')
    var wim_regex = new RegExp('wimid_\d+_[NSEW]')

    before(
        function(done){
            var options = Object.assign({},config.postgresql,config.postgresql.auth)
            app = express()
            detectors(options,app)
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
                       var c
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(5319)
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
    it('should spit out wim and vds points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/detectors/14/2821/6558.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c
                       var vds_match=false
                       var wim_match = false

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
                                      if(vds_regex.test(member.properties.id))
                                          vds_match = true
                                      if(wim_regex.test(member.properties.id))
                                          wim_match = true
                                  })
                       vds_match.should.be.true
                       wim_match.should.be.true
                       return done()
                   })
       })

    it('should fetch all the wim points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/wim_detectors.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var l,c
                       var vds_match=false
                       var wim_match = false
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       l = c.features.length
                       l.should.eql(220)
                           _.each(c.features
                                  ,function(member){
                                      member.should.have.property('geometry')
                                      member.should.have.property('properties')
                                      member.properties.should.have.property('id')
                                      if(vds_regex.test(member.properties.id))
                                          vds_match = true
                                      if(wim_regex.test(member.properties.id))
                                          wim_match = true
                                  })
                       vds_match.should.be.false
                       wim_match.should.be.true
                       return done()
                   })
       })
    it('should fetch all the points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/detectors.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c,l
                       var vds_match=false
                       var wim_match = false

                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       l = c.features.length
                       l.should.eql(13322)
                           _.each(c.features
                                  ,function(member){
                                      member.should.have.property('geometry')
                                      member.should.have.property('properties')
                                      member.properties.should.have.property('id')
                                      if(vds_regex.test(member.properties.id))
                                          vds_match = true
                                      if(wim_regex.test(member.properties.id))
                                          wim_match = true
                                  })
                       vds_match.should.be.true
                       wim_match.should.be.true
                       return done()
                   })
       })
    it('should fetch all the vds points'
       ,function(done){
           request({url:'http://'+ testhost +':'+testport+'/vds_detectors.json'
                    ,'headers':{'accept':'application/json'}
                    ,followRedirect:true}
                   ,function(e,r,b){
                       var c,l
                       var vds_match=false
                       var wim_match = false
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       l = c.features.length
                       l.should.eql(13102)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  if(vds_regex.test(member.properties.id))
                                      vds_match = true
                                  if(wim_regex.test(member.properties.id))
                                      wim_match = true
                              })
                       vds_match.should.be.true()
                       wim_match.should.be.false()
                       return done()
                   })
       })

})
