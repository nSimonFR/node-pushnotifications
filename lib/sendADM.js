"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const adm = require('node-adm');

const _require = require('./constants'),
      ADM_METHOD = _require.ADM_METHOD;

const sendADM = (regIds, _data, settings) => {
  const resumed = {
    method: ADM_METHOD,
    success: 0,
    failure: 0,
    message: []
  };
  const promises = [];
  const admSender = new adm.Sender(settings.adm);

  const data = _objectSpread({}, _data);

  const consolidationKey = data.consolidationKey,
        expiry = data.expiry,
        timeToLive = data.timeToLive;
  delete data.consolidationKey;
  delete data.expiry;
  delete data.timeToLive;
  const message = {
    expiresAfter: expiry - Math.floor(Date.now() / 1000) || timeToLive || 28 * 86400,
    consolidationKey,
    data
  };
  regIds.forEach(regId => {
    admSender.send(message, regId, (err, response) => {
      const errorMsg = err instanceof Error ? err.message : response.error;
      const error = err || (response.error ? new Error(response.error) : null);
      resumed.success += error ? 0 : 1;
      resumed.failure += error ? 1 : 0;
      resumed.message.push({
        regId,
        error,
        errorMsg
      });
      promises.push(Promise.resolve());
    });
  });
  return Promise.all(promises).then(() => resumed);
};

module.exports = sendADM;