class Snake{
    constructor(x,y,size){
        this.x=x;
        this.y=y;
        this.size=size;
        this.tail=[{x:this.x, y:this.y}];
        this.rotateX=0;
        this.rotateY=1;
        this.nextDirection=null;
        this.growing = false;
    }

    move(){
        if (this.nextDirection) {
            const { rotateX, rotateY } = this.nextDirection;
            
            if (!(this.rotateX === -rotateX && this.rotateY === -rotateY)) {
                this.rotateX = rotateX;
                this.rotateY = rotateY;
            }
            this.nextDirection = null;
        }

        var newRect;
        if(this.rotateX==1)
        {
            newRect={
                x:this.tail[this.tail.length-1].x+this.size,
                y:this.tail[this.tail.length-1].y
            };
        }
        else if(this.rotateX==-1)
        {
            newRect={
                x:this.tail[this.tail.length-1].x-this.size,
                y:this.tail[this.tail.length-1].y
            };
        }
        else if(this.rotateY==1)
        {
            newRect={
                x:this.tail[this.tail.length-1].x,
                y:this.tail[this.tail.length-1].y+this.size
            };
         }
        else if(this.rotateY==-1)
         {
            newRect={
                x:this.tail[this.tail.length-1].x,
                y:this.tail[this.tail.length-1].y-this.size
            };
         }

        this.tail.push(newRect);

        if (!this.growing) this.tail.shift();
        else this.growing = false;
    }

    setNextDirection(rotateX, rotateY) {
        this.nextDirection = { rotateX, rotateY };
    }

    grow() {
        this.growing = true;
    }

    checkCollision() {
        const head = this.tail[0];
        for (let i = 1; i < this.tail.length-1; i++) {
            if (head.x === this.tail[i].x && head.y === this.tail[i].y) {
                return true
            }
        }
        return false; 
    }
}

class Apple{
    constructor(){
        var isTouching;
        while(true){
            isTouching=false;
            this.x=Math.floor(Math.random()*canvas.width/snake.size)*snake.size;
            this.y=Math.floor(Math.random()*canvas.height/snake.size)*snake.size;
            for (var i=0; i<snake.tail.length;i++){
                if (this.x==snake.tail[i].x && this.y==snake.tail[i].y){
                    isTouching=true;
                }
            }
            this.color="red";
            this.size=snake.size;
            if(!isTouching){
                break;
            }
        }
    }
}

const SNAKE_SIZE = 40;
var canvas=document.getElementById("canvas");
var snake= new Snake(SNAKE_SIZE,SNAKE_SIZE,SNAKE_SIZE);

var apple= new Apple();

var canvasContext=canvas.getContext('2d');
var gameHasStart;
var tick;

const BASE_SIZE = 400;
let directionProcessedFrame = false;

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const maxPossibleSize = Math.min(containerWidth, containerHeight);
    const cellSize = snake.size;
    
    const gameSize = Math.floor(maxPossibleSize / cellSize) * cellSize;
    
    canvas.width = gameSize;
    canvas.height = gameSize;
    
    canvas.style.width = gameSize + 'px';
    canvas.style.height = gameSize + 'px';
    
    console.log(`Canvas size: ${canvas.width}x${canvas.height}, Display: ${gameSize}x${gameSize}`);
}

window.addEventListener('resize', resizeCanvas);
window.onload = () => {
    initGame();
};

function initGame() {
    resizeCanvas();
    apple = new Apple();
    snake = new Snake(SNAKE_SIZE,SNAKE_SIZE,SNAKE_SIZE);
    if (!gameHasStart) {
        gameLoop();
    }
}


function gameLoop(){
    tick=setInterval(show, 2000/15) //15 - fps
    gameHasStart=true;
}

function show(){
    update();
    draw();
}

function update(){
    canvasContext.clearRect(0,0,canvas.width, canvas.height)
    snake.move();
    eatApple();
    if (snake.checkCollision()) {
        console.log("Игра окончена!");
        // Логика окончания игры
    }
    checkHitWall();

}

function checkHitWall(){
    var headTail=snake.tail[snake.tail.length-1]
    if(headTail.x== -snake.size){
        headTail.x=canvas.width-snake.size;
    } else if(headTail.x== canvas.width){
        headTail.x=0;
    } else if(headTail.y==-snake.size){
        headTail.y=canvas.height-snake.size
    } else if(headTail.y==canvas.height){
        headTail.y=0;
    }
}

function eatApple(){
    if (snake.tail[snake.tail.length-1].x==apple.x && snake.tail[snake.tail.length-1].y==apple.y)
    {
        snake.grow();
        apple=new Apple();
    }
}

function draw(){
   createRect(0,0,canvas.width, canvas.height, "black");
    createRect(0,0, canvas.width, canvas.height);
   for(var i=0; i <snake.tail.length; i++){
    createRect(snake.tail[i].x+2.5, snake.tail[i].y+2.5, snake.size-5, snake.size-5, "white");
   }

   canvasContext.font = "20px Arial";
   canvasContext.fillStyle="#00FF42";
   var scoreCount=snake.tail.length-1;
   canvasContext.fillText("Score: "+ scoreCount, canvas.width-100, 20);
   createRect(apple.x, apple.y, apple.size, apple.size, apple.color);
}

function createRect(x,y, width, height, color){
    canvasContext.fillStyle=color;
    canvasContext.fillRect(x,y,width, height);
}

window.addEventListener("keydown", (event)=>{
    if ([" ", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "a", "w", "d", "s", "ф", "ц", "в", "ы"].includes(event.key)) {
        event.preventDefault();
    }
    
    if (event.key === " ") {
        if (gameHasStart){
            clearInterval(tick);
            gameHasStart = false;
        } else {
            gameLoop();
        }
    }
    else {
        if ((event.key== "ArrowLeft" || event.key.toLowerCase()== "a" || event.key.toLowerCase()== "ф") && snake.rotateX!=1){
            snake.setNextDirection(-1, 0);
        }
        else if ((event.key=="ArrowUp" || event.key.toLowerCase()== "w" || event.key.toLowerCase()== "ц") && snake.rotateY!=1){
            snake.setNextDirection(0, -1);
        }
        else if ((event.key=="ArrowRight" || event.key.toLowerCase()== "d" || event.key.toLowerCase()== "в") && snake.rotateX!=-1){
            snake.setNextDirection(1, 0);
        }
        else if ((event.key=="ArrowDown" || event.key.toLowerCase()== "s" || event.key.toLowerCase()== "ы") && snake.rotateY!=-1){
            snake.setNextDirection(0, 1);
        }
    }
});