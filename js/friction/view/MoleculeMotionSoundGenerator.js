// Copyright 2018-2019, University of Colorado Boulder

/**
 * a sound generator used to indicate the amount of molecule motion in the Friction simulation
 *
 * @author John Blanco
 */

// Copyright 2018, University of Colorado Boulder

/**
 * sound generator used for indicating the position of the arm in the John Travoltage sim, may be generalized at some
 * future for other purposes
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import bounceMarimbaSound from '../../../sounds/bounce-marimba_mp3.js';
import friction from '../../friction.js';
import FrictionConstants from '../FrictionConstants.js';
import FrictionModel from '../model/FrictionModel.js';

// sounds

class MoleculeMotionSoundGenerator extends SoundGenerator {

  /**
   * @constructor
   * {Property.<number>} moleculeAmplitudeProperty - amplitude of molecule motion
   * {Object} [options]
   */
  constructor( moleculeAmplitudeProperty, options ) {

    options = merge( {
      maxOutputLevel: 1 // max gain for this sound generator, sets the overall output of this sound generator
    }, options );

    super( options );

    // create several instances of the sound clip at different volume levels to allow more variation in the sound
    const motionSoundClips = [
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 1 } ),
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 0.75 } ),
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 0.5 } ),
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 0.25 } )
    ];

    // connect up the sound clips
    motionSoundClips.forEach( motionSoundClip => { motionSoundClip.connect( this.masterGainNode ); } );

    moleculeAmplitudeProperty.lazyLink( amplitude => {

      // Normalize the amplitude value.  Note that the min amplitude is always 1.
      const normalizedAmplitude = Math.min( ( amplitude - 1 ) / FrictionModel.VIBRATION_AMPLITUDE_MAX, 1 );

      // Map normalized amplitude to volume.  This uses a shifted sigmoid function, since that is what seems to sound
      // the best.
      const moleculeMotionSoundVolume = 1 / ( 1 + Math.pow( Math.E, -10 * ( normalizedAmplitude - 0.5 ) ) );
      this.setOutputLevel( options.maxOutputLevel * moleculeMotionSoundVolume );

      // choose a sound clip (this creates variation in the output level for each play operation)
      const soundClip = phet.joist.random.sample( motionSoundClips );

      // set the playback rate in a way that sounds good with other sounds that are playing
      soundClip.playbackRate = FrictionConstants.GET_RANDOM_PENTATONIC_PLAYBACK_RATE();

      soundClip.play();
    } );
  }

}

friction.register( 'MoleculeMotionSoundGenerator', MoleculeMotionSoundGenerator );

export default MoleculeMotionSoundGenerator;