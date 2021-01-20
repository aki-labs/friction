// Copyright 2013-2020, University of Colorado Boulder

/**
 * The model for the Friction sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import friction from '../../friction.js';
import FrictionConstants from '../FrictionConstants.js';
import Atom from './Atom.js';

// constants
const ATOM_RADIUS = FrictionConstants.ATOM_RADIUS; // radius of single atom
const ATOM_SPACING_Y = 20; // y-distance between neighbors (atoms)
const INITIAL_ATOM_SPACING_Y = 25; // initial distance between top and bottom atoms
const VIBRATION_AMPLITUDE_MIN = 1; // min amplitude for an atom
const AMPLITUDE_EVAPORATE = 7; // evaporation amplitude for an atom
const VIBRATION_AMPLITUDE_MAX = 12; // atom's max amplitude
const TOP_BOOK_ATOMS_COLOR = FrictionConstants.TOP_BOOK_ATOMS_COLOR; // color of top book
const BOTTOM_BOOK_ATOMS_COLOR = FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR; // color of bottom
const COOLING_RATE = 0.2; // proportion per second; adjust in order to change the cooling rate
const HEATING_MULTIPLIER = 0.0075; // multiplied by distance moved while in contact to control heating rate
const EVAPORATION_AMPLITUDE_REDUCTION = 0.01; // decrease in amplitude (a.k.a. temperature) when an atom evaporates
const MAX_X_DISPLACEMENT = 600; // max allowed distance from center x
const MIN_Y_POSITION = -70; // empirically determined such that top book can't be completely dragged out of frame
const DEFAULT_ROW_START_X_POSITION = 50;

// atoms of top book, contains 5 rows, 4 of which can evaporate and 1 that can't
const TOP_BOOK_ATOM_STRUCTURE = [

  /*
   * First row:
   * contains 30 atoms that can not evaporate.
   */
  [
    { num: 30 }
  ],

  /*
   * Second row:
   * contains 29 atoms that can evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   */
  [
    { offset: 0.5, num: 29, canEvaporate: true }
  ],

  /*
   * Third row:
   * contains 29 atoms that can evaporate.
   */
  [
    { num: 29, canEvaporate: true }
  ],

  /*
   * Fourth row:
   * contains 24 atoms, separated into 5 groups that can evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   */
  [
    { offset: 0.5, num: 5, canEvaporate: true },
    { offset: 6.5, num: 8, canEvaporate: true },
    { offset: 15.5, num: 5, canEvaporate: true },
    { offset: 21.5, num: 5, canEvaporate: true },
    { offset: 27.5, num: 1, canEvaporate: true }
  ],

  /*
   * Fifth row:
   * contains 9 atoms, separated into 5 groups that can evaporate.
   */
  [
    { offset: 3, num: 2, canEvaporate: true },
    { offset: 8, num: 1, canEvaporate: true },
    { offset: 12, num: 2, canEvaporate: true },
    { offset: 17, num: 2, canEvaporate: true },
    { offset: 24, num: 2, canEvaporate: true }
  ]
];

// atoms of bottom book (contains 3 rows that can not evaporate)
const BOTTOM_BOOK_ATOM_STRUCTURE = [

  /*
   * First row:
   * contains 29 atoms that can not evaporate.
   */
  [
    { num: 29 }
  ],

  /*
   * Second row:
   * contains 28 atoms that can not evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   */
  [
    { offset: 0.5, num: 28 }
  ],

  /*
   * Third row:
   * contains 29 atoms that can not evaporate.
   */
  [
    { num: 29 }
  ]
];


// pdom
// iterate through the constant to determine the number of atoms that can evaporate from the top book structure
let atoms = 0;
TOP_BOOK_ATOM_STRUCTURE.map( row => {
  row.forEach( schema => {
    if ( schema.canEvaporate ) {
      atoms += schema.num;
    }
  } );
} );

// the number of evaporable atoms in the top book
const NUMBER_OF_EVAPORABLE_ATOMS = atoms;

