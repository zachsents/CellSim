
module.exports = SSADirect

function SSADirect() {

    this.step = (itc) => {
        const props = this.system.reactions.map(r => {
            return r.constant * r.leftSide.reduce((accum, term) => {
                let num = 1
                for(let i = 0; i < term.coef; i++)
                    num *= this.system.concentrations.get(term.species) - i
                return accum * num / term.coef
            }, 1)
        })

        const a0 = props.reduce((accum, aj) => accum + aj)
        const tau = Math.log(1 / Math.random()) / a0

        this.system.time += tau

        const thresh = a0 * Math.random()
        let i = -1, sum = 0
        while(sum <= thresh) {
            i++
            sum += props[i]
        }
        
        this.system.reactions[i].leftSide.forEach(term => {
            this.system.concentrations.set(term.species, this.system.concentrations.get(term.species) - term.coef)
        })
    
        this.system.reactions[i].rightSide.forEach(term => {
            this.system.concentrations.set(term.species, this.system.concentrations.get(term.species) + term.coef)
        })
    }
}