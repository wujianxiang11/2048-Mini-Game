var nums = new Array();
var score = 0;
var hasConflicted=new Array();  //已经已叠加，用来解决单元格重复叠加的问题

$(document).ready(function(){
	newgame();
});

//开始新游戏
function newgame(){
	init();

	//在随机的两个单元格中生成数字
	generateOneNumber();
	generateOneNumber();
}

//初始化页面
function init(){
	//初始化单元格位置(下层单元格)
	for(var i=0;i<4;i++){
		for(var j=0;j<4;j++){
			var gridCell=$('#grid-cell-'+i+'-'+j);	
			gridCell.css('top',getPosTop(i,j));
			gridCell.css('left',getPosLeft(i,j));
		}
	}

	//初始化数组
	for(var i=0;i<4;i++){
		nums[i]=new Array();
		hasConflicted[i]=new Array();
		for(var j=0;j<4;j++){
			nums[i][j]=0;
			hasConflicted[i][j]=false; //false表示未曾叠加过，true表示已经叠加过
		}
	}

	//动态创建上层单元格并初始化
	updateView();

	score=0;
	updateScore(score);
}

//更新上层单元格视图
function updateView(){
	//将上层所有单元格清空，然后重新初始化创建
	$('.number-cell').remove();

	for(var i=0;i<4;i++){
		for(var j=0;j<4;j++){
			$('#grid-container').append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>');

			var numberCell=$('#number-cell-'+i+'-'+j);

			if(nums[i][j]==0){
				numberCell.css('width','0px');
				numberCell.css('height','0px');
				numberCell.css('top',getPosTop(i,j)+50);
				numberCell.css('left',getPosLeft(i,j)+50);
			}else{
				numberCell.css('width','100px');
				numberCell.css('height','100px');
				numberCell.css('top',getPosTop(i,j));
				numberCell.css('left',getPosLeft(i,j));
				numberCell.css('background-color',getNumberBackgroundColor(nums[i][j]));
				numberCell.css('color',getNumberColor(nums[i][j]));
				numberCell.text(nums[i][j]);
			}
			hasConflicted[i][j]=false;	
		}
	}

}

/*
	在随机的单元格中生成一个随机数：
	1.在空余的单元格中随机找一个
	2.随机产生一个2或4
*/
function generateOneNumber(){
	//判断是否还有空间，如果没有空间则直接返回
	if(noSpace(nums)){
		return;
	}

	//随机一个位置
	var count=0;
	var temp=new Array();
	for(var i=0;i<4;i++){
		for(var j=0;j<4;j++){
			if(nums[i][j]==0){
				temp[count] = i*4+j;  // 1*4+3=7  ------>  7/4=1   7%4=3 
				count++;
			}
		}
	}
	var pos=Math.floor(Math.random()*count);  //[0,1) * 6 = [0,5]
	var randx=Math.floor(temp[pos]/4);
	var randy=Math.floor(temp[pos]%4);

	//随机一个数字
	var randNum=Math.random()<0.5?2:4;

	//在随机位置上显示随机数字
	nums[randx][randy]=randNum;
	showNumberWithAnimation(randx,randy,randNum);
}

//实现键盘响应
$(document).keydown(function(event){
	// console.log(event);
	switch(event.keyCode){
		case 37: //left
			//判断是否可以向左移动
			if(canMoveLeft(nums)){
				moveLeft();
				setTimeout(generateOneNumber,200);
			}
			break;
		case 38: //up
			if(canMoveUp(nums)){
				moveUp();
				setTimeout(generateOneNumber,200);
			}
			break;
		case 39: //right
			if(canMoveRight(nums)){
				moveRight();
				setTimeout(generateOneNumber,200);
			}
			break;
		case 40: //down
			if(canMoveDown(nums)){
				moveDown();
				setTimeout(generateOneNumber,200);
			}
			break;	
		default:
			break;			
	}
});

