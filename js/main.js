import { Player } from "./player.js"
import { Input } from "./input.js"
import { Obstacle } from "./obstacle.js"
import { UI } from "./UI.js"
import { Background } from "./background.js"
import { Sound } from "./sound.js"
import { Gameover } from "./gameover.js"

const loaded = () => {

    let font = new FontFace(
        "Pixel",
        "url(https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)"
    );

    font.load().then((font) => {

        document.fonts.add(font);

        const canvas = document.getElementById('game')
        const ctx = canvas.getContext('2d')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        class Game {
            constructor(width, height) {
                this.width = width
                this.height = height
                this.speed = 5
                this.frames = 0
                this.score = 0
                this.groundMargin = 160
                this.obstacles = []
                this.obstaclesInterval = 60
                this.player = new Player(this)
                this.background = new Background(this)
                this.input = new Input(this)
                this.UI = new UI(this)
                this.sound = new Sound(this)
                this.gameover = new Gameover(this)
            }
            start() {
                console.log('start');
                animate()
                this.sound.playBackgroundMusic()
                canvas.style.display = 'block'
            }
            update() {

                if (!this.player.crashed) {
                    this.frames += 1
                    this.scoreIncrement()
                    this.background.update(this.input.keys)
                    this.player.update(this.input.keys)

                    if (this.frames % this.obstaclesInterval === 0) this.addObstacle()
                    this.updateObstacles()
                    this.spaceSpeedModifier()
                }

                if (this.player.crashed) this.gameover.update()

            }
            draw(context) {
                this.background.draw(context)
                this.player.draw(context)
                this.obstacles.forEach(obstacle => { obstacle.draw(context) })
                this.UI.draw(context)

                if (this.player.crashed) this.gameover.draw(context)
            }
            addObstacle() {
                this.obstacles.push(new Obstacle(this))
            }
            scoreIncrement() {
                if (this.frames % 10 === 0) this.score += Math.floor(this.speed)
                this.scoreText = this.score.toString().padStart(6, '0')
            }
            updateObstacles() {
                this.obstacles.forEach((obstacle, index) => {
                    if (obstacle.toDelete) this.obstacles.splice(index, 1)
                    obstacle.update()
                })
            }
            spaceSpeedModifier() {
                if (this.input.keys.includes(' ')) this.speed = 10
                else this.speed = 5
            }
        }

        const game = new Game(canvas.width, canvas.height)

        let requestAnimation

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            game.update()
            game.draw(ctx)
            requestAnimation = requestAnimationFrame(animate)
        }

        let checkInterval = setInterval(() => {
            if (game.player.crashed) {
                game.sound.stopBackgroundMusic()
                game.sound.playGameOver()

                clearInterval(checkInterval)
            }
        }, 50);

        const startButton = document.getElementById('start')
        startButton.addEventListener('click', () => { 
            game.start() 
            startButton.style.display = 'none'
        })

    })
}

window.addEventListener('load', loaded)