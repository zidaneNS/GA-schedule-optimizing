const test = {};

test['halo'] = {
    nama: 'nama test',
    time: 'time'
}
test['halo1'] = {
    nama: 'nama test 1',
    time: 'time 1'
}

console.log(Object.values(test).filter(value => value.time === 'time'));