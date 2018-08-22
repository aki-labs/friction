// Copyright 2018, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( ( require ) => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );

  // a11y strings
  const jigglingLessString = FrictionA11yStrings.jigglingLess.value;
  const coolerString = FrictionA11yStrings.cooler.value;
  const nowCoolerString = FrictionA11yStrings.nowCooler.value;
  const lessString = FrictionA11yStrings.less.value;
  const evenLessString = FrictionA11yStrings.evenLess.value;
  const evenCoolerString = FrictionA11yStrings.evenCooler.value;

  const DECREASING = [
    {
      jiggle: lessString,
      temp: nowCoolerString,
      firstTime: {
        jiggle: jigglingLessString,
        temp: coolerString
      }
    },
    {
      jiggle: lessString,
      temp: nowCoolerString
    },
    {
      jiggle: evenLessString,
      temp: evenCoolerString
    }
  ];

  const ALERT_TIME_DELAY = 3000;

  // the singleton instance of this describer, used for the entire instance of the sim.
  let describer = null;

  /**
   * Responsible for alerting when the temperature increases
   * @param {Object} [options]
   * @constructor
   */
  class TemperatureDecreasingDescriber {
    constructor( model ) {
      this.model = model;

      // decides whether or not this describer is enabled basically.
      // just manages whether or not we are checking to see if the threshold is increasing enough
      this.tempDecreasing = false;

      this.alertPotentialStart = Date.now();

      this.amplitudeListener = ( amplitude, oldAmplitude ) => {

        // manage which way th temp is going
        this.tempDecreasing = oldAmplitude > amplitude;

        if ( this.tempDecreasing &&
             Date.now() - this.alertPotentialStart > ALERT_TIME_DELAY ) {
          this.alertDecrease();
        }
      };
      this.model.amplitudeProperty.link( this.amplitudeListener );
    }

    dragEnded() {
      this.alertIndex = -1; //reset
    }

    alertDecrease() {
      this.alertIndex++;
      var currentAlertIndex = Math.min( this.alertIndex, DECREASING.length - 1 );

      // TODO manage the "first time" stuff
      FrictionAlertManager.alertTemperatureJiggleFromObject( DECREASING[ currentAlertIndex ], false, 'decreasing' );

      this.alertPotentialStart = Date.now();

    }

  }

  /**
   * Uses the singleton pattern to keep one instance of this describer for the entire lifetime of the sim.
   * @param {FrictionModel} [model]
   * @returns {*}
   */
  TemperatureDecreasingDescriber.getDescriber = ( model ) => {

    if ( describer ) {
      return describer;
    }
    assert && assert( model, 'arg required to instantiate TemperatureDecreasingDescriber' );
    describer = new TemperatureDecreasingDescriber( model );
    return describer;
  };


  return friction.register( 'TemperatureDecreasingDescriber', TemperatureDecreasingDescriber );
} );