// information about the nature of the atoms that will be shown in the magnifier window
const MAGNIFIED_ATOMS_INFO = {
  radius: ATOM_RADIUS,
  distanceX: FrictionConstants.INITIAL_ATOM_SPACING_X,
  distanceY: FrictionConstants.INITIAL_ATOM_SPACING_Y,
  distance: INITIAL_ATOM_SPACING_Y,
  vibrationAmplitude: new Range( VIBRATION_AMPLITUDE_MIN, VIBRATION_AMPLITUDE_MAX ),
  evaporationLimit: AMPLITUDE_EVAPORATE,
  top: {
    color: TOP_BOOK_ATOMS_COLOR,
    layerDescriptions: TOP_BOOK_ATOM_STRUCTURE
  },
  bottom: {
    color: BOTTOM_BOOK_ATOMS_COLOR,
    layerDescriptions: BOTTOM_BOOK_ATOM_STRUCTURE
  }
};

class FrictionModel {

  /**
   * @param {number} width - width in view=model coordinates
   * @param {number} height - height in view=model coordinates
   * @param {Tandem} tandem
   */
  constructor( width, height, tandem ) {

    // @public (read-only) {Number} - the width for the model in model coordinates
    this.width = width;

    // @public (read-only) {Number} - the height for the model in model coordinates
    this.height = height;

    // @private {Number} - track how much to evaporate in step() to prevent a Property loop
    this.scheduledEvaporationAmount = 0;

    // @public (phet-io) - Instrumented so that PhET-iO clients can get a message when an atom evaporates
    this.evaporationEmitter = new Emitter( {
      tandem: tandem.createTandem( 'evaporationEmitter' ),
      phetioDocumentation: 'Emits when atoms evaporate from the top book'
    } );

    // @public (read-only) {Atom[][]}- array of all atoms which are able to evaporate organized by row such that the
    // last rows should be evaporated first
    this.evaporableAtomsByRow = [];

    // @public (read-only) {NumberProperty} - atoms temperature = amplitude of oscillation
    this.vibrationAmplitudeProperty = new NumberProperty( MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min, {
      range: MAGNIFIED_ATOMS_INFO.vibrationAmplitude,

      tandem: tandem.createTandem( 'vibrationAmplitudeProperty' ),
      phetioDocumentation: 'A relative, qualitative value describing the amount of vibration of the atoms',
      phetioHighFrequency: true,
      phetioReadOnly: true
    } );

    // @public (read-only) - position of top book, can by dragged the user
    this.topBookPositionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'topBookPositionProperty' ),
      phetioHighFrequency: true
    } );

    // @public {NumberProperty} - distance between books
    this.distanceBetweenBooksProperty = new NumberProperty( MAGNIFIED_ATOMS_INFO.distance );

    // @public {NumberProperty} - additional offset, results from drag
    this.bottomOffsetProperty = new NumberProperty( 0 );

    // @public (read-only) {NumberProperty} - number of rows of atoms available to evaporate, goes down as book wears away
    this.atomRowsToEvaporateProperty = new NumberProperty( TOP_BOOK_ATOM_STRUCTURE.length - 1 );

    // @private - are books in contact?
    this.contactProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'contactProperty' )
    } );

    // @public {BooleanProperty} - Show hint icon. Only set by model and on a11y grab interaction.
    this.hintProperty = new BooleanProperty( true );

    // @public {Number} (read-only) - drag and drop book coordinates conversion coefficient
    this.bookDraggingScaleFactor = 0.025;

    // group tandem for creating the atoms
    const atomGroupTandem = tandem.createGroupTandem( 'atoms' );

    // @public (read-only) {Atom[]} - array of atoms that are visible to the user in the magnifier window
    this.atoms = [];

    // @public (read-only)
    // {number} the count of how many atoms have been evaporated
    this.numberOfAtomsEvaporated = 0;

    this.evaporationEmitter.addListener( () => {
      this.numberOfAtomsEvaporated += 1;
    } );

    // add the atoms that are visible in the top book
    MAGNIFIED_ATOMS_INFO.top.layerDescriptions.forEach( ( layerDescription, i ) => {
      addAtomRow(
        this,
        layerDescription,
        DEFAULT_ROW_START_X_POSITION,
        FrictionConstants.MAGNIFIER_WINDOW_HEIGHT / 3 - INITIAL_ATOM_SPACING_Y + ATOM_SPACING_Y * i,
        true, // isTopAtom
        atomGroupTandem
      );
    } );

    // add the atoms that are visible in the bottom book
    MAGNIFIED_ATOMS_INFO.bottom.layerDescriptions.forEach( ( layerDescription, i ) => {
      addAtomRow(
        this,
        layerDescription,
        DEFAULT_ROW_START_X_POSITION,
        2 * FrictionConstants.MAGNIFIER_WINDOW_HEIGHT / 3 + ATOM_SPACING_Y * i,
        false, // isTopAtom
        atomGroupTandem
      );
    } );

    // check atom's contact
    this.distanceBetweenBooksProperty.link( distance => {
      this.contactProperty.set( Math.floor( distance ) <= 0 );
    } );

    // set distance between atoms and set the amplitude if they are in contact
    this.topBookPositionProperty.link( ( newPosition, oldPosition ) => {
      oldPosition = oldPosition || Vector2.ZERO;
      this.distanceBetweenBooksProperty.set( this.distanceBetweenBooksProperty.get() - ( newPosition.minus( oldPosition ) ).y );
      if ( this.contactProperty.get() ) {
        const dx = Math.abs( newPosition.x - oldPosition.x );
        const newValue = this.vibrationAmplitudeProperty.get() + dx * HEATING_MULTIPLIER;
        this.vibrationAmplitudeProperty.set( Math.min( newValue, MAGNIFIED_ATOMS_INFO.vibrationAmplitude.max ) );
      }
    } );

    // evaporation check
    this.vibrationAmplitudeProperty.link( amplitude => {
      if ( amplitude > MAGNIFIED_ATOMS_INFO.evaporationLimit ) {
        this.tryToEvaporate();
      }
    } );
  }


  /**
   * Move forward in time
   * @param {number} dt - in seconds
   * @public
   */
  step( dt ) {

    // step the atoms, which is how they vibrate and move away if they evaporate
    for ( let i = 0; i < this.atoms.length; i++ ) {
      this.atoms[ i ].step( dt );
    }

    // cool the atoms
    let amplitude = this.vibrationAmplitudeProperty.get() - this.scheduledEvaporationAmount;
    amplitude = Math.max( MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min, amplitude * ( 1 - dt * COOLING_RATE ) );
    this.vibrationAmplitudeProperty.set( amplitude );

    this.scheduledEvaporationAmount = 0;
  }

  /**
   * Restores the initial conditions.
   * @public
   */
  reset() {
    this.vibrationAmplitudeProperty.reset();
    this.topBookPositionProperty.reset();
    this.distanceBetweenBooksProperty.reset();
    this.bottomOffsetProperty.reset();
    this.atomRowsToEvaporateProperty.reset();
    this.contactProperty.reset();
    this.hintProperty.reset();
    this.atoms.forEach( atom => {
      atom.reset();
    } );
    this.numberOfAtomsEvaporated = 0;
  }

  /**
   * Move the book, checking to make sure the new position is valid. If the book is going to move out of bounds,
   * prevent movement.
   * @param {Vector2} delta
   * @public
   */
  move( delta ) {
    assert && assert( delta instanceof Vector2, 'delta should be a Vector2' );
    this.hintProperty.set( false );

    // check bottom offset
    if ( this.bottomOffsetProperty.get() > 0 && delta.y < 0 ) {
      this.bottomOffsetProperty.set( this.bottomOffsetProperty.get() + delta.y );
      delta.y = 0;
    }

    // Check if the motion vector would put the book in an invalid position and limit it if so.
    if ( delta.y > this.distanceBetweenBooksProperty.get() ) {
      this.bottomOffsetProperty.set( this.bottomOffsetProperty.get() + delta.y - this.distanceBetweenBooksProperty.get() );
      delta.y = this.distanceBetweenBooksProperty.get();
    }
    else if ( this.topBookPositionProperty.get().y + delta.y < MIN_Y_POSITION ) {
      delta.y = MIN_Y_POSITION - this.topBookPositionProperty.get().y; // Limit book from going out of magnifier window.
    }
    if ( this.topBookPositionProperty.get().x + delta.x > MAX_X_DISPLACEMENT ) {
      delta.x = MAX_X_DISPLACEMENT - this.topBookPositionProperty.get().x;
    }
    else if ( this.topBookPositionProperty.get().x + delta.x < -MAX_X_DISPLACEMENT ) {
      delta.x = -MAX_X_DISPLACEMENT - this.topBookPositionProperty.get().x;
    }

    // set the new position
    this.topBookPositionProperty.set( this.topBookPositionProperty.get().plus( delta ) );
  }

  /**
   * determine whether an atom is available to be evaporated and, if so, evaporate it
   * @private
   */
  tryToEvaporate() {

    // only if this value points to a proper index in evaporableAtomsByRow. If negative, there are likely no more evaporable rows
    if ( this.atomRowsToEvaporateProperty.get() > 0 ) {

      // determine whether the current row is fully evaporated and, if so, move to the next row
      const currentRowOfEvaporableAtoms = this.evaporableAtomsByRow[ this.atomRowsToEvaporateProperty.get() - 1 ];

      // if there are any rows of evaporable atoms left, evaporate one
      if ( currentRowOfEvaporableAtoms.length > 0 ) {

        // make a list of all atoms in this row that have not yet evaporated
        const unevaporatedAtoms = currentRowOfEvaporableAtoms.filter( atom => !atom.isEvaporated );

        assert && assert(
          unevaporatedAtoms.length > 0,
          'should never encounter this case, if we do, something is wrong in logic above'
        );

        // randomly choose an unevaporated atom and evaporate it
        const atomToEvaporate = phet.joist.random.sample( unevaporatedAtoms );
        atomToEvaporate.evaporate();
        this.evaporationEmitter.emit();

        // cause some cooling due to evaporation
        this.scheduledEvaporationAmount = this.scheduledEvaporationAmount + EVAPORATION_AMPLITUDE_REDUCTION;
      }

      const isCurrentRowFullyEvaporated = _.every( currentRowOfEvaporableAtoms, atom => atom.isEvaporated );

      // if all atoms in this row are evaporated, move on to the next row
      if ( isCurrentRowFullyEvaporated ) {

        // point one row higher because all of the previous row is evaporated
        this.atomRowsToEvaporateProperty.set( this.atomRowsToEvaporateProperty.get() - 1 );

        // the current row is totally evaporated, so the distance between the books just increased "one row" worth.
        this.distanceBetweenBooksProperty.set( this.distanceBetweenBooksProperty.get() + MAGNIFIED_ATOMS_INFO.distanceY );

      }
    }
  }
}


