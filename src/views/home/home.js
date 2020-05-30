import template from './home.html'
import './home.css'
import database from '../../utils/database'

export default function () {
  const home = {
    init () {
      const page = document.querySelector('#page-view')
      page.innerHTML = template
      this.timeYear = new Date().getFullYear()
      this.timeMonth = new Date().getMonth() + 1

      // 根据时间获取数据、渲染
      this.setTime()
      // 监听时间变化
      this.changeTime()
    },
    changeTime () {
      const timeEl = document.querySelector('.time-arrow')
      const timeContainer = document.querySelector('.home-time-container')
      let newPicker
      timeEl.addEventListener('click', () => {
        if (!timeEl.dataset.hasPicker) {
          import('../../components/timePicker/index').then(({ default: time }) => {
            newPicker = Object.create(time)
            newPicker.init({
              el: '.home-time-container',
              year: true,
              month: true,
              pageName: 'home'
            })
          })
          timeEl.dataset.hasPicker = true
        }
        timeContainer.classList.toggle('hidden')
      })
      // 点击取消按钮
      window.$myEvent.on('home-pickerCancel', () => {
        timeContainer.classList.add('hidden')
      })
      // 点击完成按钮
      window.$myEvent.on('home-pickerDone', (res) => {
        timeContainer.classList.add('hidden')
        // 设置时间文本
        this.setTime(res)
      })
    },
    setTime (arr) {
      if (arr) {
        this.timeYear = Number(arr[0])
        this.timeMonth = Number(arr[1])
      } else {
        this.timeYear = new Date().getFullYear()
        this.timeMonth = new Date().getMonth() + 1
      }

      this.timeYearEl = this.timeYearEl ? this.timeYearEl : document.querySelector('.time-year')
      this.timeMonthEl = this.timeMonthEl ? this.timeMonthEl : document.querySelector('.time-month')
      this.timeYearEl.innerHTML = this.timeYear
      this.timeMonthEl.innerHTML = this.timeMonth
      // 记账数据
      this.getData(this.timeYear, this.timeMonth)
    },
    // 获取某年某月的记账记录
    getData (year, month) {
      const dateStart = new Date(year + '/' + month + '/' + 1)
      const days = new Date(Number(year), Number(month), 0).getDate()
      const dateEnd = new Date(year + '/' + month + '/' + days)
      database.getMultipleData('accounts', 'time', IDBKeyRange.bound(dateStart, dateEnd, false, false))
        .then(res => {
          // 如果数据为空
          if (res.data.length === 0) {
            console.log('无数据')
            this.listContainer = this.listContainer ? this.listContainer : document.querySelector('.home-detail-list')
            this.listContainer.innerHTML = '<div class="no-data">无数据</div>'
            this.setTotal([], [])
            return
          }
          console.log(res)
          // 将key值分配给对于元素
          const setArr = this.distribution(res.data.reverse(), res.key.reverse())
          // 对同一天的数据进行分组
          const newArr = this.subgroup(setArr)
          // 渲染
          this.setAccountsTpl(newArr)
        })
    },
    distribution (data, key) {
      const newArr = []
      for (let i = 0; i < data.length; i++) {
        newArr[i] = data[i]
        newArr[i].key = key[i]
      }
      return newArr
    },
    // 分组
    subgroup (arr) {
      const timeArr = []
      for (let i = 0; i < arr.length; i++) {
        const time = arr[i].time.getTime()
        if (!timeArr.includes(time)) {
          timeArr.push(time)
        }
      }
      const newArr = []
      for (let j = 0; j < timeArr.length; j++) {
        const subArr = []
        for (let k = 0; k < arr.length; k++) {
          if (timeArr[j] === arr[k].time.getTime()) {
            subArr.push(arr[k])
          }
        }
        newArr.push(subArr)
      }
      return newArr
    },
    // 重新渲染
    setAccountsTpl (arr) {
      this.listContainer = this.listContainer ? this.listContainer : document.querySelector('.home-detail-list')
      let tpl = ''
      // 总支出
      const expTotal = []
      // 总收入
      const inTotal = []
      for (let i = 0; i < arr.length; i++) {
        let subTpl = `<div class="detail-item">
          <div class="detail-item-time">${arr[i][0].time.getMonth() + 1 + '/' + arr[i][0].time.getDate()}</div>`
        for (let j = 0; j < arr[i].length; j++) {
          const sign = arr[i][j].type === 0 ? '-' : '+'
          const info = JSON.stringify(arr[i][j])
          if (arr[i][j].type === 0) {
            expTotal.push(arr[i][j].money)
          } else {
            inTotal.push(arr[i][j].money)
          }
          subTpl += `<div class="detail-itemList">
            <div class="detail-itemList-type">
              <i class="iconfont todetail" data-info='${info}'>&#xe644;</i>
              <i class="iconfont">${arr[i][j].icon}</i>
              <span>${arr[i][j].text}</span>
            </div>
            <div class="detail-itemList-num">${sign + arr[i][j].money}</div>
          </div>`
        }
        subTpl += '</div>'
        tpl += subTpl
      }
      this.listContainer.innerHTML = tpl
      // 监听点击到详情页
      this.toDetail()
      // 总支出/总收入
      this.setTotal(expTotal, inTotal)
    },
    toDetail () {
      this.infoLayer = this.infoLayer ? this.infoLayer : document.querySelector('.home-info-mask')
      this.infoEl = this.infoEl ? this.infoEl : document.querySelector('.home-info-content')
      this.infoDelete = this.infoDelete ? this.infoDelete : document.querySelector('.home-info-delete')
      this.infoClose = this.infoClose ? this.infoClose : document.querySelector('.home-info-close')

      this.listContainer.addEventListener('click', (e) => {
        const target = e.target
        if (target.dataset.info) {
          this.infoLayer.classList.remove('hidden')
          let tpl = ''
          const info = JSON.parse(target.dataset.info)
          const time = info.time.split('T')[0]
          const type = info.type === 0 ? '支出' : '收入'
          this.currentKey = info.key
          tpl += `<div class="home-info-date home-info-item">
            <span>日期：</span>
            <span>${time}</span>
          </div>
          <div class="home-info-type home-info-item">
            <span>类型：</span>
            <span>${type}</span>
          </div>
          <div class="home-info-money home-info-item">
            <span>金额：</span>
            <span>${info.money}</span>
          </div>
          <div class="home-info-note home-info-item">
            <span>备注：</span>
            <span>${info.note}</span>
          </div>`

          this.infoEl.innerHTML = tpl
        }
      })
      this.infoDelete.addEventListener('click', () => {
        console.log(this.currentKey)
        database.deleteData('accounts', this.currentKey).then(res => {
          console.log(res)
        })
        this.infoLayer.classList.add('hidden')
        this.getData(this.timeYear, this.timeMonth)
      })
      this.infoClose.addEventListener('click', () => {
        this.infoLayer.classList.add('hidden')
      })
    },
    setTotal (expArr, inArr) {
      console.log('setTotal')
      const arr = [expArr, inArr]
      const res = []
      this.income = this.income ? this.income : document.querySelector('.income-num')
      this.expense = this.expense ? this.expense : document.querySelector('.expense-num')
      for (let i = 0; i < arr.length; i++) {
        let total = 0
        for (let j = 0; j < arr[i].length; j++) {
          total += Number(arr[i][j])
        }
        res.push(total)
      }
      this.expense.innerHTML = -res[0]
      this.income.innerHTML = res[1]
    }
  }
  home.init()
}
