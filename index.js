var fs = require('fs')

var types = [
    'Prerelease',
    'Preliminary',
    'Friday'
]

var data = fs.readFileSync('mtggames.txt', 'utf8')

//remove every thing before the first event
data = data.split('PointsPro Points')[1]

data = data.split('Correct this event.')

data.pop()

var events = []

data.forEach(e => {
    let year = e.split('-')[0]
    let date = e.split('\n')[1]
    let name = e.split('\n')[2]
    let location = e.split('\n')[3]

    let format = e.split('Format: ')[1].split('\n')[0]
    let type = 'undefined'

    types.forEach(t => {
        if((e.match(t) || []).length > 0) type = t
    })

    let place = e.split('Place: ')[1].split('\n')[0]
    let players = e.split('Players: ')[1].split('\n')[0]

    let wins = (e.match(/Win/g) || []).length + (e.match(/Bye/g) || []).length;
    let losses = (e.match(/Loss/g) || []).length;
    let draws = (e.match(/Draw/g) || []).length;

    let event = {
        format,
        date,
        type,
        place,
        players,
        wins,
        losses,
        draws
    }

    events.push(event)
})

let pre = events.filter(e => e.type == 'Prerelease')
let sealed = events.filter(e => e.format == 'Sealed\r')

let w = 0, l = 0, d = 0
pre.forEach(p => {
    w += p.wins
    l += p.losses
    d += p.draws
})

console.log(pre[0])
console.log(pre.reduce((a, b) => a.wins + b.wins, 0))
console.log(w, l, d)
console.log(w / (w + l))