// statics
FrictionModel.MAGNIFIED_ATOMS_INFO = MAGNIFIED_ATOMS_INFO;
FrictionModel.THERMOMETER_MIN_TEMP = MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
FrictionModel.THERMOMETER_MAX_TEMP = MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1; // ~7.7

// pdom - needed to get bounds for the keyboard drag handler, see https://github.com/phetsims/friction/issues/46
FrictionModel.MAX_X_DISPLACEMENT = MAX_X_DISPLACEMENT;
FrictionModel.MIN_Y_POSITION = MIN_Y_POSITION;

// pdom
FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS = NUMBER_OF_EVAPORABLE_ATOMS;

// pdom
FrictionModel.VIBRATION_AMPLITUDE_MIN = VIBRATION_AMPLITUDE_MIN;
FrictionModel.VIBRATION_AMPLITUDE_MAX = VIBRATION_AMPLITUDE_MAX;

// pdom - empirically determined value of when the atoms are "pretty much cool and settled"
FrictionModel.AMPLITUDE_SETTLED_THRESHOLD = VIBRATION_AMPLITUDE_MIN + .4;

// The drag bounds for the magnified book view
FrictionModel.MAGNIFIED_DRAG_BOUNDS = new Bounds2(
  -MAX_X_DISPLACEMENT, // left bound
  MIN_Y_POSITION, // top bound
  MAX_X_DISPLACEMENT, // right bound
  2000 );

// helper function to add a layer of atoms to the model
function addAtomRow( frictionModel, layerDescription, rowStartXPos, rowYPos, isTopAtom, atomGroupTandem ) {

  let canEvaporate;
  const evaporableAtomsRow = [];

  for ( let i = 0; i < layerDescription.length; i++ ) {
    const offset = layerDescription[ i ].offset || 0;
    canEvaporate = layerDescription[ i ].canEvaporate || false;
    for ( let n = 0; n < layerDescription[ i ].num; n++ ) {
      const atom = new Atom(
        new Vector2( rowStartXPos + ( offset + n ) * MAGNIFIED_ATOMS_INFO.distanceX, rowYPos ),
        frictionModel,
        isTopAtom,
        atomGroupTandem.createNextTandem()
      );
      frictionModel.atoms.push( atom );
      if ( canEvaporate ) {
        evaporableAtomsRow.push( atom );
      }
    }
  }
  if ( canEvaporate ) {
    frictionModel.evaporableAtomsByRow.push( evaporableAtomsRow );
  }
}

friction.register( 'FrictionModel', FrictionModel );

export default FrictionModel;