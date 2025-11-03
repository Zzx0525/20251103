// Quiz + CSV export + interactive visuals using p5.js
let questionBank = [];
let selectedQuestions = [];
let currentQ = 0;
let userAnswers = [];
let score = 0;

let exportBtn, startBtn, nextBtn, restartBtn;
let questionDiv, feedbackDiv, progressDiv;
let optionButtons = [];

// particles for interactive feedback
let particles = [];
let spawnConfetti = false;

function sampleQuestionBank() {
  // P5.js related questions
  questionBank = [
    {id:1, q:'在 p5.js 中，哪個函式用於設定畫布大小？', opts:['size()','canvas()','createCanvas()','setCanvas()'], a:2},
    {id:2, q:'p5.js 中，哪個函式會在程式開始時執行一次？', opts:['start()','init()','setup()','begin()'], a:2},
    {id:3, q:'要持續執行動畫，應該把程式碼放在哪個函式中？', opts:['loop()','animate()','update()','draw()'], a:3},
    {id:4, q:'設定填充顏色的函式是？', opts:['setFill()','color()','paint()','fill()'], a:3},
    {id:5, q:'mouseX 和 mouseY 代表什麼？', opts:['滑鼠點擊位置','滑鼠相對移動量','目前滑鼠座標','上一次點擊位置'], a:2},
    {id:6, q:'要畫一個圓形，使用哪個函式？', opts:['circle()','drawCircle()','ellipse()','arc()'], a:2},
    {id:7, q:'background() 函式的作用是？', opts:['設定背景圖片','清除畫布並填色','設定邊框顏色','改變畫布大小'], a:1},
    {id:8, q:'在 p5.js 中載入圖片應使用哪個函式？', opts:['loadImage()','getImage()','importImage()','fetchImage()'], a:0}
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  sampleQuestionBank();

  // Create container div
  containerDiv = createDiv('');
  containerDiv.class('quiz-container');
  containerDiv.style('position', 'fixed');
  containerDiv.style('top', '40px');
  containerDiv.style('left', '50%');
  containerDiv.style('transform', 'translateX(-50%)');
  
  // 新增標題
  let titleDiv = createDiv('p5.js測驗系統');
  titleDiv.parent(containerDiv);
  titleDiv.style('font-size', '28px');
  titleDiv.style('font-weight', 'bold');
  titleDiv.style('text-align', 'center');
  titleDiv.style('margin-bottom', '16px');
  titleDiv.style('color', '#fff');
  
  // 新增測驗說明
  let descDiv = createDiv('這是一個關於 p5.js 的隨機測驗系統。每次測驗會從題庫中隨機抽取 4 題，答對一題可得 1 分。請仔細閱讀題目後選擇正確答案。');
  descDiv.parent(containerDiv);
  descDiv.style('text-align', 'center');
  descDiv.style('color', 'rgba(255,255,255,0.8)');
  descDiv.style('margin-bottom', '24px');
  descDiv.style('line-height', '1.5');
  containerDiv.style('width', '800px');
  containerDiv.style('max-width', '90%');

  // Create control button container
  controlsDiv = createDiv('');
  controlsDiv.parent(containerDiv);
  controlsDiv.style('display', 'flex');
  controlsDiv.style('gap', '16px');
  controlsDiv.style('justify-content', 'center');
  controlsDiv.style('margin-bottom', '24px');
  controlsDiv.style('flex-wrap', 'wrap');

  // Create UI elements in control container
  exportBtn = createButton('匯出題庫 CSV');
  exportBtn.parent(controlsDiv);
  exportBtn.mousePressed(downloadCSV);
  exportBtn.style('width', '160px');

  startBtn = createButton('開始測驗 (抽4題)');
  startBtn.parent(controlsDiv);
  startBtn.mousePressed(startQuiz);
  startBtn.style('width', '160px');
  startBtn.class('primary');

  nextBtn = createButton('下一題');
  nextBtn.parent(controlsDiv);
  nextBtn.mousePressed(nextQuestion);
  nextBtn.style('width', '160px');
  nextBtn.class('primary');
  nextBtn.hide();

  restartBtn = createButton('重新開始');
  restartBtn.parent(controlsDiv);
  restartBtn.mousePressed(resetQuiz);
  restartBtn.style('width', '160px');
  restartBtn.hide();

  // Create quiz content container with padding
  quizContent = createDiv('');
  quizContent.parent(containerDiv);
  quizContent.style('width', '100%');
  quizContent.style('padding', '20px');
  quizContent.style('background', 'rgba(255,255,255,0.05)');
  quizContent.style('border-radius', '12px');
  quizContent.style('backdrop-filter', 'blur(10px)');
  quizContent.style('margin-bottom', '20px');

  questionDiv = createDiv('請按「開始測驗」抽題並作答。');
  questionDiv.parent(quizContent);
  questionDiv.class('question');
  questionDiv.style('width', '100%');
  questionDiv.style('text-align', 'center');
  questionDiv.style('margin', '10px 0 20px 0');

  feedbackDiv = createDiv('');
  feedbackDiv.parent(quizContent);
  feedbackDiv.class('feedback');
  feedbackDiv.style('width', '100%');
  feedbackDiv.style('text-align', 'center');

  progressDiv = createDiv('');
  progressDiv.parent(quizContent);
  progressDiv.class('progress');
  progressDiv.style('text-align', 'center');

  // Create options container
  optionsDiv = createDiv('');
  optionsDiv.parent(quizContent);
  optionsDiv.style('width', '100%');
  optionsDiv.style('margin-top', '20px');
  optionsDiv.style('display', 'flex');
  optionsDiv.style('flex-direction', 'column');
  optionsDiv.style('gap', '10px');

  // option buttons placeholder (4)
  for (let i=0;i<4;i++){
    let b = createButton('選項 ' + (i+1));
    b.parent(optionsDiv);
    b.mousePressed(()=>handleOption(i));
    b.style('width', '100%');
    b.style('padding', '15px 20px');
    b.style('background', 'rgba(255,255,255,0.1)');
    b.style('color', '#fff');
    b.style('border', '1px solid rgba(255,255,255,0.2)');
    b.style('border-radius', '8px');
    b.style('font-size', '16px');
    b.style('cursor', 'pointer');
    b.style('text-align', 'left');
    b.style('margin', '0');
    b.style('display', 'block');  // 確保按鈕一直顯示
    b.style('transition', 'all 0.2s ease');
    optionButtons.push(b);
  }

}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  
  // 根據視窗大小調整容器大小和位置
  let containerWidth = min(800, windowWidth * 0.9);
  let topMargin = windowHeight * 0.05;  // 視窗高度的5%作為上方邊距
  
  containerDiv.style('width', containerWidth + 'px');
  containerDiv.style('top', topMargin + 'px');
  
  // 調整標題和說明文字大小
  let titleSize = map(windowWidth, 320, 1920, 20, 32);  // 根據視窗寬度調整標題大小
  titleDiv.style('font-size', titleSize + 'px');
  
  // 調整按鈕大小
  let buttonWidth = map(containerWidth, 300, 800, 120, 160);
  let buttons = [exportBtn, startBtn, nextBtn, restartBtn];
  buttons.forEach(btn => {
    if(btn) btn.style('width', buttonWidth + 'px');
  });
  
  // 調整選項按鈕大小和間距
  let optionPadding = map(windowWidth, 320, 1920, 10, 20);
  optionButtons.forEach(btn => {
    btn.style('padding', optionPadding + 'px');
    btn.style('font-size', map(windowWidth, 320, 1920, 14, 18) + 'px');
  });
  
  layoutUI();
}

