const canvas = document.querySelector("canvas")//получение canvas элемента
const c = canvas.getContext('2d'), background = new Image(), floor = new Image(),playerRight = new Image(), playerLeft = new Image(), hp = new Image(), sword = new Image()
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
c.fillStyle = 'white'
//загрузка основных изображений
background.src="background.png"
floor.src="floor.png"
playerRight.src="2right.png"
playerLeft.src="2left.png"
hp.src="health.png"
sword.src="src/sword.png"

var paused = true, skins = ["31"], //["1","22","31","32"] - все скины
playerSpeed = 3, jumpSpeed = 3, playerDir=1, isMove=false, xAnim=0,yAnim=0,isAttack=false,isBlock=false,isJump=false,
isFall=false, jumpHeight=0, isTakenDamage=false,damageDir=0,playerDamage = 2, playerDied=false, playerScore=0,playerHealth=100, playerDiedAnim=false,
themeAudio = new Audio("src/battle theme.mp3"), audioPlayed=false, maxHealth=100;//инициализация основных переменных

const defalutE={
    health: 5,
    damage: 1
}, sprites={
    right: playerRight,
    left: playerLeft
}, playerSize=64*5, playerPosition={
    x: canvas.width/2-playerSize/2,
    y: canvas.height/2
},anim={
    step: 5,
    timer:0
},frameWalk={
    val: 0,
    max: 7
},frameIdle={
    val: 0,
    max: 4
},frameAttack={
    val: 0,
    max: 2,
},frameJump={
    val: 0,
    max: 2
},frameFall={
    val: 0
},frameDamage={
    val: 0,
    max: 5
},frameDie={
    val: 0,
    max: 3
},swordSize=32 //инициализация основных констант

