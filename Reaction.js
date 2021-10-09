const Term = require('./Term')

module.exports = {ForwardReaction, ReverseReaction, StringReaction}

function Reaction(leftSide, rightSide, constant) {
    this.leftSide = leftSide
    this.rightSide = rightSide
    this.constant = constant
}

function ForwardReaction(leftSide, rightSide, constantF) {
    return [new Reaction(leftSide, rightSide, constantF)]
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