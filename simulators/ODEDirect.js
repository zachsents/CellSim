
module.exports = ODEDirect

function ODEDirect({timeStep}) {

    this.timeStep = timeStep

    this.step = () => {
        this.system.time += timeStep
        const concChanges = Object.fromEntries([...this.system.species].map(s => [s, 0]))
        this.system.reactions.forEach(r => {
            let reactantConcentrations = timeStep * r.constant * r.leftSide.reduce((accum, term) => accum * Math.pow(this.system.concentrations.get(term.species), term.coef), 1)

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
            this.system.concentrations.set(species, this.system.concentrations.get(species) + change)
        })
    }
}