function startQuiz(){
  // randomly pick 4 unique questions
  selectedQuestions = [];
  let pool = questionBank.slice();
  for (let i=0;i<4 && pool.length>0;i++){
    let idx = floor(random(pool.length));
    selectedQuestions.push(pool.splice(idx,1)[0]);
  }
  currentQ = 0;
  userAnswers = Array(selectedQuestions.length).fill(null);
  score = 0;
  spawnConfetti = false;
  
  // Hide restart button and show next button
  nextBtn.hide();  // 先隱藏下一題按鈕，等答題後才顯示
  restartBtn.hide();
  
  // Show first question
  let firstQ = selectedQuestions[0];
  questionDiv.html('第 1 題：' + firstQ.q);
  
  // Make sure options are visible with correct text
  for (let i=0; i<4; i++){
    optionButtons[i].html((i+1) + '. ' + firstQ.opts[i]);
    optionButtons[i].style('display', 'block');
    optionButtons[i].style('background', 'rgba(255,255,255,0.1)');
    optionButtons[i].style('color', '#fff');
    optionButtons[i].style('border', '1px solid rgba(255,255,255,0.2)');
    optionButtons[i].removeAttribute('disabled');
    optionButtons[i].style('cursor', 'pointer');
  }
  
  // Reset feedback and update progress
  feedbackDiv.html('');
  updateProgress();
}

