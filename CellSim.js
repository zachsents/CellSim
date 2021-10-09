
function Term(coef, species) {
    this.coef = coef
    this.species = species
}

function Reaction(leftSide, rightSide, constant) {
    this.leftSide = leftSide
    this.rightSide = rightSide
    this.constant = constant
}

/*
    Create two forward reactions from one reversible reaction
*/
function ReverseReaction(leftSide, rightSide, constantF, constantR) {
    return [
        new Reaction(leftSide, rightSide, constantF),
        new Reaction(rightSide, leftSide, constantR)
    ]
}

/*
    Creates reactions from string input in the form:
        coef*Species + Species <-> coef*Species + coef*Species
*/
function StringReaction(reactionString, coefs, constantF, constantR) {
    let str = reactionString.replace(/\s*/g, '')
    let parts = [], reversible = false

    if(str.match(/<->/)) {
        reversible = true
        parts = str.split(/<->/)
    }
    else if(str.match(/->/))
        // not reversible
        parts = str.split(/->/)
    else
        return false
    
    // split everything into arrays & remove empty parts
    parts = parts.map(p => p.split('+').map(t => t.split('*')))
                .map(p => p.filter(t => t[0]))

    const makeTerm = t => t.length == 1 ? new Term(1, t[0]) : new Term(coefs[t[0]], t[1])
    const left = parts[0].map(makeTerm), right = parts[1].map(makeTerm)

    if(reversible)
        return ReverseReaction(left, right, constantF, constantR)
    return [new Reaction(left, right, constantF)]
}

function System(reactions, initial = {}) {
    this.reactions = reactions
    this.species = new Set()
    this.concentrations = new Map(Object.entries(initial))

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
    this.step = timeStep => {
        this.time += timeStep
        const concChanges = Object.fromEntries([...this.species].map(s => [s, 0]))
        this.reactions.forEach(r => {
            let reactantConcentrations = timeStep * r.constant * r.leftSide.reduce((accum, term) => accum * Math.pow(this.concentrations.get(term.species), term.coef), 1)

            // remove reactants
            r.leftSide.forEach(term =>
                concChanges[term.species] -= reactantConcentrations
            )

            // add products
            r.rightSide.forEach(term => 
                concChanges[term.species] += reactantConcentrations
            )
        })
        Object.entries(concChanges).forEach(([species, change]) => {
            this.concentrations.set(species, this.concentrations.get(species) + change)
        })
        this.saving && pushFrame()
    }

    this.stepMultiple = ({timeStep, iterations, logOutput}) => {
        for(let i = 0; i < iterations; i++) {
            this.step(timeStep)
            logOutput && console.log(`\t${i+1} / ${iterations}`)
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


module.exports = {
    Term, Reaction, ReverseReaction, StringReaction, System
}