/*
	向左移动
	需要对每一个数字的左边进行判断，选择落脚点，落脚点有两种情况：
		1.落脚点没有数字，并且移动路径中没有障碍物
		2.落脚点数字和自己相同，并且移动路径中没有障碍物
*/
function moveLeft(){
	for(var i=0;i<4;i++){
		for(var j=1;j<4;j++){
			if(nums[i][j]!=0){
				for(var k=0;k<j;k++){
					if(nums[i][k]==0  && noBlockHorizontal(i,k,j,nums)){ //第i行的第k-j列之间是否有障碍物
						//移动操作
						showMoveAnimation(i,j,i,k);
						nums[i][k]=nums[i][j];
						nums[i][j]=0;
						break;
					}else if(nums[i][k]==nums[i][j] && noBlockHorizontal(i,k,j,nums) && !hasConflicted[i][k]){
						showMoveAnimation(i,j,i,k);
						nums[i][k]+=nums[i][j];
						nums[i][j]=0;
						//统计分数
						score+=nums[i][k];
						updateScore(score);

						hasConflicted[i][k]=true; //已经叠加
						break;
					}
				}
			}
		}
	}
	//更新页面上的数字单元格，此处才是真正的更新显示移动后的效果
	setTimeout(updateView,200); //等待200ms，为了让单元格移动效果能够显示完
}

function moveRight(){
	for(var i=0;i<4;i++){
		for(var j=2;j>=0;j--){
			if(nums[i][j]!=0){
				for(var k=3;k>j;k--){
					if(nums[i][k]==0 && noBlockHorizontal(i,j,k,nums)){   //第i行的第j-k列之间是否有障碍物
						showMoveAnimation(i,j,i,k);
						nums[i][k]=nums[i][j];
						nums[i][j]=0;
						break;
					}else if(nums[i][k]==nums[i][j] && noBlockHorizontal(i,j,k,nums) && !hasConflicted[i][k]){
						showMoveAnimation(i,j,i,k);
						nums[i][k]+=nums[i][j];
						nums[i][j]=0;
						score+=nums[i][k];
						updateScore(score);

						hasConflicted[i][k]=true;
						break;
					}
				}
			}	
		}
	}
	setTimeout(updateView,200); 
}

function moveUp(){
	for(var j=0;j<4;j++){
		for(var i=1;i<4;i++){
			if(nums[i][j]!=0){
				for(var k=0;k<i;k++){
					if(nums[k][j]==0 && noBlockVertical(j,k,i,nums)){ //第j列的第k-i行之间是否有障碍物
						showMoveAnimation(i,j,k,j);
						nums[k][j]=nums[i][j];
						nums[i][j]=0;
						break;
					}else if(nums[k][j]==nums[i][j] && noBlockVertical(j,k,i,nums) && !hasConflicted[k][j]){
						showMoveAnimation(i,j,k,j);	
						nums[k][j]+=nums[i][j];
						nums[i][j]=0;
						score+=nums[k][j];
						updateScore(score);

						hasConflicted[k][j]=true;
						break;
					}
				}
			}
		}
	}
	setTimeout(updateView,200);
}

function moveDown(){
	for(var j=0;j<4;j++){
		for(var i=2;i>=0;i--){
			if(nums[i][j]!=0){
				for(var k=3;k>i;k--){
					if(nums[k][j]==0 && noBlockVertical(j,i,k,nums)){ //第j列的第i-k行之间是否有障碍物
						showMoveAnimation(i,j,k,j);
						nums[k][j]=nums[i][j];
						nums[i][j]=0;
						break;
					}else if(nums[k][j]==nums[i][j]  && noBlockVertical(j,i,k,nums) && !hasConflicted[k][j]){
						showMoveAnimation(i,j,k,j);
						nums[k][j]+=nums[i][j];
						nums[i][j]=0;
						score+=nums[k][j];
						updateScore(score);

						hasConflicted[k][j]=true;
						break;
					}
				}	
			}
		}
	}
	setTimeout(updateView,200);
}