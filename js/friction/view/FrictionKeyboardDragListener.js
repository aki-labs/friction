// Copyright 2017-2022, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { KeyboardDragListener } from '../../../../scenery/js/imports.js';
import friction from '../../friction.js';

class FrictionKeyboardDragListener extends KeyboardDragListener {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   */
  constructor( model, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter ) {

    super( {
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
    } );
  }
}

friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

export default FrictionKeyboardDragListener;