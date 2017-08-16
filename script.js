const plus = function(a, b) {
    return "(" + a + "+" + b + ")";
}

const minus = function(a, b) {
    return "(" + a + "-" + b + ")";
}

const multiply = function(a, b) {
    return a  + "*" + b;
}

const divide = function(a, b) {
    if(a !== 0 && b !== 0) return a  + "/" + b;
    else return "null";
}
const operates = {plus, minus, multiply, divide};

const exec = function(e) {
    let n1, n2, n3, n4, result;
    let numbersList = {}
    n1 = parseInt(document.getElementById('n1').value);
    n2 = parseInt(document.getElementById('n2').value);
    n3 = parseInt(document.getElementById('n3').value);
    n4 = parseInt(document.getElementById('n4').value);
    if (!(n1 && n2 && n3 && n4)) return;
    numbersList = getNumbersList([n1, n2, n3, n4]);

    result = objMap(numbersList, numbers => calc(numbers));
    message = format(result);

    document.getElementById('result').value = message;
    console.log(result);
    return false;
}

const getNumbersList = function(numbers) {
    let result = {};
    getAssortment(numbers, numbers.length).map(numbers => result['[' + numbers.join(',') + ']'] = numbers);
    return result;
}

const getAssortment = function(numbers, count){
    let arrays, i, j, length, results, parts;
    arrays = [];
    length = numbers.length;
    if(length < count){
        return;
    } else if(count == 1){
        for(i = 0; i < length; i ++){
            arrays[i] = [numbers[i]];
        }
    } else {
        for(i = 0; i < length; i ++){
            parts = numbers.slice(0);
            parts.splice(i, 1)[0];
            results = getAssortment(parts, count - 1);
            for(j = 0; j < results.length; j ++){
                arrays.push([numbers[i]].concat(results[j]));
            }
        }
    }
    return arrays;
}

const calc = function(numbers) {
    let number = numbers.shift();
    if (numbers.length === 0) return number;
    else return objMap(evaluate(number, numbers[0]), (result, key) => {
        let next = [].concat(numbers);
        next[0] = result;
        return calc(next);
    });
}

const format = function(result) {
    let message, filtered;
    let exception = {};
    objMap(objFilter(objFlat(result), content => {console.log(content, content.match(/\([0-9]-[0-9]\)[*/]/));
        return content.match(/\([0-9]-[0-9]\)[*/]/)}), (content, key) => {
        exception[key+".ex"] = content.replace(/\([0-9]-[0-9]\)[*/][0-9]/, match => match.replace(')', '') + ')')
    });
    objMap(objFilter(objFlat(result), content => {console.log(content, content.match(/\([1-9]\//));
        return content.match(/\([0-9]\/[0-9]-[0-9]\)[*/]/)}), (content, key) => {
        exception[key+".ex2"] = content.replace(/\([0-9]\/[0-9]-[0-9]\)[*/][1-9]/, match => match.replace(')', '').replace(/\([1-9]\//, match => match.replace('(', '') + '(' ) + ')')
    });

    filtered = objFilter(Object.assign({}, objFlat(result), exception), content => eval(content) === 10);
    message = Object.keys(filtered).length + "件\n"
    objMap(filtered, formula => message += formula + "\n");

    console.log(exception);

    return messageFormat(message);
}

const messageFormat = function(message) {
    return message.replace(/\*/g, '×').replace(/\//g, '÷');
}

const evaluate = function(a, b) {
    return objMap(operates, (operate, key) => operate(a, b));
}

const objMap = function(obj, callback) {
    let result = {}
    Object.keys(obj).map(key => result[key] = callback(obj[key], key));
    return result;
}

const objFlat = function(obj) {
    let result = {};
    objMap(obj, (content, key) => {
        if (classOf(content) === "hash") {
            let flatObj = objFlat(content);
            objMap(flatObj, (flatObjContent, flatObjKey) => {
                result[key + '.' + flatObjKey] = flatObjContent;
            })
        } else {
            result[key] = content;
        }
    });
    return result;
}

const objFilter = function(obj, condition) {
    let result = {};
    objMap(obj, (content, key) => {
        if (condition(content, key)) result[key] = content;
    })
    return result;
}

const classOf = function(obj){
    if((typeof obj)=="object"){
        if(obj.length!=undefined)return "array";
        else{for(t in obj){
            if(obj[t]!=undefined)return "hash";
            else return "object";
        }}
    }else return (typeof obj);
}
