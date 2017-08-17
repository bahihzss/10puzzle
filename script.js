window.onload = () => { // ウィンドウの読み込み完了時に以下の処理を行う

    /**
     * InputのID一覧
     * @type {Array.<string>}
     */
    const inputIds = ['n1', 'n2', 'n3', 'n4'];

    /**
     * 演算子一覧
     * @type {Array.<string>}
     */
    const operator = ['+', '-', '*', '/'];

    // OKボタン押下時のイベントを登録
    document.getElementById('okButton').addEventListener('click', calc);
    
    // inputへ数値入力時の挙動をイベント登録
    inputIds.map(id =>
        document.getElementById(id).addEventListener('keydown', input)
    );

    /**
     * 数値入力におけるキーボード押下時の処理
     * 一桁の自然数以外を入力できないように制限
     * 
     * @param {Object} event
     */
    function input(event) {
        /**
         * 押下されたキー
         * @type {string}
         */
        const key = event.key;
        
        // 押したキーが数字キーならinputの値にする
        if (key.match(/\d/)) event.target.value = key;

        // 押したキーが特殊キー(TabとかEnterとか)でないならこれより後のEventを止める 
        if (key.length === 1) event.preventDefault(); 

        // 押したキーがEnterですべてのインプットが入力されているならば計算処理を行う
        if (key === 'Enter' && isInputAll()) calc(); 
    }

    /**
     * 与えられた文字列を結果欄に表示する
     * 
     * @param {string} message HTML可 
     */
    function output(message) {
        document.getElementById('result').innerHTML = message;
    }

    /**
     * すべてのinputに値が入力されていればtrueされていなければfalseを返す
     * 
     * @return {boolean}
     */
    function isInputAll() {
        return inputIds.reduce((result, id) =>
            result && document.getElementById(id).value.length
        , true);
    }

    /**
     * 計算処理
     * 
     * @return {void}
     */
    function calc() {
        if (!isInputAll()) return;

        /**
         * inputの値
         * @type {Array.<number>}
         */
        const inputs = inputIds.map(id =>
            parseInt(document.getElementById(id).value)
        );

        /**
         * 計算対象になる順列
         * @type {Array.<Array.<number>>}
         */
        const numberList = getPermutation(inputs);

        /**
         * 計算結果が10になる式（中置記法）
         * @type {Array.string}
         */
        const result = [];

        // 数列一覧をループで回す
        numberList.forEach(numbers => {
            // 数列から考えられる式すべてをループで回す
            getFormulaList(numbers).forEach(formula => {
                // 式を評価して答えが10の場合は結果一覧に追加する
                const answer = eval(formula);
                if (answer === 10) result.push(formula);
            });
        });

        const message = `${result.length}件<br>${result.join('<br>')}`;
        // 結果を出力
        output(message);
    }

    /**
     * 与えられた配列の要素の順列を返す（重複は取り除かれる）
     * 
     * @param {Array.<number>} numbers 
     * @return {Array.<Array.<number>>}
     */
    function getPermutation(numbers) {
        /**
         * 数列の要素数
         * @type {number}
         */
        const length = numbers.length;
        // 与えられた配列の要素数が１つの場合
        if (length === 1) return [numbers];

        // 複数の要素をもつ配列を与えられた場合の処理
        return numbers.reduce((result, n) => {
            const next = [].concat(numbers);
            next.splice(numbers.indexOf(n), 1);
            getPermutation(next).forEach(progression => {
                const item = [n].concat(progression);
                if(!has(result, item)) result.push(item);
            });
            return result;
        }, []);
    }

    /**
     * 任意の数列に対してすべての式を返す
     * 
     * @param {Array.<number>} progression
     * @return {Array.<string>} 
     */
    function getFormulaList(progression) {
        /**
         * 演算子の組み合わせ一覧
         * @type {Array.<string>}
         */
        const operatorList = getOperatorList(progression.length - 1);
        
        /**
         * 演算子の分布一覧
         * @type {Array.<number>}
         */
        const formatList = getFormatList(progression.length);

        /**
         * 結果
         * @type {Array.<string>}
         */
        const result = [];

        // すべての演算子一覧をすべての分布一覧に照らし合わせて任意の数列に配置
        operatorList.forEach(operators => {
            formatList.forEach(format => {
                let formula = [];
                const ops = [].concat(operators);
                format.forEach((n, i) => {
                    const unit = [progression[i]];
                    if (n) unit.push(ops.splice(0, n).join(' '));
                    formula = formula.concat(unit);
                    if (i === progression.length-1) {
                        const infix = parseInfix(formula.join(' '));
                        if (!has(result, infix)) result.push(infix);
                    }
                });
            });
        });

        return result;
    }

    /**
     * 演算子count個の組み合わせをすべて返す
     * 
     * @param {number} count 
     */
    function getOperatorList(count) {
        if (count === 1) return operator.map(o => [o]);
        return operator.reduce((r, o) => 
            r.concat(getOperatorList(count-1).map(ol => [o].concat(ol)))
        , []);
    }

    /**
     * 演算子の分布一覧を返す
     * 
     * @param {number} length 値の数（４つ以上の数でも計算できる） 
     * @return {Array.<number>}
     */
    function getFormatList(length, count = length-1, turn = 0) {
        if (length === 1) return [[count]];
        let result = [];
        for(let i=0; i <= turn; ++i) {
            if (i) --count;
            if(count !== 0) getFormatList(length - 1, count, turn + 1).map(format => {
                result.push([i].concat(format));
            });
        }
        return result;
    }

    /**
     * 配列arrayが与えられた要素contentを持っているかを返す
     * 配列の場合、内容が同じなら持っているとみなす
     * 
     * @param {Array} array 
     * @param {*} content 
     * @return {boolean}
     */
    function has(array, content) {
        return array.reduce((result, item) => result || equal(item, content), false);
    }

    /**
     * 変数や配列の内容が同じかを検証する
     * 
     * @param {Array} a 
     * @param {Array} b 
     */
    function equal(a, b) {
        // 同じ配列を参照している場合（Jacascriptのオブジェクト・配列は参照渡しであるため）
        if (a === b) return true;
        // いずれかがnullである場合はfalse
        if (a == null || b == null) return false;
        // 要素数が一致しない場合もfalse
        if (a.length != b.length) return false;
      
        for (let i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
    }

    /**
     * 逆ポーランド記法の計算式を中置記法に変換する
     * 
     * @param {string} formula
     * @return {string}
     */
    function parseInfix(formula) {
        return formula.split(' ').reduce((s, v) => {
            // 値が演算子でなければスタックに積む
            if (!has(operator, v)) return [v].concat(s);
            else {
                // 直前の１つ前にスタックに積まれた値を取り出す（演算子が掛け割の場合は括弧を付加）
                const a = (has(['*', '/'], v) && s[1].match(/[+-]/)) ?
                    `(${s.splice(1, 1)})` 
                    : s.splice(1, 1);
                // 直前にスタックに積まれた値を取り出す（演算子が掛け割の場合は括弧を付加）
                const b = (has(['*', '/'], v) && s[0].match(/[+-]/)) ?
                    `(${s.splice(0, 1)})` 
                    : s.splice(0, 1);
                // 中置記法に並び替えてスタックに積む
                return [`${a}${v}${b}`].concat(s);
            }
        }, [])[0];
    }
};