class Enemy{ //класс противника
    constructor(pos, speed){
        this.realSize=100
        this.name="enemy"
        this.imageRight = new Image()
        this.skin = skins[Math.floor(Math.random()*skins.length)]
        this.imageRight.src = this.skin+"right.png"
        this.imageLeft = new Image()
        this.imageLeft.src = this.skin+"left.png"
        this.sprites={
            left: this.imageLeft,
            right: this.imageRight
        }
        this.dir=-1
        this.position = pos
        this.size = playerSize
        this.speed=speed
        this.xAnim = 0
        this.yAnim = 0
        this.damage=defalutE.damage
        this.isRun=false
        this.frameWalk = {
            val: 0,
            max: 7
        }
        this.anim={
            step:5,
            timer: 0
        }
        this.frameAttack={
            val: 0,
            max: 2,
        }
        this.isAttack=false
        this.cooldownAtack={
            val: 30,
            max: 40
        }
        this.frameIdle={
            val: 0,
            max: 4
        }
        this.frameDamage={
            val: 0,
            max: 5
        }
        this.isTakenDamage=false
        this.damageDir=0
        this.health=defalutE.health
        this.died=false
        this.frameDie={
            val:0,
            max: 2
        }
        this.isShield=false
        this.frameShield={
            val:0,
            max: 5
        }
        this.chanceDodge=0.4
        if(this.skin=="1"){
            this.chanceDodge=0.5
            this.health*=2
            this.damage*=2
            this.speed++
        }
    }
    move(){
        if(!this.died){
        if(this.position.x> playerPosition.x+ playerSize/3 && !this.isAttack && !this.isTakenDamage &&
        !this.isShield){
            this.position.x-=this.speed
            this.dir=-1
            this.isRun=true
            this.isAttack=false
        }
        else if(this.position.x + playerSize/3 < playerPosition.x && !this.isAttack && !this.isTakenDamage &&
        !this.isShield){
            this.position.x+=this.speed
            this.dir=1
            this.isRun=true
            this.isAttack=false
        }
        else if(!this.isTakenDamage && !this.isShield){
            //this.isRun=false
            if(this.cooldownAtack.val==0){
                this.isAttack=true
                this.cooldownAtack.val=this.cooldownAtack.max
            }
            else this.cooldownAtack.val--
        }
    }
    }
    draw(){
        if(!playerDied && !paused){
        this.near = !(this.position.x> playerPosition.x+ playerSize/2-5 || this.position.x + playerSize/2 -5 < playerPosition.x
    )
     this.isRun=false
        if(!this.died){
            if(this.health>0){
        this.move()
        if(this.isRun){
            if(this.frameWalk.val>this.frameWalk.max) this.frameWalk.val=0
            else if(this.anim.timer%this.anim.step==0) this.frameWalk.val++
            this.xAnim=(5+this.frameWalk.val)%7
            this.yAnim=Math.floor((5+this.frameWalk.val)/7)
            this.anim.timer++
        }
        if(this.isAttack){
            if(this.frameAttack.val>this.frameAttack.max){ this.frameAttack.val=0
                this.isAttack=false
            }
            else if(this.anim.timer%this.anim.step==0)this.frameAttack.val++
            this.xAnim=(5+this.frameAttack.val)%7
            this.yAnim=Math.floor((5+this.frameAttack.val)/7)+2
            this.anim.timer++
            //console.log('atack')
        }
        if(!this.isAttack && !this.isRun){
            if(this.frameIdle.val>this.frameIdle.max) this.frameIdle.val=0
            else if(this.anim.timer%this.anim.step==0)this.frameIdle.val++
            this.xAnim=this.frameIdle.val
            this.yAnim=0
            this.anim.timer++
            //console.log('idle1')
        }
        if(this.isTakenDamage){
            if(this.frameDamage.val>this.frameDamage.max){ this.frameDamage.val=0, this.isTakenDamage=false}
            else if(this.anim.timer%this.anim.step==0)this.frameDamage.val++
            this.xAnim=1
            this.yAnim=3
            this.anim.timer++
            this.position.x+=this.damageDir*2
            //console.log('takedmg')
        }
    
        if(this.isShield){
            if(this.frameShield.val>this.frameShield.max) this.isShield=false
            else if(this.anim.timer%this.anim.step==0) this.frameShield.val++
            this.xAnim=6
            this.yAnim=3
            this.anim.timer++
        }
    }
        if(this.health<=0){
            if(this.frameDie.val>this.frameDie.max) this.died=true
            else if(this.anim.timer%this.anim.step==0) this.frameDie.val++
            this.xAnim=1+this.frameDie.val
            this.yAnim=3
            this.anim.timer++
        }
    }
        if(this.died){
            this.xAnim=4
            this.yAnim=3
        }
    }
    else{
        if(this.frameIdle.val>this.frameIdle.max) this.frameIdle.val=0
            else if(this.anim.timer%this.anim.step==0)this.frameIdle.val++
            this.xAnim=this.frameIdle.val
            this.yAnim=0
            this.anim.timer++
    }
        if(this.dir==-1){
            c.drawImage(this.sprites.left, (6-this.xAnim)*this.size,this.yAnim*this.size,this.size,this.size,this.position.x,this.position.y,this.size,this.size)
        }
        if(this.dir==1){
            c.drawImage(this.sprites.right, this.xAnim*this.size,this.yAnim*this.size,this.size,this.size,this.position.x,this.position.y,this.size,this.size)
        }
    }
}