function showQuestion(){
  // display current question and options
  let obj = selectedQuestions[currentQ];
  questionDiv.html('第 ' + (currentQ+1) + ' 題：' + obj.q);
  
  // reset feedback and progress
  feedbackDiv.html('');
  feedbackDiv.removeClass('correct wrong');
  updateProgress();
  
  // update options
  for (let i=0;i<4;i++){
    let opt = obj.opts[i] || '';
    optionButtons[i].html((i+1) + '. ' + opt);
    optionButtons[i].style('background', 'rgba(255,255,255,0.1)');
    optionButtons[i].style('color', '#fff');
    optionButtons[i].style('border', '1px solid rgba(255,255,255,0.2)');
    optionButtons[i].removeAttribute('disabled');
  }
}

function layoutUI(){
  // 更新控制按鈕間距
  let buttonSpacing = map(windowWidth, 320, 1920, 8, 16);
  controlsDiv.style('gap', buttonSpacing + 'px');
  controlsDiv.style('margin-bottom', buttonSpacing * 1.5 + 'px');
  
  // 調整問題和選項的文字大小
  let fontSize = map(windowWidth, 320, 1920, 14, 18);
  questionDiv.style('font-size', fontSize + 'px');
  feedbackDiv.style('font-size', fontSize + 'px');
  
  // 選項間距和樣式
  for (let i=0; i<optionButtons.length; i++){
    let margin = map(windowWidth, 320, 1920, 6, 10);
    optionButtons[i].style('margin', margin + 'px 0');
    optionButtons[i].style('display', 'block');
  }
  
  // 確保進度顯示的大小也隨視窗調整
  progressDiv.style('font-size', map(windowWidth, 320, 1920, 12, 16) + 'px');
  
  // 確保容器寬度適應視窗大小
  let maxWidth = min(800, windowWidth * 0.9);
  containerDiv.style('width', maxWidth + 'px');
  quizContent.style('padding', map(windowWidth, 320, 1920, 10, 20) + 'px');
}


function handleOption(i){
  // record answer and give immediate feedback
  let obj = selectedQuestions[currentQ];
  let correct = (i === obj.a);
  userAnswers[currentQ] = i;
  
  // disable options and update styles
  for (let k=0;k<optionButtons.length;k++){
    optionButtons[k].attribute('disabled','');
    optionButtons[k].style('cursor', 'default');
    
    if (k === obj.a) {
      // 正確答案顯示綠色
      optionButtons[k].style('background', 'rgba(40, 167, 69, 0.3)');
    } else if (k === i && !correct) {
      // 錯誤選擇顯示紅色
      optionButtons[k].style('background', 'rgba(220, 53, 69, 0.3)');
    }
  }
  
  // Show feedback
  if (correct){
    score++;
    feedbackDiv.html('答對！');
    feedbackDiv.class('feedback correct');
    spawnManyParticles(mouseX, mouseY, color(255, 200, 0));
  } else {
    feedbackDiv.html('答錯，正確答案是：' + obj.opts[obj.a]);
    feedbackDiv.class('feedback wrong');
    spawnManyParticles(mouseX, mouseY, color(200, 50, 50));
  }
  
  // Update progress display
  updateProgress();
  
  // Show next button
  if (currentQ < selectedQuestions.length - 1) {
    nextBtn.show();
    nextBtn.style('display', 'block');
    nextBtn.removeAttribute('disabled');
  } else {
    // If this is the last question, show finish message
    setTimeout(finishQuiz, 1500);
  }
}

function nextQuestion(){
  // move to next or finish
  if (userAnswers[currentQ] === null){
    feedbackDiv.html('請先選一個選項再前往下一題。');
    return;
  }
  
  currentQ++;
  if (currentQ >= selectedQuestions.length){
    // finish
    finishQuiz();
    return;
  }
  
  // Show next question
  let obj = selectedQuestions[currentQ];
  questionDiv.html('第 ' + (currentQ + 1) + ' 題：' + obj.q);
  
  // Reset and show options
  for (let i=0; i<4; i++){
    optionButtons[i].html((i+1) + '. ' + obj.opts[i]);
    optionButtons[i].style('background', 'rgba(255,255,255,0.1)');
    optionButtons[i].style('color', '#fff');
    optionButtons[i].style('border', '1px solid rgba(255,255,255,0.2)');
    optionButtons[i].removeAttribute('disabled');
    optionButtons[i].style('cursor', 'pointer');
  }
  
  // Clear feedback and update progress
  feedbackDiv.html('');
  feedbackDiv.removeClass('correct wrong');
  updateProgress();
  
  // Hide next button until next answer is selected
  nextBtn.style('display', 'none');
}

