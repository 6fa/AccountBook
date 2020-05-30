import './record.css'
import template from './record.html'
import config from '../../assets/config'
import store from '../../utils/store'
import dataBase from '../../utils/database'

export default function () {
  const record = {
    init: function () {
      this.page = document.querySelector('#page-view')
      this.expIconList = store.getItem('expIconList') ? store.getItem('expIconList') : config.expTypeIcon
      this.inIconList = store.getItem('inIconList') ? store.getItem('inIconList') : config.inTypeIcon

      // currentType 0:支出 1:收入
      this.currentType = 0
      this.time = ''
      this.currentIcon = ''
      this.currentIcontext = ''

      // 处理模板
      this.setTemplate()
      // 设置时间
      this.setTime()
      // 监听切换支出/收入选项卡
      this.changeType()
      // 监听切换时间
      this.changeTime()
      // 监听点击记账图标
      this.accounting()
      // 监听点击设置图标
      this.setting()
      // 监听记账操作
      this.add()
    },
    setTemplate: function () {
      let tpl = template
      const type = [this.expIconList, this.inIconList]
      const typeName = ['expIconList', 'inIconList']
      for (let i = 0; i < 2; i++) {
        let typeTpl = ''
        const typeNameStr = typeName[i]
        const len = type[i].length
        for (let j = 0; j < len; j++) {
          typeTpl += `<div class="re-account-item" data-icon=${type[i][j].code} data-text=${type[i][j].desc}>
            <div class="re-account-icon">
              <i class="iconfont">${type[i][j].code}</i>
            </div>
            <div class="re-account-text">${type[i][j].desc}</div>
          </div>`
        }
        typeTpl += `<div class="re-setting">
          <div class="re-account-icon">
            <i class="iconfont icon-you"></i>
          </div>
          <div class="re-account-text">设置</div>
        </div>`
        tpl = tpl.replace(new RegExp('{{' + typeNameStr + '}}'), typeTpl)
      }
      this.page.innerHTML = tpl
    },
    changeType: function () {
      // 头部选项卡
      const typeBar = document.querySelector('.re-account-type')
      const childs = typeBar.querySelectorAll('div')
      this.expType = document.querySelector('.re-account-exptype')
      this.inType = document.querySelector('.re-account-intype')
      // 内容
      typeBar.addEventListener('click', (e) => {
        if (e.currentTarget !== e.target) {
          for (let i = 0; i < childs.length; i++) {
            childs[i].classList.remove('active')
            if (e.target === childs[i]) {
              this.currentType = i
            }
          }
          e.target.classList.add('active')
          // 内容切换
          if (this.currentType === 0) {
            this.expType.classList.remove('hidden')
            this.inType.classList.add('hidden')
          } else if (this.currentType === 1) {
            this.expType.classList.add('hidden')
            this.inType.classList.remove('hidden')
          }
        }
      })
    },
    changeTime: function () {
      const timeEl = document.querySelector('.re-time')
      const timeContainer = document.querySelector('.timepicker-container')
      let newPicker
      timeEl.addEventListener('click', () => {
        if (!timeEl.dataset.hasPicker) {
          import('../../components/timePicker/index').then(({ default: time }) => {
            newPicker = Object.create(time)
            newPicker.init({
              el: '.timepicker-container',
              year: true,
              month: true,
              date: true,
              pageName: 'record'
            })
          })
          timeEl.dataset.hasPicker = true
        }
        timeContainer.classList.toggle('hidden')
      })
      // 点击取消按钮
      window.$myEvent.on('record-pickerCancel', () => {
        console.log('xxx')
        timeContainer.classList.add('hidden')
      })
      // 点击完成按钮
      window.$myEvent.on('record-pickerDone', (res) => {
        console.log(res)
        timeContainer.classList.add('hidden')
        // 设置时间文本
        this.setTime(res)
      })
    },
    setTime: function (arr) {
      if (arr) {
        let time = ''
        for (let i = 0; i < arr.length; i++) {
          time += arr[i]
          if (i !== arr.length - 1) {
            time += '/'
          }
        }
        this.time = time
      } else {
        const newDate = new Date()
        const year = newDate.getFullYear()
        const month = newDate.getMonth() + 1
        const date = newDate.getDate()
        this.time = year + '/' + month + '/' + date
      }

      document.querySelector('.re-time-text').innerHTML = this.time
    },
    accounting: function () {
      const expItemList = this.expType.querySelectorAll('.re-account-item')
      const inItemList = this.inType.querySelectorAll('.re-account-item')
      const reAdd = document.querySelector('.re-add-mask')

      for (let i = 0; i < 2; i++) {
        let typeList
        let typeCon
        if (i === 0) {
          typeList = expItemList
          typeCon = this.expType
        } else {
          typeList = inItemList
          typeCon = this.inType
        }

        typeCon.addEventListener('click', (e) => {
          for (let j = 0; j < typeList.length; j++) {
            typeList[j].classList.remove('active')
          }
          if (e.target.tagName === 'I') {
            const item = e.target.parentNode.parentNode
            if (item.classList.contains('re-setting')) return
            item.classList.add('active')
            this.currentIcon = item.dataset.icon
            this.currentIcontext = item.dataset.text
            // 弹出记账窗口
            reAdd.classList.remove('hidden')
          }
        })
      }
    },
    setting: function () {
      // 支出
      const expTypeSetting = this.expType.querySelector('.re-setting')
      // 收入
      const inTypeSetting = this.inType.querySelector('.re-setting')
      expTypeSetting.addEventListener('click', () => {
        window.$router.push('/setting?type=exp')
      })
      inTypeSetting.addEventListener('click', () => {
        window.$router.push('/setting?type=in')
      })
    },
    add: function () {
      const reAdd = document.querySelector('.re-add-mask')
      const moneyInput = reAdd.querySelector('.re-add-money-input')
      const noteInput = reAdd.querySelector('.re-add-note-input')
      const cancelBtn = reAdd.querySelector('.re-add-cancel')
      const doneBtn = reAdd.querySelector('.re-add-done')

      // 输入框内容是否正确
      let flag = false
      // 关闭弹窗
      const closeAddBox = function () {
        reAdd.classList.add('hidden')
        moneyInput.value = ''
        noteInput.value = ''
        moneyInput.classList.remove('warning')
      }
      cancelBtn.addEventListener('click', () => {
        closeAddBox()
      })
      doneBtn.addEventListener('click', () => {
        if (!moneyInput.value || flag === false) {
          moneyInput.classList.add('warning')
          return
        }
        if (flag) {
          dataBase.addData('accounts', {
            time: new Date(this.time),
            money: moneyInput.value,
            note: noteInput.value,
            type: this.currentType,
            icon: this.currentIcon,
            text: this.currentIcontext
          }).then(res => {
            console.log(res)
          })
        }
        closeAddBox()
      })
      moneyInput.addEventListener('input', () => {
        const reg = /^[0-9]*[.]\d{1,2}$|^[1-9][0-9]*$/
        if (!reg.test(moneyInput.value)) {
          moneyInput.classList.add('warning')
          flag = false
        } else {
          moneyInput.classList.remove('warning')
          flag = true
        }
      })
    }
  }
  record.init()
}
