import './index.css'
import template from './index.html'
// import 'intersection-observer'

const timePiker = {
  init: function (options) {
    this.loaded = false
    this.pageName = options.pageName || ''
    // 是否显示年、月、日
    this.showYear = options.year === true
    this.showMonth = options.month === true
    this.showDate = options.date === true
    // 日不能单独存在
    if (this.showDate && !this.showYear && !this.showMonth) {
      this.showYear = true
      this.showMonth = true
    }
    // 将选择器插入的dom节点
    const el = options.el ? options.el : 'body'
    this.element = document.querySelector(el)

    // 年份是上下无限加载新的年份，月份、日期都是无限循环
    this.yearList = this.getYearList()
    this.monthList = this.getMonthList()
    this.dateList = this.getDateList()

    // 内容渲染
    let content = ''
    if (this.showYear) {
      content += '<div class="year  timePicker-col">yearTpl</div>'
      const yearTpl = this.setTemplate({ list: this.yearList, type: 'year' })
      content = content.replace(/yearTpl/, yearTpl)
    }
    if (this.showMonth) {
      content += '<div class="month timePicker-col">monthTpl</div>'
      const monthTpl = this.setTemplate({ list: this.monthList, type: 'month' })
      content = content.replace(/monthTpl/, monthTpl)
    }
    if (this.showDate) {
      content += '<div class="date timePicker-col">dateTpl</div>'
      const dateTpl = this.setTemplate({ list: this.dateList, type: 'date' })
      content = content.replace(/dateTpl/, dateTpl)
    }

    let str = template
    str = str.replace(/templateContent/, content)
    this.element.innerHTML = str

    // 滚动的元素
    this.yearScrollEl = this.element.querySelector('.timePicker-col.year')
    this.monthScrollEl = this.element.querySelector('.timePicker-col.month')
    this.dateScrollEl = this.element.querySelector('.timePicker-col.date')
    this.itemHeight = this.element.querySelector('li').getBoundingClientRect().height

    // 设置最开始显示的时间
    this.setScroll()
    // 设置监听事件
    this.addEvent()

    // 返回的结果
    this.timeResult = {
      year: '',
      month: '',
      date: ''
    }
  },
  getYearList: function (n) {
    const year = n ? new Date(n).getFullYear() : new Date().getFullYear()
    const arr = []
    for (let i = year - 10; i <= year + 10; i++) {
      arr.push(i)
    }
    return arr
  },
  getDateList: function (y, m) {
    const year = new Date().getFullYear()
    const month = new Date().getMonth()
    let days
    if (y && m) {
      days = new Date(y, m + 1, 0).getDate()
    } else {
      days = new Date(year, month + 1, 0).getDate()
    }
    const arr = []
    for (let i = 1; i <= days; i++) {
      arr.push(i)
    }

    return arr.concat(arr)
  },
  getMonthList: function () {
    const arr = []
    for (let i = 0; i < 12; i++) {
      arr.push(i + 1)
    }
    return arr.concat(arr)
  },
  setTemplate: function ({ list, type }) {
    let templ = '<ul>'
    for (let i = 0; i < list.length; i++) {
      if (i === 0) {
        templ += `<li id="first" data-index=${i} data-type=${type}>${list[i]}</li>`
      } else if (i === list.length - 1) {
        templ += `<li id="last" data-index=${i} data-type=${type}>${list[i]}</li>`
      } else {
        templ += `<li data-index=${i} data-type=${type}>${list[i]}</li>`
      }
    }
    templ += '</ul>'
    return templ
  },
  setScroll: function () {
    const month = new Date().getMonth() + 1
    const date = new Date().getDate()

    // 年
    if (this.yearScrollEl) {
      this.yearScrollEl.scrollTop = this.itemHeight * (this.yearList.length / 2 - 3.5)
    }
    // 月
    if (this.monthScrollEl) {
      const monthArr = this.monthList.slice(0, 4)
      if (monthArr.includes(month)) {
        this.monthScrollEl.scrollTop = this.itemHeight * (this.monthList.length / 2 + month) - (4 * this.itemHeight)
      } else {
        this.monthScrollEl.scrollTop = this.itemHeight * month - (4 * this.itemHeight)
        console.log(this.monthScrollEl.scrollTop)
      }
    }
    // 日
    if (this.dateScrollEl) {
      const dateArr = this.dateList.slice(0, 4)
      if (dateArr.includes(date)) {
        this.dateScrollEl.scrollTop = this.itemHeight * (this.dateList.length / 2 + date) - (4 * this.itemHeight)
      } else {
        this.dateScrollEl.scrollTop = this.itemHeight * date - (4 * this.itemHeight)
      }
    }
  },
  addEvent: function () {
    this.listenScroll()
    // 监听进入选择框的元素
    this.startObserver()
    // 点击取消按钮
    this.clickCancel()
    // 点击完成按钮
    this.clickDone()
  },
  listenScroll: function () {
    this.yearScrollEl.addEventListener('scroll', (e) => {
      console.log(e.target.scrollTop)
    })
  },
  startObserver: function () {
    // 监测列表的最后/第一个元素
    this.firstAndLastItem = new IntersectionObserver((entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          const itemDom = item.target
          const itemIndex = Number(itemDom.dataset.index)
          const type = itemDom.dataset.type
          if (itemDom.id === 'last') {
            // 最后一个元素进入区域
            switch (type) {
              case 'year':
                setTimeout(() => {
                  this.yearChange(itemDom, this.itemHeight * (this.yearList.length / 2 - 6.5))
                }, 500)
                break
              case 'month':
                // this.monthScrollEl.scrollTop = this.itemHeight * (itemIndex - this.monthList.length / 2 - 6)
                // this.monthScrollEl.scrollTo(this.itemHeight * (itemIndex - this.monthList.length / 2 - 6))
                setTimeout(() => {
                  this.monthScrollEl.scrollTop = this.itemHeight * (itemIndex - this.monthList.length / 2 - 6)
                }, 500)
                break
              case 'date':
                setTimeout(() => {
                  this.dateScrollEl.scrollTop = this.itemHeight * (itemIndex - this.dateList.length / 2 - 6)
                }, 500)
                break
            }
          } else if (itemDom.id === 'first') {
            // 第一个元素进入区域
            switch (type) {
              case 'year':
                setTimeout(() => {
                  this.yearChange(itemDom, this.itemHeight * (this.yearList.length / 2 - 1))
                }, 500)
                break
              case 'month':
                setTimeout(() => {
                  this.monthScrollEl.scrollTop = this.itemHeight * this.monthList.length / 2
                }, 500)
                break
              case 'date':
                setTimeout(() => {
                  this.dateScrollEl.scrollTop = this.itemHeight * this.dateList.length / 2
                }, 500)
                break
            }
          }
        }
      })
    }, {
      root: this.element.querySelector('.timePicker-content')
    })
    this.element.querySelectorAll('li').forEach((item) => {
      this.firstAndLastItem.observe(item)
    })
    // 监测进入选择框的元素
    this.selectedItem = new IntersectionObserver((entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          // 让元素刚好进入选择框
          const itemDom = item.target
          const itemIndex = Number(itemDom.dataset.index)
          const type = itemDom.dataset.type
          switch (type) {
            case 'year':
              this.yearScrollEl.scrollTop = this.itemHeight * (itemIndex + 1) - (4 * this.itemHeight)
              this.timeResult[type] = itemDom.innerHTML
              break
            case 'month':
              console.log('滚轮里面的元素: 月份')
              this.monthScrollEl.scrollTop = (itemIndex + 1) * this.itemHeight - (4 * this.itemHeight)
              this.timeResult[type] = itemDom.innerHTML
              // 月份改变，让日期改变  页面刚显示时不执行下面这句
              this.dateChange(itemDom)
              this.loaded = true
              break
            case 'date':
              console.log('滚轮里面的元素: 日期')
              this.dateScrollEl.scrollTop = (itemIndex + 1) * this.itemHeight - (4 * this.itemHeight)
              this.timeResult[type] = itemDom.innerHTML
              break
          }
        }
      })
    }, {
      root: this.element.querySelector('.timePicker-wheel'),
      threshold: [0.6]
    })
    this.element.querySelectorAll('li').forEach((item) => {
      this.selectedItem.observe(item)
    })
  },
  dateChange: function (itemDom) {
    if (!this.loaded || !this.dateScrollEl) return
    const y = this.timeResult.year
    const m = Number(itemDom.innerHTML) - 1
    const d = Number(this.timeResult.date)
    let dateTemplate = ''

    this.dateList = this.getDateList(y, m)
    dateTemplate = this.setTemplate({ list: this.dateList, type: 'date' })
    this.element.querySelector('.date').innerHTML = dateTemplate

    const dateArrHead = this.dateList.slice(0, 4)
    // const dateArrTail = this.dateList.slice(-4)
    if (dateArrHead.includes(d)) {
      this.dateScrollEl.scrollTop = this.itemHeight * (this.dateList.length / 2 + d - 4)
    } else {
      this.dateScrollEl.scrollTop = this.itemHeight * (d - 4)
    }

    this.element.querySelectorAll('.date li').forEach((item) => {
      this.firstAndLastItem.observe(item)
      this.selectedItem.observe(item)
    })
  },
  yearChange: function (itemDom, scrolltop) {
    this.yearList = this.getYearList(itemDom.innerHTML)
    console.log('this.yearList', this.yearList)
    const yearTemplate = this.setTemplate({ list: this.yearList, type: 'year' })
    this.element.querySelector('.year').innerHTML = yearTemplate
    this.yearScrollEl.scrollTop = scrolltop
    this.element.querySelectorAll('.year li').forEach((item) => {
      this.selectedItem.observe(item)
      this.firstAndLastItem.observe(item)
    })
  },
  clickCancel: function () {
    this.cancelBtn = this.cancelBtn || this.element.querySelector('.cancel')
    this.cancelBtn.addEventListener('click', () => {
      window.$myEvent.emit(`${this.pageName}-pickerCancel`)
      // 重置时间
      // this.setScroll()
    })
  },
  clickDone: function () {
    this.doneBtn = this.doneBtn || this.element.querySelector('.done')
    this.doneBtn.addEventListener('click', () => {
      window.$myEvent.emit(`${this.pageName}-pickerDone`, [this.timeResult.year, this.timeResult.month, this.timeResult.date])
      // // 重置时间
      // this.setScroll()
    })
  }
}

export default timePiker
