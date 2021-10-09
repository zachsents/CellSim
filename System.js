
module.exports = System

function System(reactions, initial = {}, simulator) {
    this.reactions = reactions
    this.species = new Set()
    this.concentrations = new Map(Object.entries(initial))

    this.simulator = simulator
    this.simulator.system = this

    this.saving = false
    this.frames = []
    this.time = 0

    // get unique species from reactions
    this.reactions
        .reduce((accum, r) =>[...accum, ...r.leftSide.map(t => t.species), ...r.rightSide.map(t => t.species)], [])
        .forEach(s => this.species.add(s))
    
    // start concentrations without initial values at 0
    this.species.forEach(s => {
        if(!this.concentrations.has(s))
            this.concentrations.set(s, 0)
    })

    // step through an amount of time
    this.step = (i) => {
        this.simulator.step(i)
        this.saving && pushFrame()
    }

    this.stepMultiple = iterations => {
        for(let i = 0; i < iterations; i++) {
            this.step(i)
        }
    }

    this.set = (species, value) => {
        this.concentrations.set(species, value)
    }

    this.record = () => {
        this.saving = true
        pushFrame()
    }

    this.stopRecording = () => {
        if(!this.saving)
            return false
        this.saving = false
        let csv = Object.keys(this.frames[0]).join(',') + '\n'
        csv += this.frames.map(frame => Object.values(frame).join(',')).join('\n')
        this.frames = []
        return csv
    }

    const pushFrame = () => {
        this.frames.push({Time: this.time, ...Object.fromEntries(this.concentrations.entries())})
    }
}