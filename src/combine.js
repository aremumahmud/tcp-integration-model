function combine(x, y) {
    let xn = {...x }
    let yn = {...y }
    let ynKeys = Object.keys(yn)
    ynKeys.forEach(key => {
        // console.log(xn[key].constructor.name)
        if (xn[key] && xn[key].constructor.name == 'Array') {
            xn[key].push(yn[key])
            return
        }
        if (xn[key]) {
            let temp = xn[key]
            xn[key] = [temp, yn[key]]
            return
        }
        xn[key] = yn[key]
    })
    return xn
}

module.exports = combine