class Boss extends Enemy{ //класс босса - сильного противника
    set(newSkin, newSpeed, cooldownmMax, damage, chanceDodge, health, cooldownBlock,timeGetDamage, name,extraAtackSkin="1"){
        this.name=name
        this.speed=newSpeed
        this.skin=newSkin
        this.imageLeft.src = this.skin+"left.png"
        this.imageRight.src = this.skin+"right.png"
        this.cooldownAtack={
            val: 30,
            max: cooldownmMax
        }
        this.damage=damage
        this.chanceDodge=chanceDodge
        this.health=health
        this.maxHealth = this.health
        this.frameShield={
            val:0,
            max: cooldownBlock
        }
        this.frameDamage={
            val: 0,
            max: timeGetDamage
        }
        this.kfDraw = this.size/3/this.maxHealth
        this.useJumpAtack = false
        this.useJumpAtackLeft = new Image()
        this.useJumpAtackRight = new Image()
        this.useJumpAtackLeft.src=extraAtackSkin+"left.png"
        this.useJumpAtackRight.src=extraAtackSkin+"right.png"
        this.jumpAtack={
            left: this.useJumpAtackLeft,
            right: this.useJumpAtackRight
        }
        this.isExtraAtack=false
        this.defaultsSprites = this.sprites
        this.defaultSpeed = this.speed
        this.defaultDamage = this.damage
        this.extraDamage = this.damage*5
        this.cooldownExtraAtack={
            val: 0,
            max: 50
        }
    }
    draw(){
        if(this.health < this.maxHealth/2 && (Math.random()<0.2) && !this.isExtraAtack && this.cooldownExtraAtack.val==0){ 
            this.isExtraAtack=true}
        if(this.cooldownExtraAtack.val>0) this.cooldownExtraAtack.val--
        if(this.isExtraAtack){
            this.damage=this.extraDamage
            this.sprites=this.jumpAtack
            this.speed=this.defaultSpeed+2
            if(this.near && this.frameAttack.val==this.frameAttack.max) {
                this.isExtraAtack=false
                
            this.cooldownExtraAtack.val=this.cooldownExtraAtack.max}
        }
        else{
            this.damage = this.defaultDamage
            this.sprites = this.defaultsSprites
            this.speed=this.defaultSpeed
        }
        super.draw()
        c.drawImage(hp,0,0,1, 1, this.position.x+this.size/3, this.position.y+this.size/6,this.maxHealth*this.kfDraw,15)
        c.drawImage(hp,0,0,hp.width, hp.height, this.position.x+this.size/3, this.position.y+this.size/6,this.health*this.kfDraw,15)
    }
    
}
class Minotaur{
    constructor(pos, speed)
    {
        this.realSize=130
        this.name="minotaur"
        this.image = new Image()
        this.image.src="src/minotaur.png"
        this.dir=-1
        this.position = pos
        this.size = 384
        this.position.y-=this.size*2/3
        this.speed=speed
        this.damage={3:10*defalutE.damage,4:5*defalutE.damage,6:15*defalutE.damage}
        this.takeDamage = {
            v: 0,
            max: 20
        }
        this.keyframes=[{
            is: true,
            vx: 0,
            max: 3,
            anim:{
                step:5,
                timer: 0
            }
        },{
            is: false,
            vx: 0,
            max: 6,
            anim:{
                step:4,
                timer: 0
            }
        },{
            is: false,
            vx: 0,
            max: 3,
            anim:{
                step:5,
                timer: 0
            }
        },{
            is: false,
            vx: 0,
            max: 7,
            anim:{
                step: 5,
                timer: 0
            }
        },
        {
            is: false,
            vx: 0,
            max: 3,
            anim:{
                step: 6,
                timer: 0
            }
        },
        {
            is: false,
            vx: 0,
            max: 4,
            anim:{
                step: 6,
                timer: 0
            }
        },
        {
            is: false,
            vx: 0,
            max: 7,
            anim:{
                step: 6,
                timer: 0
            }
        },
        {
            is: false,
            vx: 0,
            max: 1,
            anim:{
                step: 10,
                timer: 0
            }
        },
        {
            is: false,
            vx: 0,
            max: 1,
            anim:{
                step: 10,
                timer: 0
            }
        },
        {
            is: false,
            vx: 0,
            max: 5,
            anim:{
                step: 10,
                timer: 0
            }
        }]
        this.frames={
            idle:{value:0},
            run:{value:1},
            taunt:{value:2},
            atack:{value:[3,4,6]},
            atackWtf:{value:5},
            damage:{value:[7,8]},
            die:{value:9}
        }
        this.cooldownAtack={
            val: 30,
            max: 200,
        }
        this.damageDir=0
        this.health=defalutE.health*15
        this.died=false
        this.chanceDodge=0.4
        this.cooldownStay={
            v: 10,
            max: 100
        }
    }
    update(){
        this.keyframes[0].is=true
        if(this.takeDamage.v==0){
        if(this.cooldownAtack.val>0)
            this.cooldownAtack.val--
            if(this.takeDamage.v==0){
                if(this.position.x + this.size/2 < playerPosition.x) { if(this.cooldownStay.v==0){this.dir=1; this.keyframes[this.frames.run.value].is=true; this.position.x+=this.speed}}
                else if (this.position.x+this.size/12> playerPosition.x + playerSize/2) {if(this.cooldownStay.v==0){this.dir=-1; this.keyframes[this.frames.run.value].is=true; this.position.x-=this.speed}}
                else if (this.cooldownAtack.val==0){
                    this.attackIndex = this.frames.atack.value[Math.floor(Math.random()*this.frames.atack.value.length)]
                    this.keyframes[this.attackIndex].is=true
                    this.cooldownAtack.val=this.cooldownAtack.max
                    this.cooldownStay.v=this.cooldownStay.max
                }
                else {
                    this.keyframes[this.frames.run.value].is=false
                }
                if(this.cooldownStay.v>0) this.cooldownStay.v--
            }
        }
        if(this.takeDamage.v>0){
            this.takeDamage.v--
            this.position.x+=this.speed*this.damageDir
            if(this.takeDamage.v==0){
                this.frames.damage.value.forEach(v=>{
                    this.keyframes[v].is=false
                })
            }
        }
    }
    draw(){
        if(this.health>0 && !paused)
            this.update()
        else if(this.health<=0){
            this.keyframes.forEach(e=>{e.is=false})
            this.keyframes[this.frames.die.value].is=true
    }
        for(let i = this.keyframes.length-1; i >= 0; i--){
            if(this.keyframes[i].is){
                if(this.keyframes[i].vx>this.keyframes[i].max) {this.keyframes[i].vx=0; this.keyframes[i].is=false; if(this.health<0) this.died=true;}
                else if(this.keyframes[i].anim.timer%this.keyframes[i].anim.step==0) this.keyframes[i].vx++
                this.xAnim=this.keyframes[i].vx
                this.yAnim=i
                this.keyframes[i].anim.timer++
                break
            }
        }
        if(this.dir===-1) this.yAnim+=this.keyframes.length
        c.drawImage(this.image,this.xAnim*this.size, this.yAnim*this.size,  this.size, this.size,this.position.x,this.position.y,this.size,this.size)
        }
}
const minotaur = new Minotaur({x:0,y:511},1)
const boss = new Boss({x:-playerSize,y:511-playerSize*3/4},1), bossNoWeapon = new Boss({x:canvas.width,y:511-playerSize*3/4},1),boss2 = new Boss({x:canvas.width,y:511-playerSize*3/4},1),
bossNoWeapon2 = new Boss({x:canvas.width,y:511-playerSize*3/4},1)
boss.set("axe",4, 60,5,.7,100,10,3,'easy')
boss2.set("axe",4, 60,5,.7,100,10,3,'easy2')
bossNoWeapon.set("src/no weapon1",5,20,2,.8,200,10,10,'normal',"22")
bossNoWeapon.useJumpAtack=true
bossNoWeapon2.set("src/no weapon1",5,20,4,.8,200,10,10,'normal2',"22")
bossNoWeapon2.useJumpAtack=true
const actions={'easy':()=>{
    paused=true
    drawWindowParameters.fullString="Уровень повышен! Скорость увеличена до 4, атака - до 3, здоровье восстановлено."
    drawWindowParameters.val=0
    drawWindowParameters.index=0
    drawWindowParameters.drawn=""
    playerSpeed = 4
    playerHealth=maxHealth
    playerDamage = 3
    skins.push("32")
},'normal':()=>{
    paused=true
    drawWindowParameters.fullString="Уровень повышен! Атака увеличена до 5, максимальное здоровье увеличено, здоровье восстановлено."
    drawWindowParameters.val=0
    drawWindowParameters.index=0
    drawWindowParameters.drawn=""
    playerSpeed = 4
    maxHealth=150
    playerHealth=maxHealth
    playerDamage = 5
    skins.push("31")

},'easy2':()=>{
    paused=true
    drawWindowParameters.fullString="Уровень повышен! Скорость увеличена до 5, максимальное здоровье увеличено, здоровье восстановлено."
    drawWindowParameters.val=0
    drawWindowParameters.index=0
    drawWindowParameters.drawn=""
    playerSpeed = 5
    maxHealth=180
    playerHealth=maxHealth
    skins.push("1")
},'normal2':()=>{
    paused=true
    drawWindowParameters.fullString="Уровень повышен! Атака увеличена до 7, здоровье восстановлено."
    drawWindowParameters.val=0
    drawWindowParameters.index=0
    drawWindowParameters.drawn=""
    playerDamage = 7
    playerHealth=maxHealth
    skins.push("22")
}},bosses=[{
    obj: boss,
    isSpawned: false,
    onScore: 10
},{
    obj: bossNoWeapon,
    isSpawned: false,
    onScore: 20
},{
    obj: boss2,
    isSpawned: false,
    onScore: 30
},{
    obj: bossNoWeapon2,
    isSpawned: false,
    onScore: 40
}],enemies = [new Enemy({x:-playerSize,y:511-playerSize*3/4},1), new Enemy({x:canvas.width,y:511-playerSize*3/4},2)],paddingWindow = 30, widthBorder=5,drawWindowParameters={ //параметры отрисовки окна
    drawn: "",
    fullString: "Для передвижения используй A D, для прыжка - пробел, для атаки - E, для блока удерживай F. Чтобы продолжить, нажми пробел...",
    index: 0,
    frequency: 4,
    val: 0

},
countInString = Math.floor((canvas.width*2/3-20)/12)
//спавн противников
setInterval(()=>{
    if(!paused)
        enemies.push(new Enemy({x:-playerSize,y:511-playerSize*3/4},1))
},10000)
setInterval(()=>{
    if(!paused)
    enemies.push(new Enemy({x:canvas.width,y:511-playerSize*3/4},1))
},7000)
setInterval(()=>{
    if(!paused)
    enemies.push(new Enemy({x:-playerSize,y:511-playerSize*3/4},2))
},30000)

