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
        const head = this.tail[this.tail.length - 1];
        for (let i = 0; i < this.tail.length - 1; i++) {
            if (head.x === this.tail[i].x && head.y === this.tail[i].y) {
                return true;
            }
        }
        return false; 
    }

    isFieldFull() {
        const maxCells = (canvas.width / this.size) * (canvas.height / this.size);
        console.log(maxCells+" "+this.tail.length);
        return this.tail.length >= maxCells;
    }
}

class Apple{
    constructor(){
        var isTouching;
        let attempts = 0;
        const maxCells = (canvas.width / snake.size) * (canvas.height / snake.size);
        
        if (snake.tail.length >= maxCells - 1) {
            this.x = -100; 
            this.y = -100;
            this.color = "black";
            this.size = 1;
            return;
        }
        
        while(true){
            isTouching = false;
            this.x = Math.floor(Math.random() * canvas.width / snake.size) * snake.size;
            this.y = Math.floor(Math.random() * canvas.height / snake.size) * snake.size;
            
            for (var i = 0; i < snake.tail.length; i++){
                if (this.x == snake.tail[i].x && this.y == snake.tail[i].y){
                    isTouching = true;
                    break;
                }
            }
            
            this.color = "red";
            this.size = snake.size;
            
            if(!isTouching){
                break;
            }
            
            attempts++;
            if (attempts > 1000) {
                this.x = -100;
                this.y = -100;
                break;
            }
        }
    }
}

class HighScoreManager {
    constructor() {
        this.scores = this.loadScores();
    }

    loadScores() {
        const saved = localStorage.getItem('snakeHighScores');
        return saved ? JSON.parse(saved) : [];
    }

    saveScores() {
        localStorage.setItem('snakeHighScores', JSON.stringify(this.scores));
    }

    addScore(name, score) {
        this.scores.push({ name, score, date: new Date().toLocaleDateString() });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10);
        this.saveScores();
    }

    getScores() {
        return this.scores;
    }
}

const highScoreManager = new HighScoreManager();

const SNAKE_SIZE = 80;
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
    tick=setInterval(show, 1000/10)
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

    if (snake.checkCollision() || snake.isFieldFull()) {
        endGame();
        return;
    }

    checkHitWall();
}

function endGame() {
    clearInterval(tick);
    gameHasStart = false;
    
    const score = snake.tail.length - 1;
    showGameOverScreen(score);
}

function showGameOverScreen(score) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
        font-family: Arial, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #333;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 500px;
        width: 80%;
    `;

    content.innerHTML = `
        <h2>Игра Окончена!</h2>
        <p>Ваш счет: ${score}</p>
        ${snake.isFieldFull() ? '<p>🎉 Поздравляем! Вы заполнили всё поле! 🎉</p>' : '<p>Змейка столкнулась с собой</p>'}
        <div>
            <input type="text" id="playerName" placeholder="Введите ваше имя" style="padding: 10px; margin: 10px; width: 200px; font-size: 16px;">
            <button onclick="saveScore()" style="padding: 10px 20px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Сохранить результат</button>
        </div>
        <button onclick="showHighScores()" style="padding: 10px 20px; margin: 5px; font-size: 16px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">Таблица рекордов</button>
        <button onclick="restartGame()" style="padding: 10px 20px; margin: 5px; font-size: 16px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer;">Новая игра</button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

window.saveScore = function() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim() || 'Игрок';
    const score = snake.tail.length - 1;
    
    highScoreManager.addScore(name, score);
    
    document.body.removeChild(document.querySelector('div[style*="position: fixed"]'));
    showHighScores();
}

window.showHighScores = function() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
        font-family: Arial, sans-serif;
    `;

    const scores = highScoreManager.getScores();
    let scoresHTML = '<h2>Таблица рекордов</h2>';
    
    if (scores.length === 0) {
        scoresHTML += '<p>Пока нет рекордов</p>';
    } else {
        scoresHTML += '<ol style="text-align: left; max-height: 300px; overflow-y: auto;">';
        scores.forEach((record, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            scoresHTML += `<li>${medal} ${record.name} - ${record.score} очков (${record.date})</li>`;
        });
        scoresHTML += '</ol>';
    }

    const content = document.createElement('div');
    content.style.cssText = `
        background: #333;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 500px;
        width: 80%;
        max-height: 80vh;
        overflow-y: auto;
    `;

    content.innerHTML = scoresHTML + `
        <button onclick="restartGame()" style="padding: 10px 20px; margin: 10px; font-size: 16px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer;">Новая игра</button>`;

    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

window.closeOverlay = function() {
    const overlay = document.querySelector('div[style*="position: fixed"]');
    if (overlay) {
        document.body.removeChild(overlay);
    }
    const overlay2 = document.querySelector('div[style*="position: fixed"]');
    if (overlay2) {
        document.body.removeChild(overlay2);
    }
}

window.restartGame = function() {
    closeOverlay();
    initGame();
}

function checkHitWall(){
    const head = snake.tail[snake.tail.length-1];
    if(head.x < 0){
        head.x = canvas.width - snake.size;
    } else if(head.x >= canvas.width){
        head.x = 0;
    } else if(head.y < 0){
        head.y = canvas.height - snake.size;
    } else if(head.y >= canvas.height){
        head.y = 0;
    }
}

function eatApple(){
    const head = snake.tail[snake.tail.length-1];
    
    let headX = head.x;
    let headY = head.y;

    const possibleHeadPositions = [
        {x: headX, y: headY},
        {x: headX - canvas.width, y: headY},
        {x: headX + canvas.width, y: headY}, 
        {x: headX, y: headY - canvas.height}, 
        {x: headX, y: headY + canvas.height}  
    ];
    
    for (let pos of possibleHeadPositions) {
        if (pos.x === apple.x && pos.y === apple.y) {
            snake.grow();
            apple = new Apple();
            break;
        }
    }
}

function draw(){
   createRect(0,0,canvas.width, canvas.height, "black");
   createRect(0,0, canvas.width, canvas.height);
   
   for(var i=0; i < snake.tail.length; i++){
       let color = "white";
       let sizeOffset = 2.5;
       
       if (i === snake.tail.length - 1) {
           color = "#00FF00"; 
           sizeOffset = 1;
       }
       else if (i === 0) {
           color = "#9c9c9cff";
       }
       
       createRect(snake.tail[i].x + sizeOffset, snake.tail[i].y + sizeOffset, 
                 snake.size - (sizeOffset * 2), snake.size - (sizeOffset * 2), color);
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
    if ([" ", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
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