function finishQuiz(){
  // hide option buttons
  for (let b of optionButtons) b.hide();
  questionDiv.html('測驗結束，您的分數：' + score + ' / ' + selectedQuestions.length);
  // feedback message
  let msg = '';
  if (score === selectedQuestions.length) {
    msg = '太棒了！全部答對！';
    spawnManyParticles(random(width), random(height/2), color(0,200,100));
  } else if (score >= 3) {
    msg = '表現良好，接近滿分！';
  } else if (score >= 2) {
    msg = '還不錯，繼續加油！';
  } else {
    msg = '可以再練習，多看題目說明。';
  }
  feedbackDiv.html(msg);
  nextBtn.hide();
  restartBtn.show();
}

function resetQuiz(){
  // show initial state
  questionDiv.html('請按「開始測驗」抽題並作答。');
  feedbackDiv.html('');
  // Reset options to initial state
  for (let i=0; i<optionButtons.length; i++){
    optionButtons[i].html('選項 ' + (i+1));
    optionButtons[i].style('background', 'rgba(255,255,255,0.1)');
    optionButtons[i].style('color', '#fff');
    optionButtons[i].style('border', '1px solid rgba(255,255,255,0.2)');
    optionButtons[i].removeAttribute('disabled');
  }
  nextBtn.hide();
  restartBtn.hide();
}

function updateProgress(){
  progressDiv.html('進度：' + (currentQ+1) + ' / ' + selectedQuestions.length);
}

function downloadCSV(){
  // Create simple CSV with header: id,question,opt1,opt2,opt3,opt4,answerIndex
  let lines = [];
  lines.push(['id','question','opt1','opt2','opt3','opt4','answerIndex'].join(','));
  for (let it of questionBank){
    // escape double quotes and wrap fields in quotes
    let row = [it.id, it.q, it.opts[0], it.opts[1], it.opts[2] || '', it.opts[3] || '', it.a];
    let esc = row.map(f => '"' + ('' + f).replace(/"/g,'""') + '"');
    lines.push(esc.join(','));
  }
  let csv = lines.join('\n');
  let blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  let url = URL.createObjectURL(blob);
  let a = createA(url, 'download');
  a.attribute('download', 'question_bank.csv');
  a.hide();
  a.elt.click();
  URL.revokeObjectURL(url);
}

// ----------------- Particle system -----------------
class Particle{
  constructor(x,y,c){
    this.pos = createVector(x,y);
    this.vel = p5.Vector.random2D().mult(random(1,6));
    this.acc = createVector(0,0.1);
    this.lifespan = 255;
    this.col = c;
    this.size = random(4,12);
  }
  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }
  draw(){
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
  isDead(){
    return this.lifespan <= 0;
  }
}

function spawnManyParticles(x,y,c){
  for (let i=0;i<30;i++){
    particles.push(new Particle(x + random(-20,20), y + random(-20,20), c));
  }
}

function draw() {
  // dynamic background with gradient
  let gradientTop = color(30, 35, 48);
  let gradientBottom = color(20, 25, 35);
  
  for(let y = 0; y < height; y++){
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(gradientTop, gradientBottom, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // decorative background circles
  noStroke();
  fill(60, 65, 90, 20);
  ellipse(width*0.8 + sin(frameCount*0.01)*60, height*0.4 + cos(frameCount*0.01)*40, 400);
  fill(50, 80, 120, 15);
  ellipse(width*0.2 + cos(frameCount*0.008)*80, height*0.6 + sin(frameCount*0.008)*60, 600);

  // draw particles
  for (let i = particles.length-1; i>=0; i--){
    let p = particles[i];
    p.update();
    p.draw();
    if (p.isDead()) particles.splice(i,1);
  }

  // progress bar in top-right
  if (selectedQuestions.length>0){
    let pw = 200;
    let ph = 12;
    let sx = width - pw - 20;
    let sy = 20;
    stroke(255,120);
    noFill();
    rect(sx, sy, pw, ph, 4);
    noStroke();
    let pct = (currentQ) / max(1, selectedQuestions.length);
    fill(120, 200, 255);
    rect(sx, sy, pw*pct, ph, 4);
  }
}

