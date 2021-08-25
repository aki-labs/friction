// Copyright 2018-2021, University of Colorado Boulder

/**
 * Manager for the alerts that are dynamically emitted in the simulation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import AlertManager from '../../../../scenery-phet/js/accessibility/describers/AlertManager.js';
import voicingUtteranceQueue from '../../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';

// constants
const frictionIncreasingAtomsJigglingTemperatureFirstPatternString = frictionStrings.a11y.frictionIncreasingAtomsJigglingTemperatureFirstPattern;
const frictionIncreasingAtomsJigglingTemperaturePatternString = frictionStrings.a11y.frictionIncreasingAtomsJigglingTemperaturePattern;

// utterance for announcing temperature and particle changes, persistent reference to use
// alertStableDelay feature of utterance
const temperatureJiggleUtterance = new Utterance( {
  announcerOptions: {
    cancelOther: false
  }
} );

const temperatureDecreasingUtterance = new Utterance( {
  announcerOptions: {
    cancelOther: false
  }
} );

class FrictionAlertManager extends AlertManager {

  /**
   * @param {object} alertObject - data object holding strings for alert, see this.ALERT_SCHEMA
   * @param {boolean} firstTimeAlerting - if it is the first time alerting this alert, there could be a special case in the data object
   * @param {string} [typeID]
   * @public
   */
  alertTemperatureJiggleFromObject( alertObject, firstTimeAlerting, typeID ) {

    let patternString = frictionIncreasingAtomsJigglingTemperaturePatternString;

    // Use the "first time" pattern string if it is the first time. Gracefully handle if there isn't a first time alert
    if ( alertObject.firstTime && firstTimeAlerting ) {
      patternString = frictionIncreasingAtomsJigglingTemperatureFirstPatternString;

      // use the fill in values for the first time
      alertObject = alertObject.firstTime;
    }
    let utterance = temperatureJiggleUtterance;
    if ( typeID === 'decreasing' ) {
      utterance = temperatureDecreasingUtterance;
    }

    utterance.alert = StringUtils.fillIn( patternString, {
      temperature: alertObject.temp,
      jigglingAmount: alertObject.jiggle
    } );

    this.alertDescriptionUtterance( utterance );

    voicingUtteranceQueue.addToBack( utterance );
  }
}

// @public - Threshold that must be reached from initial temp to new temp to alert that the temperature changed, in amplitude (see model for more info)
FrictionAlertManager.TEMPERATURE_ALERT_THRESHOLD = 1.5;

friction.register( 'FrictionAlertManager', FrictionAlertManager );

export default FrictionAlertManager;