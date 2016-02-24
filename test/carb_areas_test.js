/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')

var request = require('request');
var _ = require('lodash');
var carb_areas = require('../lib/carb_areas').carb_areas
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



describe ('carb shape service', function(){

    var app,server;

    before(
        function(done){
            app = express()
            var options = Object.assign({},config.postgresql,config.postgresql.auth)
            carb_areas(options,app) // testing use of default json only here
            server=http
                .createServer(app)
                .listen(testport,done)

        })
    after(function(done){
        server.close(done)
    })

    it('should spit out county shapes in a bbox'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/counties/11/353/820.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(1)
                       var member = c.features[0]
                       member.should.have.property('geometry')
                       member.should.have.property('properties')
                       member.properties.should.have.property('id')

                       member.properties.should.have.property('name','Orange')
                       member.properties.should.have.property('coname' ,'ORANGE')
                       member.properties.should.have.property('fips','06059')

                       return done()
                   })
       })
    it('should spit out all the county shapes'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/counties.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(95)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('name')
                                  member.properties.should.have.property('coname')
                                  member.properties.should.have.property('fips')
                              })

                       return done()
                   })
       })
    it('should spit out airbasin shapes in a bbox'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/airbasins/11/353/820.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(1)
                       var member = c.features[0]
                       member.should.have.property('geometry')
                       member.should.have.property('properties')
                       member.properties.should.have.property('id')

                       member.properties.should.have.property('name','SOUTH COAST')
                       member.properties.should.have.property('ab' ,'SC')

                       return done()
                   })
       })
    it('should spit out all the airbasin shapes'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/airbasins.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(34)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('name')
                                  member.properties.should.have.property('ab')
                              })

                       return done()
                   })
       })
    it('should spit out air district shapes in a bbox'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/airdistricts/11/353/820.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(1)
                       var member  =c.features[0]
                       member.should.have.property('geometry')
                       member.should.have.property('properties')
                       member.properties.should.have.property('id')

                       member.properties.should.have.property('name','South Coast')
                       member.properties.should.have.property('dis' ,'SC')
                       member.properties.should.have.property('disn','SOUTH COAST AQMD')

                       return done()
                   })
       })
    it('should spit out all the air district shapes'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/airdistricts.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(47)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('name')
                                  member.properties.should.have.property('dis')
                                  member.properties.should.have.property('disn')
                              })

                       return done()
                   })
       })
    it('should spit out all the grid4k shapes'
       ,function(done){
           // load the service for vds shape data
           request({'url':'http://'+ testhost +':'+testport+'/grid4k.json'
                    ,'headers':{'accept':'application/json'}
                    ,'followRedirect':true}
                   ,function(e,r,b){
                       if(e) return done(e)
                       r.statusCode.should.equal(200)
                       should.exist(b)
                       var c = JSON.parse(b)
                       c.should.have.property('type','FeatureCollection')
                       c.should.have.property('features')
                       c.features.should.have.length(25083)
                       _.each(c.features
                              ,function(member){
                                  member.should.have.property('geometry')
                                  member.should.have.property('properties')
                                  member.properties.should.have.property('id')
                                  member.properties.should.have.property('cell_id')
                                  member.properties.should.have.property('i_cell')
                                  member.properties.should.have.property('j_cell')
                                  member.properties.should.have.property('fid_state4')

                              })

                       return done()
                   })
       })
})
