export const problems = {
  isPrime: {
    title: '素数判定', description: '整数 n を受け取り、素数なら1、それ以外なら0を返してください。',
    signature: 'int isPrime(int n)', cases: [['7','1','約数が見つからないときの戻り値は？'],['9','0','9は3で割り切れます。'],['1','0','1以下は素数ではありません。'],['2','1','繰り返しが0回のときの戻り値は？']],
    hint: '9を2、3の順に割ってみましょう。割る数を変える作業を for 文で繰り返せます。',
    template: 'int isPrime(__1__) {\n    int result = __2__;\n    for (int i = __3__; __4__; __5__) {\n        if (__6__) { __7__; }\n    }\n    if (__8__) { __9__; }\n    return __10__;\n}',
    blanks: [['int n'],['1'],['2'],['i<n','i<=n-1'],['i++','++i'],['n%i==0'],['result=0'],['n<=1','n<2'],['result=0'],['result']]
  },
  sum: {
    title: '1からnまでの合計', description: '正の整数 n を受け取り、1からnまでの合計を返してください。',
    signature: 'int sum(int n)', cases: [['1','1','1も足していますか？'],['2','3','2まで足していますか？'],['5','15','1から5まで順に足してみましょう。'],['10','55','合計を毎回上書きしていませんか？']],
    hint: 'nが3なら1、2、3を順に足します。数を1つずつ増やしながら足す処理を for 文で書けます。',
    template: 'int sum(__1__) {\n    int result = __2__;\n    for (int i = __3__; __4__; __5__) {\n        __6__;\n    }\n    return __7__;\n}',
    blanks: [['int n'],['0'],['1'],['i<=n','i<n+1'],['i++','++i'],['result+=i','result=result+i'],['result']]
  },
  bubble_sort: {
    title: 'バブルソート', description: '整数配列 arr と要素数 n を受け取り、配列を昇順に並べ替えてください。',
    signature: 'void bubble_sort(int arr[], int n)',
    cases: [['4 3 4 1 2','1 2 3 4','隣り合う要素を比べてみましょう。'],['3 2 1 2','1 2 2','同じ値もすべて残します。'],['4 4 3 2 1','1 2 3 4','1周で並び替えが終わるか確認しましょう。'],['1 5','5','要素が1個なら交換は不要です。']],
    hint: '右端から隣り合う2つの数を比べ、左が大きければ交換します。1周すると最小値が左端に移ります。',
    template: 'void bubble_sort(int arr[], int n) {\n    for (int i = 0; __1__; i++) {\n        for (int j = n - 1; __2__; j--) {\n            if (__3__) {\n                int tmp = arr[j];\n                arr[j] = __4__;\n                arr[j - 1] = __5__;\n            }\n        }\n    }\n}',
    blanks: [['i<n-1'],['j>i'],['arr[j-1]>arr[j]'],['arr[j-1]'],['tmp']]
  }
};
