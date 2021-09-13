// Copyright 2018-2021, University of Colorado Boulder

/**
 * MovementAlerter subtype that knows how to alert movement for Friction's chemistry book, which is pretty specific for a
 * freely draggable object.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import BorderAlertsDescriber from '../../../../scenery-phet/js/accessibility/describers/BorderAlertsDescriber.js';
import DirectionEnum from '../../../../scenery-phet/js/accessibility/describers/DirectionEnum.js';
import MovementAlerter from '../../../../scenery-phet/js/accessibility/describers/MovementAlerter.js';
import voicingUtteranceQueue from '../../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';
import LeftRightAlertPair from './LeftRightAlertPair.js';

// constants
const moveDownToRubHarderSentenceString = frictionStrings.a11y.moveDownToRubHarderSentence;
const rubFastOrSlowString = frictionStrings.a11y.rubFastOrSlow;

const DEFAULT_AT_TOP_ALERT = BorderAlertsDescriber.getDefaultTopAlert();
const DEFAULT_MOVEMENT_DESCRIPTIONS = MovementAlerter.getDefaultMovementDescriptions();

const atTopMoveDownResponsePacket = new ResponsePacket( {
  objectResponse: DEFAULT_AT_TOP_ALERT,
  hintResponse: moveDownToRubHarderSentenceString
} );

const rubFastOrSlowResponsePacket = new ResponsePacket( {
  hintResponse: rubFastOrSlowString
} );

const downRubFastOrSlowResponsePacket = rubFastOrSlowResponsePacket.copy();
downRubFastOrSlowResponsePacket.objectResponse = DEFAULT_MOVEMENT_DESCRIPTIONS.DOWN;


const moveDownToRubHarderUtterance = new Utterance( {
  alert: new ResponsePacket( {
    hintResponse: moveDownToRubHarderSentenceString
  } ),
  announcerOptions: {
    cancelOther: false
  }
} );

class BookMovementAlerter extends MovementAlerter {

  /**
   * @param {FrictionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      borderAlertsOptions: {

        // don't alert the bottom border alert because the model isn't set up to have that work based on the bounds
        bottomAlert: null,

        // override the default with an alert that will give two "verbose alerts" before repeating the basic default "at top"
        topAlert: new Utterance( {
          alert: atTopMoveDownResponsePacket
        } ),

        bounds: FrictionModel.MAGNIFIED_DRAG_BOUNDS,

        repeatBorderAlerts: true
      },

      alertMovementToVoicing: false
    }, options );

    super( model.topBookPositionProperty, options );

    // @private
    this.model = model;

    // @private
    this.bottomDescriptionUtterance = new Utterance( {
      alert: downRubFastOrSlowResponsePacket
    } );

    // @private
    this.bottomVoicingUtterance = new Utterance( {
      alert: rubFastOrSlowResponsePacket
    } );

    // {LeftRightAlertPair} - alert pairs to monitor if both left and right alerts have been triggered.
    this.contactedAlertPair = new LeftRightAlertPair();
    this.separatedAlertPair = new LeftRightAlertPair();

    // reset these properties when the contactProperty changes to false.
    model.contactProperty.lazyLink( ( newValue, oldValue ) => {

      // if the books were touching, and now they aren't, reset the ability for left/right alerts when contacted.
      if ( !newValue && oldValue ) {
        this.contactedAlertPair.reset(); // reset the pair monitoring the alerts when contacted.
      }
      else {

        // reset the pair monitoring the alerts when not contacted.
        this.separatedAlertPair.reset();
      }
    } );
  }

  /**
   * alert for a specific direction
   * @param {DirectionEnum} direction
   * @private
   */
  alertForDirection( direction ) {

    // A horizontal direction
    if ( DirectionEnum.isHorizontalDirection( direction ) ) {

      // are the books touching
      if ( this.model.contactProperty.get() ) {

        // if both the left and right alerts haven't yet been alerted yet while contacted
        if ( !this.contactedAlertPair.bothAlerted() ) {
          this.alertDirections( direction );
          this.contactedAlertPair.updateFromDirection( direction );
        }
      }

      // The books aren't touching
      else {

        // if both the left and right alerts haven't yet been alerted while separated
        if ( !this.separatedAlertPair.bothAlerted() ) {

          if ( this.model.vibrationAmplitudeProperty.value < FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
            this.alertDirections( direction );
          }
          this.separatedAlertPair.updateFromDirection( direction );
        }

          // If they have, then cue an movement and reset the alertPair
        // This means that we will get left/right alerts again after a "move down" cue
        else {
          this.alert( moveDownToRubHarderUtterance );
          this.separatedAlertPair.reset();
        }
      }
    }

    // if contacted and DOWN, we have a special alert
    else if ( this.model.contactProperty.get() && direction === DirectionEnum.DOWN ) {
      this.alert( this.bottomDescriptionUtterance );

      // Manually ignore MovementAlerter.alertMovementToVoicing for this call, because we want to hear this for voicing
      voicingUtteranceQueue.addToBack( this.bottomVoicingUtterance );
    }

    // base case
    else {
      this.alertDirections( direction );
    }
  }

  /**
   * Alert a movement direction. Overridden for specific alert features for Friction, i.e. the alerts change if
   * the two books are in contact.
   * @override
   * @public
   */
  alertDirectionalMovement() {
    const newPosition = this.positionProperty.get();
    if ( !newPosition.equals( this.lastAlertedPosition ) ) {
      const directions = this.getDirections( newPosition, this.lastAlertedPosition );

      directions.forEach( direction => {
        this.alertForDirection( direction );
      } );

      // Update the last alerted position even if this.alertForDirection doesn't put anything on utteranceQueue, see https://github.com/phetsims/friction/issues/149#issuecomment-444458179
      // This has to be done because this.alertForDirection only conditionally alerts using `this.alert`, but we still
      // want the model positions to be kept in sync.
      this.lastAlertedPosition = this.positionProperty.get();
    }
  }

  /**
   * @override
   * @public
   */
  reset() {
    super.reset();
    this.bottomDescriptionUtterance.reset();
    this.bottomVoicingUtterance.reset();
    this.contactedAlertPair.reset();
    this.separatedAlertPair.reset();
  }
}

friction.register( 'BookMovementAlerter', BookMovementAlerter );
export default BookMovementAlerter;