setInterval(()=>{
    if(!paused)
    enemies.push(new Minotaur({x:-400,y:511},1))
},25000)
setInterval(()=>{
    if(!paused)
    enemies.push(new Minotaur({x:-400,y:511},2))
},90000)

setInterval(()=>{
    if(!paused)
    enemies.push(new Minotaur({x:canvas.width,y:511},1))
},41002)
function drawWindow(){//рисую окно с текстом, игра - на паузе
    const preS = c.fillStyle
    c.fillStyle='white'
    c.fillRect(canvas.width/6-widthBorder, canvas.height*3/4-paddingWindow-widthBorder, canvas.width*2/3+widthBorder*2, canvas.height/4+widthBorder*2)
    c.fillStyle='black'
    c.fillRect(canvas.width/6, canvas.height*3/4-paddingWindow, canvas.width*2/3, canvas.height/4)
    c.fillStyle='white'
    c.font="20px pixel font"
    drawWindowParameters.drawn=drawWindowParameters.fullString.substring(0,drawWindowParameters.index)
    drawWindowParameters.val++
    if(drawWindowParameters.val==drawWindowParameters.frequency){
        drawWindowParameters.val=0
        if(drawWindowParameters.index < drawWindowParameters.fullString.length)
            drawWindowParameters.index++
    }
    var py = 0
    for(var i = 0; i < drawWindowParameters.drawn.length; i+=countInString){
        c.fillText(drawWindowParameters.drawn.substring(i, countInString+i), canvas.width/6+10, canvas.height*3/4-paddingWindow+20+py*30)
        py++
    }
    c.fillStyle=preS
}
var x1,x2
function animate(){//основной цикл
    window.requestAnimationFrame(animate)
    c.drawImage(background,0,0, background.width, background.height, 0,0,canvas.width,canvas.height)
    if(playerDir==1){
        x1 = playerPosition.x+playerSize/2, x2 = playerPosition.x + playerSize
    }
    if(playerDir==-1){
        x1 = playerPosition.x, x2 = playerPosition.x + playerSize/2
    }
    if(!playerDiedAnim && !paused){
        if(isMove && !isBlock) { 
            playerPosition.x+=playerSpeed*playerDir
            if(playerPosition.x<0) playerPosition.x=0
            if(playerPosition.x>canvas.width-playerSize) playerPosition.x=canvas.width-playerSize
            if(typeMove=="run" && !isJump && !isFall){
                if(frameWalk.val>frameWalk.max) frameWalk.val=0
                else if(anim.timer%anim.step==0)frameWalk.val++
                xAnim=(5+frameWalk.val)%7
                yAnim=Math.floor((5+frameWalk.val)/7)
                anim.timer++
            }
        }
        if(isAttack){
            if(frameAttack.val>frameAttack.max){ frameAttack.val=0
                isAttack=false
            }
            else if(anim.timer%anim.step==0)frameAttack.val++
            xAnim=(5+frameAttack.val)%7
            yAnim=Math.floor((5+frameAttack.val)/7)+2
            anim.timer++

        }
        if(isBlock){
            xAnim=6
            yAnim=3
        }
        if(isJump && !isFall){
            if(frameJump.val>frameJump.max){ frameJump.val=0
                isJump=false
                isFall=true
            }
            else if(anim.timer%(anim.step*2)==0)frameJump.val++
            xAnim=(6+frameJump.val)%7
            yAnim=Math.floor((6+frameJump.val)/7)+1
            anim.timer++
            playerPosition.y-=jumpSpeed*3
            jumpHeight++
        }
        else if(isFall){
            if(frameFall.val>=jumpHeight){ frameFall.val=0
                isFall=false
            }
            xAnim=2
            yAnim=2
            frameFall.val++
            playerPosition.y+=jumpSpeed*3

        }
        if(!isMove && !isAttack && !isBlock && !isJump && !isFall){
            if(frameIdle.val>frameIdle.max) frameIdle.val=0
            else if(anim.timer%anim.step==0)frameIdle.val++
            xAnim=frameIdle.val
            yAnim=0
            anim.timer++
        }
    }
    enemies.forEach((e,i)=>{
        e.draw() //отрисовка противников
        if(paused) return
        if(e.name=="minotaur"){
            if(e.cooldownAtack.val==e.cooldownAtack.max){
                let dmg = e.damage[e.attackIndex]
                if(!isJump && !isFall && ((isBlock && playerDir==e.dir) || (!isBlock))){
                    isTakenDamage=true; damageDir=e.dir;playerHealth-=dmg;
                    if(playerHealth <= 0){playerDied = true}
                }
            }
            if(atackCheck(e) && isAttack && !(e.position.x + e.size/2 < playerPosition.x || e.position.x+e.size/12> playerPosition.x + playerSize/2))
                {
                    e.keyframes[e.frames.damage.value[Math.floor(Math.random()*e.frames.damage.value.length)]].is=true
                    e.damageDir=-e.dir
                    e.takeDamage.v=e.takeDamage.max
                    e.health-=playerDamage
                }
            if(e.died) {enemies.splice(i, 1);
                playerScore+=2
                defalutE.damage=Math.floor(playerScore/10)+1
                defalutE.health=Math.floor(playerScore/10)*2+1
                bosses.forEach(b => {
                    if(b.onScore==playerScore && !b.isSpawned){
                        enemies.push(b.obj)
                        b.isSpawned=true
                    }
                })}
        }
        else if(!paused){
            if(e.isAttack && playerPosition.y >= e.position.y && ((isBlock && playerDir==e.dir) || (!isBlock))) {isTakenDamage=true
                //если противник атакует игрока..
                damageDir=e.dir
                playerHealth-=e.damage
                if(playerHealth <= 0){playerDied = true}
                if(isJump){isJump=false,isFall=true}}
            if(atackCheck(e) && isAttack && !isBlock && e.near && !e.died && e.health>0 && playerPosition.y >= e.position.y){
                //если игрок атакует противника
                if(Math.random()<e.chanceDodge) {e.isShield=true, e.isAttack=false, e.frameAttack.val=0} //шанс уклониться от удара
                if(!e.isShield){
                    e.isTakenDamage=true
                    e.damageDir=-e.dir
                    e.health-=playerDamage
                }
            }
            if(e.died) {
                if(e.name!="enemy"){
                    actions[e.name]()
                }
                enemies.splice(i, 1);
                playerScore++
                defalutE.damage=Math.floor(playerScore/10)+1
                defalutE.health=Math.floor(playerScore/10)*2+1
                bosses.forEach(b => {
                    if(b.onScore<=playerScore && !b.isSpawned){
                        enemies.push(b.obj)
                        b.isSpawned=true
                    }
                })
            }
        }
    })
    if(!playerDiedAnim){
        if(isTakenDamage && !playerDied){
            frameAttack.val=0
            isAttack=false
            if(frameDamage.val>frameDamage.max){ frameDamage.val=0, isTakenDamage=false}
            else if(anim.timer%anim.step==0)frameDamage.val++
            xAnim=1
            yAnim=3
            anim.timer++
            playerPosition.x+=damageDir
            if(playerPosition.x<0) playerPosition.x=0
            if(playerPosition.x>canvas.width-playerSize) playerPosition.x=canvas.width-playerSize
        }
    }
    if(playerDied && !playerDiedAnim){
        if(frameDie.val>frameDie.max){ playerDiedAnim=true}
        else if(anim.timer%anim.step==0)frameDie.val++
        xAnim=1+frameDie.val
        yAnim=3
        anim.timer++
    }
    if(playerDiedAnim) {xAnim=4, yAnim=3}
    if(playerDir==1){c.drawImage(sprites.right, xAnim*playerSize,yAnim*playerSize,playerSize,playerSize,playerPosition.x,playerPosition.y,playerSize,playerSize)}
    if(playerDir==-1){c.drawImage(sprites.left, (6-xAnim)*playerSize,yAnim*playerSize,playerSize,playerSize,playerPosition.x,playerPosition.y,playerSize,playerSize)}
    c.drawImage(hp, 0, 0, 1, 1, 10, 10,maxHealth*canvas.width/500*maxHealth/100, hp.height*3)
    if(playerHealth>0)
        c.drawImage(hp, 0,0,hp.width,hp.height, 10, 10, playerHealth*canvas.width/500*maxHealth/100, hp.height*3)
    c.font = "bold 30px pixel font";
    c.fillText(playerScore.toString(), 10, hp.height*3+40)
    c.drawImage(sword, 0, 0, sword.width, sword.height, 10, 60+hp.height*3, swordSize, swordSize)
    c.font = "25px pixel font";
    c.fillText("атака: "+playerDamage.toString(), 20+swordSize, 85+hp.height*3)
    c.fillText("скорость: "+playerSpeed.toString(), 10, 130+hp.height*3)
    c.fillText("max hp: "+maxHealth.toString(), 10, 175+hp.height*3)
    if(paused){
        drawWindow()
    }
}
function atackCheck(e){ 
    const result = (x1 > e.position.x+e.size/2-e.realSize/2 && x1 < e.position.x+e.size/2+e.realSize/2)||(x2 > e.position.x+e.size/2-e.realSize/2 && x2 < e.position.x+e.size/2+e.realSize/2) || (x1 < e.position.x+e.size/2-e.realSize/2 && x2 > e.position.x+e.size/2+e.realSize/2)
    //console.log(result)
    return result
}
isJump=true
playerPosition.y=511-playerSize*3/4-9
animate()
themeAudio.autoplay=true
themeAudio.loop=true
themeAudio.volume=0.2
window.addEventListener("keydown",(e)=>{ 
    if(!audioPlayed){
        themeAudio.play()
        audioPlayed=true
    }
    if(!playerDied){
        switch (e.key.toLowerCase()){
            case 'a':
            case "ф":{
                playerDir=-1
                isMove=true
                typeMove="run"
                break
            }
            case 'd':
            case 'в':{
                playerDir=1
                isMove=true
                typeMove="run"
                break
            }
            case 'e':
            case 'у':{
                isAttack=true
                break
            }
            case 'f':
            case 'а':{
                isBlock=true
                break
            }
            case ' ':{
                if(!isFall && !isJump){
                isJump=true
                jumpHeight=0}
                if(drawWindowParameters.drawn==drawWindowParameters.fullString)
                    paused=false
                break
            }
        }
}
})
window.addEventListener("keyup",(e)=>{
    if(!playerDied){
        switch (e.key.toLowerCase()){
            case 'a':
            case "ф":{
                if(playerDir==-1)
                isMove=false
                break
            }
            case 'd':
            case 'в':{
                if(playerDir==1)
                isMove=false
                break
            }
            case 'f':
            case 'а':{
                isBlock=false
                break
            }
        }
}
})
