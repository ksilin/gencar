
// dec2hex :: Integer -> String
function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}
// Math.round(genes[16] /  Math.PI * 4);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomElement(ar, from = 0) {
    return ar[getRandomInt(from, ar.length - 1)]
}

export {dec2hex, generateId, getRandomInt, getRandomElement}
