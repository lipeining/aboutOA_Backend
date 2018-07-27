/**
 * The DB Module provides a database initalized with the settings 
 * provided by the settings module
 */

/*
 * 2011 Peter 'Pita' Martischka (Primary Technology Ltd)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ueberDB = require("ueberdb2");
var settings = require("../utils/Settings");
var log4js = require('log4js');
var BBPromise = require('bluebird');
//set database settings
var db = new ueberDB.database(settings.dbType, settings.dbSettings, null, log4js.getLogger("ueberDB"));
exports.db=db;

// BBPromise.resolve(function(){
//   db.init(function(err){
//     if(err){
//       return BBPromise.reject('db down');
//     } else {
//       return db;
//     }
//   })
// });
exports.D=D;
function D(db){
  return new Promise(function(resolve, reject){
    db.init(function(err){
      if(err){
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

exports.init = function(){
  var t = new ueberDB.database(settings.dbType, settings.dbSettings, null, log4js.getLogger("ueberDB"));
  return new Promise(function(resolve, reject){
    t.init(function(err){
      if(err){
        reject(err);
      } else {
        resolve(t);
      }
    });
  });
}

