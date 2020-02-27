// Copyright 2018-2019, University of Colorado Boulder

/**
 * Manager for the alerts that are dynamically emitted in the simulation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import FrictionA11yStrings from '../FrictionA11yStrings.js';

// a11y strings
const frictionIncreasingAtomsJigglingTemperatureFirstPatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperatureFirstPattern.value;
const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperaturePattern.value;
const atomsJiggleTinyBitTempCoolString = FrictionA11yStrings.atomsJiggleTinyBitTempCool.value;

// utterance for announcing temperature and particle changes, persistent reference to use
// alertStableDelay feature of utterance
const temperatureJiggleUtterance = new Utterance();

const FrictionAlertManager = {

  /**
   * @param {object} alertObject - data object holding strings for alert, see this.ALERT_SCHEMA
   * @param {boolean} firstTimeAlerting - if it is the first time alerting this alert, there could be a special case in the data object
   * @param {string} [typeID]
   * @public
   */
  alertTemperatureJiggleFromObject: function( alertObject, firstTimeAlerting, typeID ) {

    let patternString = frictionIncreasingAtomsJigglingTemperaturePatternString;

    // Use the "first time" pattern string if it is the first time. Gracefully handle if there isn't a first time alert
    if ( alertObject.firstTime && firstTimeAlerting ) {
      patternString = frictionIncreasingAtomsJigglingTemperatureFirstPatternString;

      // use the fill in values for the first time
      alertObject = alertObject.firstTime;
    }

    const string = StringUtils.fillIn( patternString, {
      temperature: alertObject.temp,
      jigglingAmount: alertObject.jiggle
    } );

    temperatureJiggleUtterance.alert = string;
    phet.joist.sim.utteranceQueue.addToBack( temperatureJiggleUtterance );
  },

  /**
   * Alert the state of the cool and settled atoms.
   * @public
   */
  alertSettledAndCool: function() {
    phet.joist.sim.utteranceQueue.addToBack( atomsJiggleTinyBitTempCoolString );
  },

  // Threshold that must be reached from initial temp to new temp to alert that the temperature changed, in amplitude (see model for more info)
  TEMPERATURE_ALERT_THRESHOLD: 1.5

};


friction.register( 'FrictionAlertManager', FrictionAlertManager );

export default FrictionAlertManager;