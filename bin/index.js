var _diskSpace, child_process, diskSpace, diskSpaceSync, os, regMatchAll;

os = require('os');

child_process = require('child_process');


/**
 * Reg Match All
 * @param  {String} str - проверяемая строка
 * @param  {Object} reg - регулярное выражение
 * @return {Object} marches - результаты поиска
 */

regMatchAll = function(str, reg) {
  var arr, results;
  results = [];
  while ((arr = reg.exec(str)) !== null) {
    results.push(arr);
  }
  return results;
};

_diskSpace = function(async, callback, phSystem, phOutput) {
  var _parseLinuxOutp, _parseWindowOutp, osType, stdout;
  if (async == null) {
    async = true;
  }
  if (callback == null) {
    callback = void 0;
  }
  if (phSystem == null) {
    phSystem = void 0;
  }
  if (phOutput == null) {
    phOutput = void 0;
  }
  osType = os.type();
  _parseWindowOutp = function(str) {
    var disk, disks, free, i, len, matches, name, percent, reg, size, used;
    disks = {
      total: {
        free: 0,
        size: 0,
        used: 0,
        percent: 0
      },
      disks: {}
    };
    reg = /([a-z0-9]):(?:\ |\t)*([0-9]+)(?:\ |\t)*([0-9]+)/gi;
    matches = regMatchAll(str, reg);
    for (i = 0, len = matches.length; i < len; i++) {
      disk = matches[i];
      name = disk[1];
      free = parseInt(disk[2]);
      size = parseInt(disk[3]);
      used = size - free;
      percent = used / size;
      disks.disks[name] = {
        free: free,
        size: size,
        used: used,
        percent: percent
      };
      disks.total.free += free;
      disks.total.size += size;
      disks.total.used += used;
    }
    disks.total.percent = disks.total.used / disks.total.size;
    return disks;
  };
  _parseLinuxOutp = function(str) {
    var disk, disks, free, i, len, matches, name, percent, reg, size, used;
    disks = {
      total: {
        free: 0,
        size: 0,
        used: 0,
        percent: 0
      },
      disks: {}
    };
    reg = /([a-z0-9\/_-]+)(?:\ |\t)*([0-9]+)(?:\ |\t)*([0-9]+)(?:\ |\t)*([0-9]+)(?:\ |\t)*([0-9]+)%(?:\ |\t)*([a-z0-9\/_-]+)/gi;
    matches = regMatchAll(str, reg);
    for (i = 0, len = matches.length; i < len; i++) {
      disk = matches[i];
      name = disk[6];
      used = parseInt(disk[3]);
      size = parseInt(disk[2]);
      free = size - used;
      percent = used / size;
      disks.disks[name] = {
        free: free,
        size: size,
        used: used,
        percent: percent
      };
      disks.total.free += free;
      disks.total.size += size;
      disks.total.used += used;
    }
    disks.total.percent = disks.total.used / disks.total.size;
    return disks;
  };
  if ((osType === 'Windows_NT' && !phSystem) || phSystem === 'Windows_NT') {
    if (async) {
      if (!phOutput) {
        return child_process.exec('wmic logicaldisk get size,freespace,caption', function(error, stdout, stderr) {
          if (error) {
            return callback(error, null);
          }
          return callback(null, _parseWindowOutp(stdout));
        });
      } else {
        return callback(null, _parseWindowOutp(phOutput));
      }
    } else {
      if (!phOutput) {
        stdout = child_process.execSync('wmic logicaldisk get size,freespace,caption').toString();
      } else {
        stdout = phOutput;
      }
      return _parseWindowOutp(stdout);
    }
  } else {
    if (async) {
      if (!phOutput) {
        return child_process.exec('df', function(error, stdout, stderr) {
          if (error) {
            return callback(error, null);
          }
          return callback(null, _parseLinuxOutp(stdout));
        });
      } else {
        return callback(null, _parseLinuxOutp(phOutput));
      }
    } else {
      if (!phOutput) {
        stdout = child_process.execSync('df').toString();
      } else {
        stdout = phOutput;
      }
      return _parseLinuxOutp(stdout);
    }
  }
};


/**
 * Sync check disk space
 * @param  {String}     phOutput            - Std output, only for tests
 * @param  {String}     phSystem            - System, only for tests
 * 
 * @return {Object}     disks               - info about disk
 * @return {Object}     disks.total         - sum of all disk space
 * @return {Integer}    disks.total.free    - free disk space
 * @return {Integer}    disks.total.size    - total size of disk
 * @return {Integer}    disks.total.used    - used disk space
 * @return {Integer}    disks.total.percent - percent of used disk space
 *
 * @return {Object}     disks.disks         - named disks. Contain full analogue disks.total Object
 */

diskSpaceSync = function(phSystem, phOutput) {
  if (phSystem == null) {
    phSystem = void 0;
  }
  if (phOutput == null) {
    phOutput = void 0;
  }
  return _diskSpace(false, null, phSystem, phOutput);
};


/**
 * Sync check disk space
 * @param  {Callback}   callback            - Callback function
 * @param  {Error}      callback.err        - Callback function error
 * @param  {Object}     callback.res        - Callback function result about disk space
 * 
 * @param  {String}     phOutput            - Std output, only for tests
 * @param  {String}     phSystem            - System, only for tests
 * 
 * @return {Object}     disks               - info about disk
 * @return {Object}     disks.total         - sum of all disk space
 * @return {Integer}    disks.total.free    - free disk space
 * @return {Integer}    disks.total.size    - total size of disk
 * @return {Integer}    disks.total.used    - used disk space
 * @return {Integer}    disks.total.percent - percent of used disk space
 *
 * @return {Object}     disks.disks         - named disks. Contain full analogue disks.total Object
 */

diskSpace = function(callback, phSystem, phOutput) {
  if (phSystem == null) {
    phSystem = void 0;
  }
  if (phOutput == null) {
    phOutput = void 0;
  }
  return _diskSpace(true, callback, phSystem, phOutput);
};

module.exports = {
  diskSpace: diskSpace,
  diskSpaceSync: diskSpaceSync
};