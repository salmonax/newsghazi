//See README.md for how to utilize the function below.

function promiseArr(keywords, timePeriod) {
  return groupKeywords(keywords).map(function (keyword, index, arr) {
    console.log('called this');
    return rp({
      uri: 'http://www.google.com/trends/fetchComponent?q=' + keyword + '&cid=TIMESERIES_GRAPH_0&export=3&' + timePeriod,
      headers: {
        //Personal cookie can be found in Chrome, this cookie will not work
        'Cookie': 'APISID=39Tg-dAKv2HyraJi/A1kby1JyD2IIwJit2; HSID=ArgzpPTHG1k5nKTtW; NID=91\=lhNl2aBMLJ0Ju-AeBLkIqsI1GH2sV5IHlTcXGaEtIzt7O6E6n_rnBpZwF_iYvhmcdYKFeDcohCImXLSp7lWEkx2TXpwDV32_oiWHHt1D6b187xp1rBa1vn4iJtOX2KHZvzUDjWz_9hCAGVxhi8gGe6JcpxGb8UREnBLESgZMHR27vubxnZ88WzZuXjZmufasGWCk5dGB-uj7URG5NFHW5lFSWUjNzWhtAH7r9cdCKcmknyDX6To; SAPISID=wh8KhGr93ZQ385Lh/ANqm3CMImitRM0sH-; SID=FwTjGh1PyEQyBA8ejFhgcUCCy7KmW9UPI1Kstp6hy1lNfWfpXiAk9DBfn59VFFKsnt-Z5g.; SSID= AH39tUnl0zupUfVME;'
      }
    })
    .then(function (htmlString) {
      return parseJSON(htmlString, arr[index].split(','));
    });
  });
 // 91=lhNl2aBMLJ0Ju-AeBLkIqsI1GH2sV5IHlTcXGaEtIzt7O6E6n_rnBpZwF_iYvhmcdYKFeDcohCImXLSp7lWEkx2TXpwDV32_oiWHHt1D6b187xp1rBa1vn4iJtOX2KHZvzUDjWz_9hCAGVxhi8gGe6JcpxGb8UREnBLESgZMHR27vubxnZ88WzZuXjZmufasGWCk5dGB-uj7URG5NFHW5lFSWUjNzWhtAH7r9cdCKcmknyDX6To
}