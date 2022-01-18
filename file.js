const canvas = document.querySelector('canvas')
canvas.width = innerWidth
canvas.height = innerHeight

const c = canvas.getContext('2d')
const scoreEL = document.getElementById('score')
const buttonBtn = document.getElementById('start-btn')
const modalEl = document.getElementById('modalEl')
const gameScore = document.getElementById('gameScore')



//player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.save()
        c.shadowColor = this.color
        c.shadowBlur = 10
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
}
const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 20, 'white')
let projectEls = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 20, 'white')
    projectEls = []
    enemies = []
    particles = []
    score = 0
    scoreEL.innerHTML = score
    gameScore.innerHTML = score
}

//attaking class
class ProjectEl {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.save()
        c.shadowColor = this.color
        c.shadowBlur = 15
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.draw()
    }
}
addEventListener('click', (event) => {
    const x = canvas.width / 2
    const y = canvas.height / 2
    const radius = 5
    const color = 'white'
    const angle = Math.atan2(event.y - canvas.height / 2, event.x - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
    }
    projectEls.push(new ProjectEl(x, y, radius, color, velocity))
})

//enimes class
class Enemies {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.shadowColor = this.color
        c.shadowBlur = 10
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.x -= this.velocity.x
        this.y -= this.velocity.y
        this.draw()
    }
}
function createEnimes() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x;
        let y;
        if (Math.random() < 0.50) {
            x = Math.random() < 0.30 ? -radius : canvas.width + radius
            y = Math.random() * canvas.height + radius
        } else {
            y = Math.random() > 0.50 ? -radius : canvas.height + radius
            x = Math.random() * canvas.width + radius
        }

        const color = `hsl(${Math.random() * (360 - 1) + 1},70%,50%)`
        const angle = Math.atan2(y - canvas.height / 2, x - canvas.width / 2)
        const velocity = {
            x: Math.cos(angle) * 1,
            y: Math.sin(angle) * 1
        }

        enemies.push(new Enemies(x, y, radius, color, velocity))
    }, 2000)
}

//enimes particles
let friction = 0.98;
class Particles {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
        this.shadowBlur = 30
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.shadowColor = this.color
        c.shadowBlur = this.shadowBlur
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
        this.shadowBlur -= 0.001
        this.draw()
    }
}


let score = 0
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    //enimes particles
    particles.forEach((particle, i) => {
        if (particle.alpha <= 0) {
            particles.splice(i, 1)
        } else {
            particle.update()
        }
    });

    //attacking
    projectEls.forEach((projectEl, index) => {
        projectEl.update()
        const fethagorthXy = Math.hypot(canvas.width, canvas.height)

        if (projectEls.x + projectEl.radius < 0 || projectEl.x - projectEl.radius > fethagorthXy ||
            projectEl.y + projectEl.radius < 0 || projectEl.y - projectEl.radius > fethagorthXy) {
            setTimeout(() => {
                projectEls.splice(index, 1)
            }, 0);
        }
    });

    //enimes
    enemies.forEach((enemy, enemyI) => {
        enemy.update()
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y)

        //Game over
        if (dist < enemy.radius + player.radius) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            gameScore.innerHTML = score

        }
        //collision attackers and enemies
        projectEls.forEach((projectEl, projectElI) => {
            const dist = Math.hypot(enemy.x - projectEl.x, enemy.y - projectEl.y)
            if (dist < enemy.radius + projectEl.radius) {
                if (enemy.radius - 10 > 5) {
                    //increase scores
                    score += 10
                    scoreEL.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectEls.splice(projectElI, 1)
                    }, 0);
                } else {
                    //increase scores
                    score += 15
                    scoreEL.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(enemyI, 1)
                        projectEls.splice(projectElI, 1)
                    }, 0);
                }
            }
        });
    });

    //player
    player.draw()
}

buttonBtn.addEventListener('click', () => {
    init()
    createEnimes()
    animate()
    modalEl.style.display = 'none'
})