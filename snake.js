;
var fundaSnake = (function ($) {

  /*
   funda 404 snake
   ---------------
  */

  //
  var ticker;
  var ticks = 0;
  var score = 0;
  var speed = 100; //ms between ticks
  var gridSize;
  var gridHeight;
  var gridWidth;

  var nextControlDirection = 'right';
  var currentControlDirection = 'right';

  var growStack = 2; // initial growth
  var snackSize = 4;
  var startingNumberOfSnacks = 5;

  var $main = $('#main');
  var $score = $('#score');
  var blokjeTemplate = '<div class="blokje"></div>';
  var snackTemplate = '<div class="blokje snack"></div>';

  var dead = false;

  var snake = [];
  var snacks = [];

  function SnakeSegment(element, position, blokjeType) {
    this.position = position || [0, 0]; //[x, y], starting from the top left
    this.$element = element;
    this.$element.css({height: gridSize + 'px', width: gridSize + 'px'});
    this.$element.addClass(blokjeType)
  }

  function startGame() {
    var head;

    console.log('-TB- Starting snake!');
    addControlHandlers();

    gridSize = $main.innerWidth() / 48;
    gridHeight = Math.floor($main.innerHeight() / gridSize);
    gridWidth = Math.floor($main.innerWidth() / gridSize);

    head = new SnakeSegment($(blokjeTemplate), [4,4], 'head');
    snake.push(head);
    $main.append(head.$element);

    $score.html(score);

    updateSnakeElements();

    for(var j=0 ; j < startingNumberOfSnacks ; j++) {
      placeSnack();
    }
    ticker = setInterval(tick, speed);
  }

  function tick() {
    ticks++;

    currentControlDirection = nextControlDirection;

    growSnake();
    calculateSnakeMovement(currentControlDirection);

    if (!dead) updateSnakeElements(currentControlDirection);
  }


  function growSnake() {

    if (growStack === 0) {
      return;
    }

    var lastSegment = snake[snake.length - 1];
    var newSegment = new SnakeSegment($(blokjeTemplate), lastSegment.position, 'snake');

    snake.push(newSegment);
    $main.append(newSegment.$element);
    growStack--;
  }


  function calculateSnakeMovement(direction) {

    var x = snake[0].position[0];
    var y = snake[0].position[1];
    var newHeadPosition;
    var i, nextPosition;

    switch (direction) {
      case 'left':
        x--;
        break;
      case 'up':
        y--;
        break;
      case 'right':
        x++;
        break;
      case 'down':
        y++;
        break;
      default:
        return;
    }


    newHeadPosition = [x, y];
    checkDeath(newHeadPosition);
    checkSnack(newHeadPosition);

    //overwrite position of tail with preceding position, ending with the new pos for head
    for (i = snake.length - 1 ; i >= 1 ; i--) {
      nextPosition = snake[i - 1].position;
      snake[i].position = nextPosition;
    }
    snake[0].position = newHeadPosition;
  }

  function checkDeath(headPosition) {
    var x = headPosition[0];
    var y = headPosition[1];
    if (x < 0 || y < 0 || x > gridWidth || y > gridHeight) {
      die();
    }
    snake.forEach(function check(segment, index) {
      if (segment.position[0] === headPosition[0] && segment.position[1] === headPosition[1]) {
        die();
      }
    });
  }

  function die() {
    dead = true;
    clearInterval(ticker);
    snake.forEach(function check(segment, index) {
      segment.$element.css('background-color', 'red')
    });
  }

  function updateSnakeElements(currentControlDirection) {
    snake.forEach(function updateSegment(segment, index) {
      segment.$element.css({
        left: segment.position[0] * gridSize,
        top: segment.position[1] * gridSize
      }).attr('direction', currentControlDirection);
    });
  }

  function placeSnack() {
    var snackPosition;
    var snack;

    while (!snackPosition) {
      snackPosition = findSnackSpace();
    }

    snack = new SnakeSegment($(snackTemplate), snackPosition);
    snacks.push(snack);
    snack.$element.css({left: snack.position[0] * gridSize, top: snack.position[1] * gridSize});
    $main.append(snack.$element);
  }

  function findSnackSpace() {

    var x = Math.round(Math.random() * (gridWidth - 1));
    var y = Math.round(Math.random() * (gridHeight -1));
    var found = [x,y];

    snake.forEach(function checkSegment(segment, index) { //TODO: use breakable jQuery loop
      if (segment.position[0] === x && segment.position[1] === y) {
        found = false;
      }
    });

    if (!found) return found; // IKEA shortcut

    snacks.forEach(function cjackSnack(snack, index) {
      if (snack.position[0] === x && snack.position[1] === y) {
        found = false;
      }
    });

    return found;
  }

  function checkSnack(headPosition) {
    snacks.forEach(function check(snack, index) {
      if (snack.position[0] === headPosition[0] && snack.position[1] === headPosition[1]) {
        eatSnack(index)
      }
    });
  }

  function eatSnack(index) {
    snacks[index].$element.remove();
    snacks.splice(index, 1);

    score++;
    $score.html(score);
    growStack += snackSize;
    placeSnack();
  }


  function addControlHandlers() {
    $(window).keydown(function (event) {
      switch (event.which) {
        case 37: // left
          if (currentControlDirection !== 'right') {
            nextControlDirection = 'left';
          }
          break;
        case 38: // up
          if (currentControlDirection !== 'down') {
            nextControlDirection = 'up';
          }
          break;
        case 39: // right
          if (currentControlDirection !== 'left') {
            nextControlDirection = 'right';
          }
          break;
        case 40: // down
          if (currentControlDirection !== 'up') {
            nextControlDirection = 'down';
          }
          break;
        default:
            console.log('-TB- STOP');
            clearInterval(ticker);
          return; // exit this handler for other keys
      }
      event.preventDefault(); // prevent the default action (scroll / move caret)
    });
  }



  return {
    startGame: startGame
  }
})(jQuery);
