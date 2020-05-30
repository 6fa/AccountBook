const dataBase = {
  // configs = {
  //   keyPath: '',
  //   index: [],
  //   indexUnique: false/true
  // }
  initDB: function (dbName, version, storeName, configs) {
    const indexeddb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
    if (!indexeddb) {
      alert('浏览器不支持indexedDB')
    }
    const request = indexeddb.open(dbName, version || 1)
    request.onsuccess = e => {
      this.db = e.target.result
      console.log('数据库打开成功')
    }
    request.onerror = e => {
      console.log('数据库创建失败', e)
    }
    request.onupgradeneeded = e => {
      this.db = e.target.result
      let store
      console.log(e)
      if (storeName && !this.db.objectStoreNames.contains(storeName)) {
        if (!configs.keyPath) {
          store = this.db.createObjectStore(storeName, {
            autoIncrement: true
          })
        } else {
          store = this.db.createObjectStore(storeName, {
            keyPath: configs.keyPath
          })
        }
        if (configs.index.length > 0) {
          // 新建索引
          for (let i = 0; i < configs.index.length; i++) {
            store.createIndex(configs.index[i], configs.index[i], { unique: configs.indexUnique })
          }
        }
      }
      console.log('数据库创建成功，version：', version)
    }
  },
  addData: function (storeName, data) {
    const transaction = this.db.transaction(storeName, 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.add(data)
    let res
    return new Promise((resolve, reject) => {
      request.onsuccess = e => {
        res = {
          error: false,
          info: '增加成功'
        }
        resolve(res)
      }
      request.onerror = e => {
        res = {
          error: true,
          info: '增加失败',
          errInfo: e
        }
        reject(res)
      }
    })
  },
  updateData: function (storeName, data) {
    const transaction = this.db.transaction(storeName, 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.put(data)
    let res
    return new Promise((resolve, reject) => {
      request.onsuccess = e => {
        res = {
          error: false,
          info: '更新成功'
        }
        resolve(res)
      }
      request.onerror = e => {
        res = {
          error: true,
          info: '更新失败',
          errInfo: e
        }
        reject(res)
      }
    })
  },
  deleteData: function (storeName, key) {
    const transaction = this.db.transaction(storeName, 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.delete(key)
    let res
    return new Promise((resolve, reject) => {
      request.onsuccess = e => {
        res = {
          error: false,
          info: '删除成功'
        }
        resolve(res)
      }
      request.onerror = e => {
        res = {
          error: true,
          info: '删除失败',
          errInfo: e
        }
        reject(res)
      }
    })
  },
  getData: function (storeName, key) {
    const transaction = this.db.transaction(storeName, 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.get(key)
    let res
    return new Promise((resolve, reject) => {
      request.onsuccess = e => {
        const data = e.target.result
        res = {
          error: false,
          info: '获取数据成功',
          data: data
        }
        resolve(res)
      }
      request.onerror = e => {
        res = {
          error: false,
          info: '获取数据失败',
          errInfo: e
        }
        reject(res)
      }
    })
  },
  getDataByIndex: function (storeName, index, indexKey) {
    const transaction = this.db.transaction(storeName, 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const indexReq = objectStore.index(index)
    const request = indexReq.get(indexKey)
    let res
    return new Promise((resolve, reject) => {
      request.onsuccess = e => {
        const data = e.target.result
        res = {
          error: false,
          info: '获取数据成功',
          data: data
        }
        resolve(res)
      }
      request.onerror = e => {
        res = {
          error: false,
          info: '获取数据失败',
          errInfo: e
        }
        reject(res)
      }
    })
  },
  getMultipleData: function (storeName, index, range) {
    const transaction = this.db.transaction(storeName, 'readwrite')
    const objectStore = transaction.objectStore(storeName)
    const indexReq = objectStore.index(index)
    const cursorReq = indexReq.openCursor(range)
    const resArr = []
    const primaryKeys = []

    return new Promise((resolve, reject) => {
      cursorReq.onsuccess = e => {
        const cursor = e.target.result
        if (cursor) {
          resArr.push(cursor.value)
          primaryKeys.push(cursor.primaryKey)
          cursor.continue()
        } else {
          resolve({
            error: false,
            info: '获取成功',
            data: resArr,
            key: primaryKeys
          })
        }
      }
      cursorReq.onerror = e => {
        const res = {
          error: false,
          info: '获取失败',
          errInfo: e
        }
        reject(res)
      }
    })
  },
  closeDB: function () {
    this.db.close()
  }

}

export default dataBase
