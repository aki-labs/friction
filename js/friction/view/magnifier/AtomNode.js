// Copyright 2013-2018, University of Colorado Boulder

/**
 * view for single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var friction = require( 'FRICTION/friction' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var STEPS = 250; // steps until atom has completed evaporation movement

  /**
   * @param {FrictionModel} model
   * @param {Object} [options]
   * @constructor
   */
  function AtomNode( model, options ) {
    var self = this;
    var radius = model.atoms.radius;

    // TODO: mark these variables with visibility annotations
    this.isTopAtom = options.color === FrictionSharedConstants.TOP_BOOK_ATOMS_COLOR; // flag records whether we are on the top book
    this.isEvaporated = false;
    this.currentX = 0;
    this.currentY = 0;
    this.x0 = options.x; // TODO: is this variable used elsewhere?  Does it need a better name?
    this.y0 = options.y;
    this.model = model;
    this.options = options;
    Node.call( this, { x: this.x0, y: this.y0 } );

    // function for creating or obtaining atom graphic for a given color
    if ( !AtomNode.atomGraphics[ options.color ] ) {
      var scale = AtomNode.imageScale; // Scale up before rasterization so it won't be too pixellated/fuzzy, value empirically determined.
      var container = new Node( { scale: 1 / scale } );
      var atomNode = new Circle( radius, { fill: options.color, stroke: 'black', lineWidth: 1, scale: scale } );
      atomNode.addChild( new Circle( radius * 0.3, { fill: 'white', x: radius * 0.3, y: -radius * 0.3 } ) );
      atomNode.toImage( function( img, x, y ) {
        // add our actual HTMLImageElement to atomImages
        AtomNode.atomImages[ self.isTopAtom ] = img;
        AtomNode.atomOffset = new Vector2( -x, -y );

        // add a node with that image to our container (part of atomGraphics)
        container.addChild( new Node( {
          children: [
            new Image( img, { x: -x, y: -y } )
          ]
        } ) );
      } );
      AtomNode.atomGraphics[ options.color ] = container;
    }
    this.addChild( AtomNode.atomGraphics[ options.color ] );

    // move the atom as the top book moves if it is part of that book
    var motionVector = new Vector2(); // Optimization to minimize garbage collection.
    model.bookPositionProperty.lazyLink( function( newPosition, oldPosition ) {
      if ( self.isTopAtom && !self.isEvaporated ) {
        motionVector.set( newPosition );
        motionVector.subtract( oldPosition );
        self.x0 = self.x0 + motionVector.x;
        self.y0 = self.y0 + motionVector.y;
      }
    } );

    // update atom's position based on vibration and center position
    model.newStepProperty.link( function() {
      self.currentX = self.x0 + model.amplitudeProperty.get() * ( Math.random() - 0.5 );
      self.currentY = self.y0 + model.amplitudeProperty.get() * ( Math.random() - 0.5 );
    } );
  }

  // export information needed to directly render the images
  AtomNode.imageScale = 3;
  AtomNode.atomGraphics = {};
  AtomNode.atomImages = {};
  AtomNode.atomOffset = null; // NOTE: this is OK for now because the atoms are the same size, and the toImage'd images should have the exact same offsets

  friction.register( 'AtomNode', AtomNode );

  return inherit( Node, AtomNode, {

    /**
     * TODO: visibility annotation
     */
    evaporate: function() {
      var self = this;

      this.isEvaporated = true;

      var evaporationDestinationX = this.x0 + 4 * this.model.width * ( Math.round( Math.random() ) - 0.5 );
      var dx = ( evaporationDestinationX - this.x0 ) / STEPS;
      var evaporationDestinationY = this.y0 + Math.random() * 1.5 * this.getYrange();
      var dy = ( evaporationDestinationY - this.y0 ) / STEPS;

      // create and attach the evaporation motion handler
      this.handler = function() {
        self.x0 += dx;
        self.y0 -= dy;

        // TODO: memory leak for atoms moving to the left?
        if ( self.x0 > 4 * self.model.width ) {
          self.model.newStepProperty.unlink( self.handler );
          self.setVisible( false );
        }
      };

      // TODO: why is this linking every time it evaporates?  Can it only evaporate once?
      // TODO: does this file need a dispose function?
      this.model.newStepProperty.link( self.handler );
    },

    /**
     * TODO: visibility annotation
     * @returns {number}
     */
    // TODO: fix casing on the name
    getYrange: function() {
      return this.model.distanceProperty.get() + this.model.atoms.distanceY * this.model.toEvaporate.length;
    },

    /**
     * @public
     */
    reset: function() {
      this.x0 = this.options.x;
      this.y0 = this.options.y;

      // handler may have been unlinked by itself (see above), so check that we're still registered
      if ( this.model.newStepProperty.hasListener( this.handler ) ) {
        this.model.newStepProperty.unlink( this.handler );
      }
      this.setVisible( true );
      this.isEvaporated = false;
    }
  } );
} );
