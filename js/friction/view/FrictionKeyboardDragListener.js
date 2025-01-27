// Copyright 2017-2022, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { KeyboardDragListener } from '../../../../scenery/js/imports.js';
import friction from '../../friction.js';
import merge from '../../../../phet-core/js/merge.js';

class FrictionKeyboardDragListener extends KeyboardDragListener {

  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param {Object} [options]
   */
  constructor( model, temperatureIncreasingAlerter,
               temperatureDecreasingAlerter, bookMovementAlerter,
               options ) {

    options = merge( {
      positionProperty: model.topBookPositionProperty,
      start: () => {
        temperatureIncreasingAlerter.startDrag();
        temperatureDecreasingAlerter.startDrag();
      },
      end: event => {

        temperatureIncreasingAlerter.endDrag();
        bookMovementAlerter.endDrag( event.domEvent );

      },
      dragBoundsProperty: model.topBookDragBoundsProperty
    }, options );

    super( options );
  }
}

friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

export default FrictionKeyboardDragListener;