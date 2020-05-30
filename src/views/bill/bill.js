import template from './bill.html'
import './bill.css'
import database from '../../utils/database'
import store from '../../utils/store'
import config from '../../assets/config'

export default function () {
  const bill = {
    init () {
      const page = document.querySelector('#page-view')
      page.innerHTML = template

      // 根据时间获取数据、渲染
      this.setTime()
      // 监听时间变化
      this.changeTime()
    },
    setTime (year) {
      this.timeText = this.timeText ? this.timeText : document.querySelector('.bill-time-year')
      if (year) {
        this.time = year
      } else {
        this.time = new Date().getFullYear()
      }
      this.timeText.innerHTML = this.time
      this.getData(this.time)
    },
    getData (year) {
      const start = new Date(year, 0, 1)
      const end = new Date(year, 11, 31)
      const range = IDBKeyRange.bound(start, end, false, false)
      database.getMultipleData('accounts', 'time', range).then(res => {
        // 按月分组
        const newArr = this.subGroup(res.data)

        // 按月份计算总支出/收入
        const total = this.calByMonth(newArr)
        // 按类别计算支出/收入
        const typeTotal = this.calByType(newArr, res.data)
        // 渲染
        this.setTemplate(total, typeTotal)
      })
    },
    subGroup (arr) {
      // 储存数据中有的月份
      const timeArr = []
      for (let i = 0; i < arr.length; i++) {
        if (!timeArr.includes(arr[i].time.getMonth())) {
          timeArr.push(arr[i].time.getMonth())
        }
      }
      const newArr = []
      for (let j = 0; j < timeArr.length; j++) {
        const temArr = []
        for (let k = 0; k < arr.length; k++) {
          if (timeArr[j] === arr[k].time.getMonth()) {
            temArr.push(arr[k])
          }
        }
        newArr.push(temArr)
      }
      return newArr
    },
    calByMonth (arr) {
      const totalArr = []
      for (let i = 0; i < arr.length; i++) {
        let expense = 0
        let income = 0
        let surplus = 0
        for (let j = 0; j < arr[i].length; j++) {
          if (arr[i][j].type === 0) {
            expense += Number(arr[i][j].money)
          } else {
            income += Number(arr[i][j].money)
          }
        }
        surplus = income - expense
        const obj = {
          month: arr[i][0].time.getMonth() + 1,
          expense,
          income,
          surplus
        }
        totalArr.push(obj)
      }
      return totalArr
    },
    calByType (arr, arr2) {
      // 储存数据中的支出/收入类别
      const expense = []
      const income = []
      for (let i = 0; i < arr.length; i++) {
        const expType = []
        const inType = []
        const temExpType = []
        const temInType = []
        for (let j = 0; j < arr[i].length; j++) {
          if (arr[i][j].type === 0 && !temExpType.includes(arr[i][j].text)) {
            temExpType.push(arr[i][j].text)
            expType.push({
              month: arr[i][j].time.getMonth(),
              text: arr[i][j].text
            })
          } else if (arr[i][j].type === 1 && !temInType.includes(arr[i][j].text)) {
            temInType.push(arr[i][j].text)
            inType.push({
              month: arr[i][j].time.getMonth(),
              text: arr[i][j].text
            })
          }
        }
        expense.push(expType)
        income.push(inType)
      }
      // 支出
      const expenseArr = []
      for (let i = 0; i < expense.length; i++) {
        const monthArr = []
        if (expense[i].length === 0) continue
        const month = expense[i][0].month
        for (let j = 0; j < expense[i].length; j++) {
          let typetotal = 0
          const text = expense[i][j].text
          for (let k = 0; k < arr2.length; k++) {
            if (arr2[k].type === 0 && arr2[k].time.getMonth() === month && arr2[k].text === text) {
              typetotal += Number(arr2[k].money)
            }
          }
          const obj = {
            month,
            text,
            total: typetotal
          }
          monthArr.push(obj)
        }
        expenseArr.push(monthArr)
      }
      // 收入
      const incomeArr = []
      for (let i = 0; i < income.length; i++) {
        const monthArr = []
        if (income[i].length === 0) continue
        const month = income[i][0].month
        for (let j = 0; j < income[i].length; j++) {
          let typetotal = 0
          const text = income[i][j].text
          for (let k = 0; k < arr2.length; k++) {
            if (arr2[k].type === 1 && arr2[k].time.getMonth() === month && arr2[k].text === text) {
              typetotal += Number(arr2[k].money)
            }
          }
          const obj = {
            month,
            text,
            total: typetotal
          }
          monthArr.push(obj)
        }
        incomeArr.push(monthArr)
      }

      return [expenseArr, incomeArr]
    },
    setTemplate (total, typeTotal) {
      const data = total.reverse()
      this.billTotal = this.billTotal ? this.billTotal : document.querySelector('.bill-total')
      this.billBody = this.billBody ? this.billBody : document.querySelector('.bill-body')
      let totalTpl = ''
      let bodyTpl = ''

      let totalExp = 0
      let totalIn = 0
      let totalSurplus = 0
      for (let i = 0; i < data.length; i++) {
        const month = data[i].month
        const expArr = []
        const inArr = []
        for (let j = 0; j < typeTotal[0].length; j++) {
          if (month - 1 === typeTotal[0][j][0].month) {
            expArr.push(typeTotal[0][j])
          }
        }
        for (let k = 0; k < typeTotal[1].length; k++) {
          if (month - 1 === typeTotal[1][k][0].month) {
            inArr.push(typeTotal[1][k])
          }
        }
        bodyTpl += `<div class="bill-body-item" data-expInfo='${JSON.stringify(expArr)}' data-inInfo='${JSON.stringify(inArr)}'>
          <div class="bill-body-time">${data[i].month}</div>
          <div class="bill-body-in ellipsis">${data[i].income}</div>
          <div class="bill-body-exp ellipsis">${data[i].expense}</div>
          <div class="bill-body-surplus ellipsis">${data[i].surplus}</div>
          <div class="bill-body-todetail">
            <i class="iconfont">&#xe645;</i>
          </div>
        </div>`
        totalExp += data[i].expense
        totalIn += data[i].income
        totalSurplus += data[i].surplus
      }
      totalTpl += `<div class="bill-total-in ellipsis">
        <span class="bill-total-text">总收入：</span>
        <span class="bill-total-in-num">${totalIn}</span>
      </div>
      <div class="bill-total-exp ellipsis">
        <span class="bill-total-text">总支出：</span>
        <span class="bill-total-exp-num ellipsis">${totalExp}</span>
      </div>
      <div class="bill-total-surplus ellipsis">
        <span class="bill-total-text">结余：</span>
        <span class="bill-total-surplus-num ellipsis">${totalSurplus}</span>
      </div>`

      this.billBody.innerHTML = bodyTpl
      this.billTotal.innerHTML = totalTpl

      // 监听点击到排行页
      this.billBody.addEventListener('click', (e) => {
        const target = e.target
        const parent = target.parentNode.parentNode

        if (target.tagName === 'I') {
          const expData = JSON.parse(parent.dataset.expinfo)
          const inData = JSON.parse(parent.dataset.ininfo)
          this.toRank(expData, inData)
        }
      })
    },
    toRank (expData, inData) {
      this.rankPage = this.rankPage ? this.rankPage : document.querySelector('.bill-rank')
      this.rankPage.classList.remove('hidden')
      let tpl = `<div class="bill-rank-head">
        <span class="bill-rank-back">
          <i class="iconfont">&#xe644;</i>
        </span>
      </div>`
      const expenseData = this.sortData(expData, 0)
      const incomeData = this.sortData(inData, 1)
      let exptotal = 0
      let intotal = 0
      let expTpl = `<div class="bill-rank-exp">
      <div class="bill-rank-text">支出排行榜:</div>
      <div class="bill-rank-list">`
      let inTpl = `<div class="bill-rank-in">
      <div class="bill-rank-text">收入排行榜:</div>
      <div class="bill-rank-list">`
      for (let i = 0; i < expenseData.length; i++) {
        exptotal += expenseData[i].total
      }
      for (let i = 0; i < incomeData.length; i++) {
        intotal += incomeData[i].total
      }

      for (let i = 0; i < expenseData.length; i++) {
        const num = expenseData[i].total / exptotal
        const percent = (num * 100).toFixed(2) + '%'
        expTpl += `<div class="bill-rank-in-item">
          <span class="bill-rank-icon">
            <i class="iconfont">${expenseData[i].icon}</i>
          </span>
          <span class="bill-rank-type">${expenseData[i].text}</span>
          <span class="bill-rank-percent">${expenseData[i].total}元-${percent}</span>
        </div>`
      }
      expTpl += `</div>
        </div>`

      for (let j = 0; j < incomeData.length; j++) {
        const num = incomeData[j].total / intotal
        const percent = (num * 100).toFixed(2) + '%'
        inTpl += `<div class="bill-rank-in-item">
          <span class="bill-rank-icon">
            <i class="iconfont">${incomeData[j].icon}</i>
          </span>
          <span class="bill-rank-type">${incomeData[j].text}</span>
          <span class="bill-rank-percent">${incomeData[j].total}元-${percent}</span>
        </div>`
      }
      inTpl += `</div>
        </div>`

      tpl = tpl + expTpl + inTpl + `</div>
        </div>`
      this.rankPage.innerHTML = tpl

      // 监听点击返回
      const back = this.rankPage.querySelector('.bill-rank-back')
      back.addEventListener('click', () => {
        this.rankPage.classList.add('hidden')
      })
    },
    sortData (dataArr, type) {
      if (!this.expIconList) {
        this.expIconList = store.getItem('expIconList') ? store.getItem('expIconList') : config.expTypeIcon
      }
      if (!this.inIconList) {
        this.inIconList = store.getItem('inIconList') ? store.getItem('inIconList') : config.inTypeIcon
      }
      let typeIconList
      if (type === 0) {
        typeIconList = this.expIconList
      } else if (type === 1) {
        typeIconList = this.inIconList
      }
      const res = []

      for (let i = 0; i < dataArr.length; i++) {
        // 添加上icon
        for (let j = 0; j < dataArr[i].length; j++) {
          for (let k = 0; k < typeIconList.length; k++) {
            if (dataArr[i][j].text === typeIconList[k].desc) {
              res.push(dataArr[i][j])
              res[res.length - 1].icon = typeIconList[k].code
            }
          }
        }
      }
      // 排序
      const newArr = res.sort((a, b) => {
        return b.total - a.total
      })
      return newArr
    },
    changeTime () {
      const timeEl = document.querySelector('.bill-time')
      const timeContainer = document.querySelector('.bill-time-container')
      let newPicker
      timeEl.addEventListener('click', () => {
        if (!timeEl.dataset.hasPicker) {
          import('../../components/timePicker/index').then(({ default: time }) => {
            newPicker = Object.create(time)
            newPicker.init({
              el: '.bill-time-container',
              year: true,
              pageName: 'bill'
            })
          })
          timeEl.dataset.hasPicker = true
        }
        timeContainer.classList.toggle('hidden')
      })
      // 点击取消按钮
      window.$myEvent.on('bill-pickerCancel', () => {
        timeContainer.classList.add('hidden')
      })
      // 点击完成按钮
      window.$myEvent.on('bill-pickerDone', (res) => {
        timeContainer.classList.add('hidden')
        // 重新获取数据、渲染
        this.setTime(res[0])
      })
    }
  }
  bill.init()
}
