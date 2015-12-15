// Inspiration: https://www.youtube.com/watch?v=bXn4_JkVFVo

var pointers = {};
var hasStarted = false;
var isPlaying = false;
var grabActionPerformed = false;

var $width = ($(document).width())/255;
var $height = ($(document).height())/255;

// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

gainNode.gain.value = 0.1;
// connect oscillator to gain node to speakers

// 220 - 880

gainNode.connect(audioCtx.destination);


Leap.loop(function(frame) {

  if (frame.hands.length > 0 && hasStarted == false) {
    oscillator.connect(gainNode);
    oscillator.type = 'square';
    oscillator.frequency.value = 220; // value in hertz
    oscillator.start();

    isPlaying = true;
    hasStarted = true;
  }

  if(frame.hands.length === 1) {
    $('.pointer-1').addClass('hidden');
    $('.pointer-0').removeClass('hidden');
  } else if (frame.hands.length === 0) {
    $('.pointer-0').addClass('hidden');
  } else {
    $('.pointer-0, .pointer-1').removeClass('hidden');
  }

  // Funky background mode
  // if (frame.hands.length == 2 ) {
  //   $('body').css({'background':'rgb(' + Math.floor((frame.hands[1].screenPosition()[0]/$width)) + ',' + Math.floor((frame.hands[0].screenPosition()[1]/$height)) + ',' + Math.floor((frame.hands[1].screenPosition()[0]/$width)) + ')'})
  // }

  frame.hands.forEach(function(hand, index) {
    var pointer = ( pointers[index] || (pointers[index] = new Pointer(index)) );
    pointer.setTransform(hand.screenPosition());
    pointer.setProperties(hand.screenPosition());

    // console.log(hand);

    if (hand.grabStrength == 1) {
      pointer.startGrab();
      if (!grabActionPerformed) {
          if (isPlaying) {
              oscillator.stop(0);
          } else {
              oscillator.start();
          }
          grabActionPerformed = true;
      }
    } else {
      pointer.finishGrab();
    }

    if (hand.pinchStrength == 1 && hand.confidence > 0.5) {
      pointer.startPinch();
    } else {
      pointer.finishPinch();
    }

    if (hand.type == 'left') {
      gainNode.gain.value = 0.001 * ( 3 * (100 - ~~((hand.screenPosition()[1] / window.innerHeight) * 100)));
      pointer.markLeft();
    }

    if (hand.type == 'right') {
      oscillator.frequency.value = 120 * (100 - ~~((hand.screenPosition()[1] / window.innerHeight) * 100)) / 20;
      // console.log(oscillator.frequency.value)
      pointer.markRight();
    }

  });



}).use('screenPosition', {scale: 0.55});



var Pointer = function(index) {
  var pointer = this;

  pointer.setTransform = function(position) {
    div.style.left = (position[0] - 25) + 'px';
    div.style.top  = (position[1] - 25) + 'px';
    div.style.webkitTransform = div.style.MozTransform = div.style.msTransform = div.style.OTransform = div.style.transform;
  }

  pointer.setProperties = function(position) {
    pointer.x = position[0];
    pointer.y = position[1];
    pointer.top = 100 - ~~((position[1] / window.innerHeight) * 100);
    pointer.left = 100 - ~~((position[0] / window.innerWidth) * 100);
  }

  pointer.startGrab = function() {
    div.classList.add("grabbed");
  }

  pointer.finishGrab = function() {
    div.classList.remove("grabbed");
    grabActionPerformed = false;
  }

  pointer.startPinch = function() {
    div.classList.add("pinched");
  }

  pointer.finishPinch = function() {
    div.classList.remove("pinched");
  }

  pointer.markLeft = function() {
    div.classList.add('left-hand');
    div.classList.remove('right-hand');
  }

  pointer.markRight = function() {
    div.classList.add('right-hand');
    div.classList.remove('left-hand');
  }

  var div = document.createElement('div');
  div.className = 'pointer-'+index;
  div.style.position = 'absolute';
  pointer.setTransform([window.innerWidth/2,window.innerHeight/2], 0);
  document.body.appendChild(div);

};

pointers[0] = new Pointer(0);

// This allows us to move the pointers even when not focused
Leap.loopController.setBackground(false)


