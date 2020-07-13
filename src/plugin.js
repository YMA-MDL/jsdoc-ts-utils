// @ts-check
/* eslint-disable no-new */
const { EventEmitter } = require('events');
const jsdocEnv = require('jsdoc/lib/jsdoc/env');
const jsdocTemplateHelper = require('jsdoc/lib/jsdoc/util/templateHelper');
const { EVENT_NAMES } = require('./constants');
const { Utils } = require('./utils');
const features = require('./features');
/**
 * @type {TSUtilsOptions}
 */
const options = {
  typedefImports: true, // done
  extendTypes: true, // done
  modulesOnMemberOf: true,
  modulesTypesShortName: true, // done
  typeScriptUtilityTypes: true, // done
  tagsReplacement: {},
  ...(jsdocEnv.conf.tsUtils || {}),
};
/**
 * @type {EventEmitter}
 */
const events = new EventEmitter();

if (options.typeScriptUtilityTypes) {
  new features.TypedefImports(events, EVENT_NAMES);
}

if (options.modulesTypesShortName) {
  new features.ModulesTypesShortName(
    events,
    jsdocTemplateHelper,
    EVENT_NAMES,
  );
}

if (options.typeScriptUtilityTypes) {
  new features.TSUtilitiesTypes(events, EVENT_NAMES);
}

module.exports.handlers = {
  parseBeing(event) {
    events.emit(EVENT_NAMES.parseBegin, event);
  },
  beforeParse(event) {
    const { source, filename } = event;
    Utils.traverseComments(source, (comment) => events.emit(
      EVENT_NAMES.newComment,
      comment,
      filename,
    ));

    // eslint-disable-next-line no-param-reassign
    event.source = events.listeners(EVENT_NAMES.commentsReady).reduce(
      (acc, listener) => listener(acc),
      source,
    );
  },
};
