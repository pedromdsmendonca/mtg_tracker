var fs = require('fs')

var types = [
    'Prerelease',
    'Preliminary',
    'Friday',
    'Grand Prix'
]

var data = fs.readFileSync('mtggames.txt', 'utf8')

//remove every thing before the first event
data = data.split('PointsPro Points')[1]

data = data.split('Correct this event.')

data.pop()

var events = []

function opponents(event){
    let data = event.split('Match History:')[1].split('Planeswalker Points Earned:')[0]

    let info = data.split('\r\n').slice(1, -1)

    let ops = []

    for(let i = 0; i < info.length - 1; i++){
        let result = info[i]
        let op = info[i+1]

        if(isNaN(op[0])){
            i++
            ops.push({
                opponent: op,
                win: result.match(/Win/g) != null,
                draw:  result.match(/Draw/g) != null,
            })
        }
    }

    return ops
}

data.forEach(e => {
    let year = e.split('-')[0]

    //remove the trailing -
    let tournamentInfo = e.split('\n')[1].slice(0, -2)

    let date = tournamentInfo.substring(0,10)

    let proPointsIndex = tournamentInfo.length - 1

    while(!isNaN(tournamentInfo[proPointsIndex])){
        proPointsIndex--;
    }
    let proPoints = tournamentInfo.substring(proPointsIndex + 1)

    tournamentInfo = tournamentInfo.substring(0, proPointsIndex + 1).substring(10)

    let format = e.split('Format: ')[1].split('\r')[0]
    let type = 'undefined'

    types.forEach(t => {
        if((e.match(t) || []).length > 0) type = t
    })

    let place = e.split('Place: ')[1].split('\r')[0]
    let players = e.split('Players: ')[1].split('\r')[0]

    let wins = (e.match(/Win/g) || []).length + (e.match(/Bye/g) || []).length;
    let byes = (e.match(/Bye/g) || []).length;
    let losses = (e.match(/Loss/g) || []).length;
    let draws = (e.match(/Draw/g) || []).length;

    let event = {
        proPoints,
        tournamentInfo,
        format,
        date,
        type,
        place,
        players,
        wins,
        losses,
        draws,
        byes,
        opponents: opponents(e)
    }

    events.push(event)
})

// let pre = events.filter(e => e.type == 'Prerelease')
// let sealed = events.filter(e => e.format == 'Sealed\r')

let w = 0, l = 0, d = 0
events.forEach(p => {
    w += p.wins
    l += p.losses
    d += p.draws
})

function matchHistory(events){
    let ops = {}
    events.forEach(e => {
        e.opponents.forEach(op => {
            let name = op.opponent
            if (ops[name] == undefined) {
                ops[name] = {
                    w: 0,
                    l: 0,
                    d: 0
                }
            }

            if(op.win) ops[name].w++
            if(op.draw) ops[name].d++
            if(!op.win && !op.draw) ops[name].l++
        })
    })

    return ops
}

// console.log(pre[0])
// console.log(pre.reduce((a, b) => a.wins + b.wins, 0))
// console.log(w, l, d)
// console.log(w / (w + l))
// console.log(events[0])
// console.log(w, l, d)

// console.log(data[0])

// console.log(matchHistory(events))

let pre = events.filter(e => e.type == 'Prerelease')
console.log(tournamentResults(pre))

function tournamentResults(events){
    let w = 0
    let d = 0
    let l = 0
    let b = 0
    let places = {}
    events.forEach(e => {
        w += e.wins
        d += e.draws
        l += e.losses
        b += e.byes

        if(places[e.place] == null) places[e.place] = 0

        places[e.place]++
    })

    return {
        w,
        l,
        d,
        b,
        places,
        count: events.length,
        winRate: w/(w+d+l),
        winRateWithoutDraws: w/(w+l)
    }
}