const fs = require('fs')
const { StringReaction } = require('../Reaction')
const SSADirect = require('../simulators/SSADirect')
const System = require('../System')

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
]

const system = new System(reactions, {
    pLac: 1,
    pTet: 1
}, new SSADirect())

system.record()
system.stepMultiple(15)

fs.writeFileSync('./sim_output.csv', system.stopRecording())