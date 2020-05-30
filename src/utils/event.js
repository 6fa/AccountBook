(function () {
  const Event = {
    init: function () {
      this.eventList = {}
    },
    on: function (name, cb) {
      if (!this.eventList[name]) {
        this.eventList[name] = []
      }
      this.eventList[name].push(cb)
    },
    emit: function (name, ...args) {
      if (this.eventList[name]) {
        this.eventList[name].forEach(cb => {
          const fn = (args) => {
            cb(args)
          }
          fn(...args)
          // 不能直接写 cb(...args)
        })
      }
    }
  }
  const event = Object.create(Event)
  event.init()
  window.$myEvent = event
})()
