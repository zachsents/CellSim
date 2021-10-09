const fs = require('fs')
const {System, StringReaction} = require('./CellSim')

const   krf = 0.1,
        krr = 1,
        ko = 0.1,
        kd = 0.1,
        nc = 2,
        np = 10

const reactions = [
    ...StringReaction(`LacI ->`, {}, kd),
    ...StringReaction(`TetR ->`, {}, kd),
    ...StringReaction(`pLac -> np*TetR + pLac`, {np}, ko),
    ...StringReaction(`pTet -> np*LacI + pTet`, {np}, ko),
    ...StringReaction(`pLac + nc*LacI <-> pLac_LacI`, {nc}, krf, krr),
    ...StringReaction(`pTet + nc*TetR <-> pTet_TetR`, {nc}, krf, krr),
    ...StringReaction(`aTc + TetR -> aTc_TetR`, {}, ko),
    ...StringReaction(`IPTG + LacI -> IPTG_LacI`, {}, ko),
]

const system = new System(reactions, {LacI: 0, TetR: 1, pLac: 1, pTet: 1})
system.record()
system.stepMultiple({timeStep: 0.02, iterations: 8000})
system.set('aTc', 10)
system.stepMultiple({timeStep: 0.02, iterations: 15000})
system.set('IPTG', 10)
system.stepMultiple({timeStep: 0.02, iterations: 8000})

fs.writeFileSync('./sim_output.csv', system.stopRecording())