// Copyright 2018-2021, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book. This type serves as a central place to factor out duplicate description and voicing
 * implementations used by BookNode and MagnifierNode, both of which have almost identical interactions.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import friction from '../../friction.js';
import FrictionAlertManager from './FrictionAlertManager.js';

class FrictionGrabDragInteraction extends GrabDragInteraction {

  /**
   * @param {FrictionModel} model
   * @param {KeyboardDragListener} keyboardDragListener
   * @param {Node} wrappedNode
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {Object} [options]
   */
  constructor( model, keyboardDragListener, wrappedNode, grabbedDescriber, options ) {

    assert && assert( wrappedNode.isVoicing, 'wrappedNode must support voicing' );

    options = merge( {

      // Function that returns whether or not the drag cue should be shown.
      showDragCueNode: () => {
        return model.topBookPositionProperty.value.equals( model.topBookPositionProperty.initialValue );
      },

      // appended to in this type
      listenersForDragState: []
    }, options );


    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = event => {
      oldGrab && oldGrab();

      wrappedNode.alertDescriptionUtterance( grabbedDescriber.getGrabbedString() );

      // When using mouse/touch FrictionDragListener will cover voicing responses.
      if ( event.isFromPDOM() ) {

        // No name response from PDOM, that comes from focus
        wrappedNode.voicingSpeakResponse( {
          objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse(),
          hintResponse: grabbedDescriber.getVoicingGrabbedHintResponse()
        } );
      }
    };

    options.listenersForDragState.push( {

      // alert the temperature state on focus, TODO: this is not called right now, see https://github.com/phetsims/scenery-phet/issues/693
      focus: () => {
        if ( model.vibrationAmplitudeProperty.value === model.vibrationAmplitudeProperty.initialValue ) {
          FrictionAlertManager.alertSettledAndCool();
        }
      }
    } );

    wrappedNode.addInputListener( {
      focus: () => {

        // TODO: Hint "Space to Grab or Release." if we would show the grabDragHint. https://github.com/phetsims/friction/issues/211
        wrappedNode.voicingSpeakNameResponse();
      }
    } );

    super( wrappedNode, keyboardDragListener, options );

    // @private
    this.model = model;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.model.vibrationAmplitudeProperty.unlink( this.amplitudeListener );
  }
}

friction.register( 'FrictionGrabDragInteraction', FrictionGrabDragInteraction );
export default FrictionGrabDragInteraction;